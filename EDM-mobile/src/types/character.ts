export interface Character {
  skin: string;
  hair: string;
  hairColor: string;
  eyebrowColor: string; // Keep for backwards compatibility
  eyebrows?: string;    // NEW: Eyebrows style for AVATAAARS
  eyes: string;
  mouth?: string;       // NEW: Mouth expression for AVATAAARS
  outfit: string;
  outfitColor?: string; // NEW: Outfit color for AVATAAARS
  outfitGraphic?: string; // NEW: T-shirt graphic for AVATAAARS
  hat?: string;         // NEW: Hat style for AVATAAARS
  hatColor?: string;    // NEW: Hat color for AVATAAARS
  shoes: string;        // Keep for backwards compatibility
  accessory: string;    // Keep for backwards compatibility  
  accessories?: string; // NEW: Accessories for AVATAAARS
  accessoryColor?: string; // NEW: Accessory color for AVATAAARS
  level: number;
  endolots: number;
  healthPoints: number;
}

export interface CharacterFeature {
  id: string;
  name: string;
  type: 'skin' | 'hair' | 'eyes' | 'eyebrowColor' | 'outfit' | 'shoes' | 'accessory';
  imageUrl: string;
  unlocked: boolean;
  requiredPoints?: number;
}

export interface CharacterCustomizationState {
  features: CharacterFeature[];
  currentCharacter: Character;
  healthPoints: number;
  achievements: string[];
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