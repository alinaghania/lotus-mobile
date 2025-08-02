import { trackingService } from './trackingService';
import { AnalyticsData, DailyRecord, HealthScore } from '../types/tracking';

class AnalyticsService {
  async getAnalytics(userId: string, startDate: string, endDate: string): Promise<AnalyticsData> {
    const records = await trackingService.getTrackingByUser(userId);
    const filteredRecords = records.filter(record => 
      record.date >= startDate && record.date <= endDate
    );

    return {
      sleepData: this.analyzeSleepData(filteredRecords),
      symptomsData: this.analyzeSymptomsData(filteredRecords),
      periodSymptomData: this.analyzePeriodSymptomCorrelation(filteredRecords)
    };
  }

  private analyzeSleepData(records: DailyRecord[]) {
    const sleepHours = records
      .filter(record => record.sleep?.duration)
      .map(record => record.sleep!.duration);

    return {
      average: sleepHours.length > 0 
        ? sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length 
        : 0,
      data: records.map(record => ({
        date: record.date,
        hours: record.sleep?.duration || 0
      }))
    };
  }

  private analyzeSymptomsData(records: DailyRecord[]) {
    const symptoms = new Map<string, number>();
    records.forEach(record => {
      record.symptoms?.forEach(symptom => {
        symptoms.set(symptom, (symptoms.get(symptom) || 0) + 1);
      });
    });

    return Array.from(symptoms.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  private analyzePeriodSymptomCorrelation(records: DailyRecord[]) {
    const withPeriod = records.filter(record => record.period?.active);
    const withoutPeriod = records.filter(record => !record.period?.active);

    const avgSymptomsWithPeriod = withPeriod.reduce(
      (acc, record) => acc + (record.symptoms?.length || 0),
      0
    ) / (withPeriod.length || 1);

    const avgSymptomsWithoutPeriod = withoutPeriod.reduce(
      (acc, record) => acc + (record.symptoms?.length || 0),
      0
    ) / (withoutPeriod.length || 1);

    return {
      withPeriod: avgSymptomsWithPeriod,
      withoutPeriod: avgSymptomsWithoutPeriod,
      correlation: avgSymptomsWithPeriod - avgSymptomsWithoutPeriod
    };
  }

  async calculateHealthScore(userId: string, date: string): Promise<HealthScore> {
    const record = await trackingService.getTrackingByDate(userId, date);
    if (!record) {
      return { total: 0, breakdown: {} };
    }

    const breakdown = {
      sleep: this.calculateSleepScore(record),
      symptoms: this.calculateSymptomsScore(record),
      activity: this.calculateActivityScore(record),
      hydration: this.calculateHydrationScore(record)
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.keys(breakdown).length;

    return {
      total: Math.round(total * 100) / 100,
      breakdown
    };
  }

  private calculateSleepScore(record: DailyRecord): number {
    if (!record.sleep?.duration) return 0;
    const hours = record.sleep.duration;
    if (hours >= 7 && hours <= 9) return 1;
    if (hours >= 6 && hours <= 10) return 0.7;
    return 0.3;
  }

  private calculateSymptomsScore(record: DailyRecord): number {
    const count = record.symptoms?.length || 0;
    if (count === 0) return 1;
    if (count <= 2) return 0.7;
    if (count <= 4) return 0.4;
    return 0.2;
  }

  private calculateActivityScore(record: DailyRecord): number {
    if (!record.activity?.duration) return 0;
    const minutes = record.activity.duration;
    if (minutes >= 30) return 1;
    if (minutes >= 15) return 0.7;
    return 0.3;
  }

  private calculateHydrationScore(record: DailyRecord): number {
    const count = record.hydration?.count || 0;
    if (count >= 8) return 1;
    if (count >= 6) return 0.7;
    if (count >= 4) return 0.4;
    return 0.2;
  }
}

export const analyticsService = new AnalyticsService(); 