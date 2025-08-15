import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyRecord } from '../types/tracking';

class TrackingService {
  private async getTrackingKey(userId: string, date: string): Promise<string> {
    return `tracking_${userId}_${date}`;
  }

  async createTracking(userId: string, date: string, data: DailyRecord): Promise<DailyRecord> {
    const key = await this.getTrackingKey(userId, date);
    const payload: DailyRecord = { ...(data || {}), date } as DailyRecord;
    await AsyncStorage.setItem(key, JSON.stringify(payload));
    return payload;
  }

  async getTrackingByUser(userId: string): Promise<DailyRecord[]> {
    const keys = await AsyncStorage.getAllKeys();
    const trackingKeys = keys.filter(key => key.startsWith(`tracking_${userId}_`));
    const records = await Promise.all(
      trackingKeys.map(async key => {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      })
    );
    return records.filter(record => record !== null);
  }

  async getTrackingByDate(userId: string, date: string): Promise<DailyRecord | null> {
    const key = await this.getTrackingKey(userId, date);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async updateTracking(userId: string, date: string, data: Partial<DailyRecord>): Promise<DailyRecord> {
    const key = await this.getTrackingKey(userId, date);
    const existingData = await AsyncStorage.getItem(key);
    const base = existingData ? JSON.parse(existingData) : { date };
    const updatedData: DailyRecord = { ...base, ...data, date } as DailyRecord;
    await AsyncStorage.setItem(key, JSON.stringify(updatedData));
    return updatedData;
  }

  async deleteTracking(userId: string, date: string): Promise<void> {
    const key = await this.getTrackingKey(userId, date);
    await AsyncStorage.removeItem(key);
  }

  async deleteAllUserTracking(userId: string): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const trackingKeys = keys.filter(key => key.startsWith(`tracking_${userId}_`));
    await Promise.all(trackingKeys.map(key => AsyncStorage.removeItem(key)));
  }
}

export const trackingService = new TrackingService(); 