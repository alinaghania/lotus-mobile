export interface DigestivePhotos {
  morning?: string;
  evening?: string;
}

export interface MealData {
  morning: string;
  afternoon: string;
  evening: string;
  snack?: string;
  drinkType?: string;
  drinkQuantities?: Record<string, number>;
}

export interface DailyRecord {
  date: string;
  digestive?: {
    photos: DigestivePhotos;
    notes?: string;
  };
  activity?: string[]; // Array of activity names
  sleep?: {
    bedTime: string;
    wakeTime: string;
    sleepQuality: number;
    sleepDuration: number;
  };
  symptoms?: string[];
  period?: {
    active: boolean;
    flow?: 'light' | 'medium' | 'heavy';
    pain?: 'none' | 'mild' | 'moderate' | 'severe';
    notes?: string;
  };
  meals?: MealData;
  hydration?: {
    count: number;
    types: string[];
    notes?: string;
  };
  notes?: string;
}

export interface AnalyticsData {
  digestiveData: {
    photosCount: number;
    data: Array<{
      date: string;
      morning: boolean;
      evening: boolean;
    }>;
  };
  symptomsData: Array<{
    name: string;
    count: number;
  }>;
  periodSymptomData: {
    withPeriod: number;
    withoutPeriod: number;
    correlation: number;
  };
}

export interface HealthScore {
  total: number;
  breakdown: {
    digestive?: number;
    symptoms?: number;
    activity?: number;
    meals?: number;
    hydration?: number;
  };
}

export interface TrackingProgress {
  meals: number; // 20%
  symptoms: number; // 20%
  digestive: number; // 20% (not used currently)
  optional: {
    sleep: number; // 20%
    sport: number; // 20%
    cycle: number; // 20%
    drinks: number;
    snacks: number;
  };
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  darkMode: boolean;
  privacyMode: boolean;
  reminderTime: string;
} 