export interface Character {
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  topColor: string;
  bottomColor: string;
  shoeColor: string;
  eyebrowColor: string;
  accessory: string;
  expression: string;
  level: number;
  endolots?: number; // Currency earned from tracking
}

export interface MealData {
  morning: string;
  afternoon: string;
  evening: string;
  snack: string;
  drinkType: string;
  drinkQuantities: Record<string, number>;
}

export type SportData = {
  activities: string[];
  durations: Record<string, number>;
};

export type GlobalState = {
  currentPage: string;
  customizationStep: number;
  character: Character;
  dailyProgress: number;
  streak: number;
  selectedSymptoms: string[];
  mealData: MealData;
  selectedDate: Date;
  bellyPhotos: Record<string, string>;
  sleepHours: number | null;
  sportData: SportData | null;
  sameSleepRoutine: boolean;
  sameSportRoutine: boolean;
  hasPeriod: 'yes' | 'no' | 'none' | '';
  selectedFilter: 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months';
  sleepSaved?: boolean;
  mealsSaved?: boolean;
  sportSaved?: boolean;
  cycleSaved?: boolean;
  symptomsSaved?: boolean;
}; 