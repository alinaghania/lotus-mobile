import { trackingService } from './trackingService';
import { AnalyticsData, DailyRecord, HealthScore } from '../types/tracking';
import { estimateCaloriesForRecord } from './caloriesService';
import { profileService } from './profileService';

class AnalyticsService {
  async getAnalytics(userId: string, startDate: string, endDate: string): Promise<AnalyticsData> {
    const records = await trackingService.getTrackingByUser(userId);
    const filteredRecords = records.filter(record => record.date >= startDate && record.date <= endDate);

    const caloriesPerDay = filteredRecords.map(r => ({
      date: r.date,
      calories: r.nutrition?.totalCalories ?? estimateCaloriesForRecord(r)
    })).sort((a, b) => a.date.localeCompare(b.date));

    const avgCalories = caloriesPerDay.length > 0
      ? Math.round((caloriesPerDay.reduce((sum, d) => sum + (d.calories || 0), 0) / caloriesPerDay.length) * 10) / 10
      : 0;

    const foodsData = this.analyzeTopFoods(filteredRecords);
    const foodSymptomMatrix = this.analyzeFoodSymptomMatrix(filteredRecords, foodsData.map(f => f.name));
    const foodDigestiveCorrelation = this.analyzeFoodDigestiveCorrelation(filteredRecords);
    const foodSymptomDetails = this.analyzeFoodSymptomDetails(filteredRecords);

    const symptomsOverTime = this.buildSymptomsOverTime(filteredRecords);
    const digestiveIssuesTrend = this.buildDigestiveIssuesTrend(filteredRecords);
    const periodSymptomsSeries = this.buildPeriodSymptomsSeries(filteredRecords);
    const cyclePrediction = await this.predictCycle(userId, records);

    return {
      digestiveData: this.analyzeDigestive(filteredRecords),
      symptomsData: this.analyzeSymptomsData(filteredRecords),
      periodSymptomData: this.analyzePeriodSymptomCorrelation(filteredRecords),
      caloriesData: { average: avgCalories, perDay: caloriesPerDay },
      foodsData,
      foodSymptomMatrix,
      symptomsOverTime,
      digestiveIssuesTrend,
      periodSymptomsSeries,
      cyclePrediction,
      // extras used by UI
      foodDigestiveCorrelation,
      foodSymptomDetails,
    } as AnalyticsData & { foodDigestiveCorrelation?: Array<{ name: string; correlationPct: number }>, foodSymptomDetails?: Record<string, Array<{ name: string; count: number }>> } & any;
  }

  private buildCycleLatenessByMonth(records: DailyRecord[], cycleLen: number) {
    // Consider each detected period start as an actual, and compute expected from previous + cycleLen
    const periodStarts = records
      .filter(r => r.period?.active)
      .map(r => r.date)
      .sort((a, b) => a.localeCompare(b));
    const lateness: Array<{ month: string; daysLate: number }> = [];
    for (let i = 1; i < periodStarts.length; i++) {
      const prev = new Date(periodStarts[i - 1]);
      const actual = new Date(periodStarts[i]);
      const expected = new Date(prev);
      expected.setDate(expected.getDate() + (cycleLen || 28));
      const diffDays = Math.round((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
      const month = `${actual.getFullYear()}-${String(actual.getMonth() + 1).padStart(2, '0')}`;
      lateness.push({ month, daysLate: diffDays });
    }
    return lateness.slice(-6); // last 6 months
  }

  private extractFoodItems(record: DailyRecord): string[] {
    const parts: string[] = [];
    const add = (s?: string) => { if (s) parts.push(...s.split(',').map(p => p.trim()).filter(Boolean)); };
    add(record.meals?.morning);
    add(record.meals?.afternoon);
    add(record.meals?.evening);
    add(record.meals?.snack);
    return parts.map(p => p.toLowerCase());
  }

  private async predictCycle(userId: string, allRecords: DailyRecord[]) {
    const profile = await profileService.getProfile(userId);
    const averageCycle = profile?.cycle?.averageCycleLengthDays || 28;
    const isOnContinuousPill = !!profile?.cycle?.isOnContinuousPill;

    // Extract unique period days
    const days = allRecords
      .filter(r => r.period?.active)
      .map(r => r.date)
      .sort((a, b) => a.localeCompare(b));

    // If on continuous pill, rely on configured average cycle for estimation regardless of data
    const cycleLen = (() => {
      if (isOnContinuousPill) return averageCycle;
      const gaps: number[] = [];
      for (let i = 1; i < days.length; i++) {
        const d1 = new Date(days[i - 1]).getTime();
        const d2 = new Date(days[i]).getTime();
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff > 0 && diff <= 60) gaps.push(diff);
      }
      const recent = gaps.slice(-3);
      return recent.length > 0 ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : averageCycle;
    })();

    const baseline = days[days.length - 1] ? new Date(days[days.length - 1]) : new Date();
    const nextPeriod = new Date(baseline);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    const nextOvulation = new Date(nextPeriod);
    nextOvulation.setDate(nextOvulation.getDate() - 14);

    // lateness: compare most recent actual period vs expected based on previous interval
    let latenessDays: number | undefined = undefined;
    if (days.length >= 2) {
      const last = new Date(days[days.length - 1]);
      const prev = new Date(days[days.length - 2]);
      const expected = new Date(prev);
      expected.setDate(expected.getDate() + cycleLen);
      latenessDays = Math.round((last.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    }

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    return { lastPeriodDate: days.slice(-1)[0], nextPeriodDate: fmt(nextPeriod), nextOvulationDate: fmt(nextOvulation), cycleLengthDays: cycleLen, latenessDays };
  }

  private buildSymptomsOverTime(records: DailyRecord[]) {
    const map = new Map<string, number>();
    records.forEach(r => {
      const c = r.symptoms?.length || 0;
      map.set(r.date, (map.get(r.date) || 0) + c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }

  private buildDigestiveIssuesTrend(records: DailyRecord[]) {
    const map = new Map<string, number>();
    records.forEach(r => {
      const issues = (r.symptoms || []).filter(s => /bloat|gas|stomach|constipation|diarrhea|cramp|reflux|heartburn/i.test(s)).length;
      map.set(r.date, (map.get(r.date) || 0) + issues);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }

  private buildPeriodSymptomsSeries(records: DailyRecord[]) {
    const withMap = new Map<string, number>();
    const withoutMap = new Map<string, number>();
    records.forEach(r => {
      const key = r.date;
      const c = r.symptoms?.length || 0;
      if (r.period?.active) withMap.set(key, (withMap.get(key) || 0) + c);
      else withoutMap.set(key, (withoutMap.get(key) || 0) + c);
    });
    const dates = Array.from(new Set([...withMap.keys(), ...withoutMap.keys()])).sort();
    const withPeriod = dates.map(d => withMap.get(d) || 0);
    const withoutPeriod = dates.map(d => withoutMap.get(d) || 0);
    return { dates, withPeriod, withoutPeriod };
  }

  private analyzeTopFoods(records: DailyRecord[]) {
    const map = new Map<string, number>();
    records.forEach(r => {
      this.extractFoodItems(r).forEach(f => map.set(f, (map.get(f) || 0) + 1));
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private analyzeFoodSymptomMatrix(records: DailyRecord[], topFoods: string[]) {
    const symptomsSet = new Set<string>();
    records.forEach(r => (r.symptoms || []).forEach(s => symptomsSet.add(s)));
    const symptoms = Array.from(symptomsSet).slice(0, 12); // limit for readability

    const foodIndex = new Map<string, number>();
    topFoods.forEach((f, i) => foodIndex.set(f, i));
    const symptomIndex = new Map<string, number>();
    symptoms.forEach((s, i) => symptomIndex.set(s, i));

    const cooccurrence: number[][] = Array.from({ length: topFoods.length }, () => Array(symptoms.length).fill(0));

    records.forEach(r => {
      const foods = this.extractFoodItems(r).filter(f => foodIndex.has(f));
      const syms = (r.symptoms || []).filter(s => symptomIndex.has(s));
      foods.forEach(f => {
        syms.forEach(s => {
          const fi = foodIndex.get(f)!;
          const si = symptomIndex.get(s)!;
          cooccurrence[fi][si] += 1;
        });
      });
    });

    return { foods: topFoods, symptoms, cooccurrence };
  }

  private analyzeFoodDigestiveCorrelation(records: DailyRecord[]) {
    // Digestive symptoms keywords
    const isDigestive = (s: string) => /bloat|gas|stomach|constipation|diarrhea|cramp|reflux|heartburn/i.test(s);
    const perDay = new Map<string, { foods: Set<string>; digestive: boolean }>();

    records.forEach(r => {
      const foods = new Set(this.extractFoodItems(r));
      const digestive = (r.symptoms || []).some(isDigestive);
      perDay.set(r.date, { foods, digestive });
    });

    const foodDays = new Map<string, { withDigestive: number; total: number }>();
    Array.from(perDay.values()).forEach(({ foods, digestive }) => {
      foods.forEach(f => {
        const rec = foodDays.get(f) || { withDigestive: 0, total: 0 };
        rec.total += 1;
        if (digestive) rec.withDigestive += 1;
        foodDays.set(f, rec);
      });
    });

    const list = Array.from(foodDays.entries()).map(([name, v]) => ({
      name,
      correlationPct: Math.round((v.withDigestive / Math.max(1, v.total)) * 100),
    })).sort((a, b) => b.correlationPct - a.correlationPct);

    return list.slice(0, 10);
  }

  private analyzeFoodSymptomDetails(records: DailyRecord[]) {
    // Per food, count co-occurrences per symptom (digestive and general)
    const map: Record<string, Map<string, number>> = {};
    records.forEach(r => {
      const foods = new Set(this.extractFoodItems(r));
      const syms = (r.symptoms || []);
      foods.forEach(f => {
        map[f] = map[f] || new Map<string, number>();
        syms.forEach(s => {
          map[f].set(s, (map[f].get(s) || 0) + 1);
        });
      });
    });
    const obj: Record<string, Array<{ name: string; count: number }>> = {};
    Object.entries(map).forEach(([food, counts]) => {
      const arr = Array.from(counts.entries()).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      obj[food] = arr;
    });
    return obj;
  }

  private analyzeDigestive(records: DailyRecord[]) {
    const data = records.map(r => ({
      date: r.date,
      morning: !!r.digestive?.photos?.morning,
      evening: !!r.digestive?.photos?.evening,
    }));
    const photosCount = data.reduce((acc, d) => acc + (d.morning ? 1 : 0) + (d.evening ? 1 : 0), 0);
    return { photosCount, data };
  }

  private analyzeSymptomsData(records: DailyRecord[]) {
    const symptoms = new Map<string, number>();
    records.forEach(record => {
      (record.symptoms || []).forEach(symptom => {
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

    const avgWith = withPeriod.reduce((acc, r) => acc + (r.symptoms?.length || 0), 0) / (withPeriod.length || 1);
    const avgWithout = withoutPeriod.reduce((acc, r) => acc + (r.symptoms?.length || 0), 0) / (withoutPeriod.length || 1);

    return { withPeriod: avgWith, withoutPeriod: avgWithout, correlation: avgWith - avgWithout };
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
    } as HealthScore['breakdown'];

    const total = Object.values(breakdown).reduce((a, b) => (a || 0) + (b || 0), 0) / Object.keys(breakdown).length;

    return { total: Math.round(total * 100) / 100, breakdown };
  }

  private calculateSleepScore(record: DailyRecord): number {
    const hours = record.sleep?.sleepDuration || 0;
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
    const items = record.activity?.length || 0;
    if (items >= 2) return 1;
    if (items >= 1) return 0.7;
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