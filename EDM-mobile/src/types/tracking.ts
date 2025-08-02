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
  activity?: {
    type: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
    notes?: string;
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
  meals: number; // 60% total (20% per required meal)
  symptoms: number; // 20%
  digestive: number; // 20%
  optional: {
    sport: number;
    cycle: number;
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