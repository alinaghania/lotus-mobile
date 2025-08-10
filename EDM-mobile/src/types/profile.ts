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
  // Personal info
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string; // DD/MM/YYYY

  // Basic health
  age?: number;
  sex?: Sex;
  weightKg?: number;
  heightCm?: number;

  // Endometriosis
  hasEndometriosis?: boolean;
  diagnosisStatus?: 'diagnosed' | 'not_diagnosed' | 'investigation';
  endometriosisType?: string;
  diagnosisDate?: string; // DD/MM/YYYY

  menopause?: boolean;
  cycle?: CycleSettings;
  weightDayOfWeek?: number; // 0-6 Sunday-Saturday
  weights?: WeightEntry[];

  // Conditions and notes
  conditions?: string[];
  medications?: string; // free text
  allergies?: string[];
  allergiesNotes?: string; // free text

  // Goals
  goals?: string; // legacy single string
  goalsList?: string[]; // new multi-select

  routines?: {
    sleep?: SleepRoutine;
    sport?: SportRoutineProfile;
  };
  createdAt: string;
  updatedAt: string;
} 