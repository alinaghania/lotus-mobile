export type Sex = 'female' | 'male' | 'other' | '';

export interface SleepRoutine {
  bedTime: string; // e.g., '23:00'
  wakeTime: string; // e.g., '07:00'
}

export interface SportRoutineProfile {
  days: string[]; // e.g., ['Monday','Wednesday']
  time: string; // e.g., '18:00'
}

export interface CycleSettings {
  isOnContinuousPill?: boolean; // no period events, still want ovulation estimate
  averageCycleLengthDays?: number; // default 28
  isRegular?: boolean; // periods are regular monthly
  lastPeriodDate?: string; // YYYY-MM-DD
}

export interface WeightEntry { date: string; kg: number; }

export interface UserProfile {
  userId: string;
  age?: number;
  sex?: Sex;
  weightKg?: number;
  hasEndometriosis?: boolean;
  endometriosisType?: string;
  menopause?: boolean;
  cycle?: CycleSettings;
  weightDayOfWeek?: number; // 0-6 Sunday-Saturday
  weights?: WeightEntry[];
  conditions?: string[];
  allergies?: string[];
  goals?: string;
  routines?: {
    sleep?: SleepRoutine;
    sport?: SportRoutineProfile;
  };
  createdAt: string;
  updatedAt: string;
} 