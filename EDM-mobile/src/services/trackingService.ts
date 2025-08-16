import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyRecord } from '../types/tracking';
import firebaseService from './firebaseService';
import { activityTrackingService } from './activityTrackingService';
import { convertToFirebaseFormat, convertFromFirebaseFormat } from '../utils/dataAdapter';

class TrackingService {
  private async getTrackingKey(userId: string, date: string): Promise<string> {
    return `tracking_${userId}_${date}`;
  }

  async createTracking(userId: string, date: string, data: DailyRecord): Promise<DailyRecord> {
    const payload: DailyRecord = { ...(data || {}), date } as DailyRecord;
    
    try {
      // Convert and save to Firebase with new format
      const firebaseData = convertToFirebaseFormat(payload, userId);
      await firebaseService.saveTracking(firebaseData);
      
              // Track the activity
        activityTrackingService.trackDataEntry('sleep', firebaseData, 'TrackingScreen');
      
      console.log('✅ Tracking data saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving to Firebase, using local storage:', error);
    }
    
    // Also save locally as backup
    const key = await this.getTrackingKey(userId, date);
    await AsyncStorage.setItem(key, JSON.stringify(payload));
    
    return payload;
  }

  async getTrackingByUser(userId: string): Promise<DailyRecord[]> {
    try {
      // Try Firebase first
      const firebaseData = await firebaseService.getUserTracking(userId, 30);
      if (firebaseData && firebaseData.length > 0) {
        console.log('✅ Loaded tracking data from Firebase');
        return firebaseData.map(doc => convertFromFirebaseFormat(doc));
      }
    } catch (error) {
      console.error('❌ Error loading from Firebase, using local storage:', error);
    }

    // Fallback to local storage
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
    try {
      // Try Firebase first
      const firebaseData = await firebaseService.getTrackingByDate(userId, date);
      if (firebaseData) {
        console.log('✅ Loaded tracking data from Firebase');
        return {
          date: firebaseData.date,
          sleep: firebaseData.sleep,
          meals: firebaseData.meals,
          digestive: firebaseData.digestive
        };
      }
    } catch (error) {
      console.error('❌ Error loading from Firebase, using local storage:', error);
    }
    
    // Fallback to local storage
    const key = await this.getTrackingKey(userId, date);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async updateTracking(userId: string, date: string, data: Partial<DailyRecord>): Promise<DailyRecord> {
    // Get existing data (from Firebase first, then local)
    const existingRecord = await this.getTrackingByDate(userId, date);
    const base = existingRecord || { date };
    const updatedData: DailyRecord = { ...base, ...data, date } as DailyRecord;
    
    try {
      // Update in Firebase
      await firebaseService.saveTracking({
        userId,
        date,
        sleep: updatedData.sleep,
        meals: updatedData.meals,
        digestive: updatedData.digestive
      });
      console.log('✅ Tracking data updated in Firebase');
    } catch (error) {
      console.error('❌ Error updating in Firebase, using local storage:', error);
    }
    
    // Also update locally
    const key = await this.getTrackingKey(userId, date);
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

  // Nouvelle méthode pour écouter les changements en temps réel
  subscribeToUserTracking(userId: string, callback: (records: DailyRecord[]) => void) {
    return firebaseService.subscribeToUserTracking(userId, (trackingDocs) => {
      const dailyRecords = trackingDocs.map(doc => ({
        date: doc.date,
        sleep: doc.sleep,
        meals: doc.meals,
        digestive: doc.digestive
      }));
      callback(dailyRecords);
    });
  }
}

export const trackingService = new TrackingService(); 