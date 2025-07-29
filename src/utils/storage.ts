import { MealData, SportData, Character } from '../types/character';

export interface DailyRecord {
  meals: MealData;
  symptoms: string[];
  progress?: number;
  sleepHours: number | null;
  sameSleepRoutine: boolean;
  sportData: SportData | null;
  sameSportRoutine: boolean;
  hasPeriod: 'yes' | 'no' | 'none' | '';
  sleepSaved: boolean;
  mealsSaved: boolean;
  sportSaved: boolean;
  cycleSaved: boolean;
  symptomsSaved: boolean;
}

const defaultRecord = (): DailyRecord => ({
  meals: { morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {} },
  symptoms: [],
  progress: 0,
  sleepHours: null,
  sameSleepRoutine: false,
  sportData: null,
  sameSportRoutine: false,
  hasPeriod: '',
  sleepSaved: false,
  mealsSaved: false,
  sportSaved: false,
  cycleSaved: false,
  symptomsSaved: false,
});

const STORAGE_KEY = 'dailyRecords';

export const getDateKey = (d: Date): string => d.toLocaleDateString('sv-SE');

export const loadRecords = (): Record<string, DailyRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveRecords = (records: Record<string, DailyRecord>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const getDailyRecord = (date: Date): DailyRecord => {
  const key = getDateKey(date);
  const records = loadRecords();
  if (!records[key]) {
    records[key] = defaultRecord();
    saveRecords(records);
  }
  return records[key];
};

export const updateDailyRecord = (date: Date, partial: Partial<DailyRecord>) => {
  const key = getDateKey(date);
  const records = loadRecords();
  const existing = records[key] || defaultRecord();
  records[key] = { ...existing, ...partial };
  saveRecords(records);
  try {
    const event = new CustomEvent('recordUpdated', { detail: { date: key } });
    window.dispatchEvent(event);
  } catch {}
};

// Simple Dynamic Objectives System
export interface DynamicObjective {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  collected: boolean; // New: whether endolots have been collected
  type: 'sleep' | 'meals' | 'streak' | 'complete' | 'sport' | 'selfie' | 'consistency';
}

// Progressive objectives that unlock as you complete previous ones
const ALL_OBJECTIVES: Omit<DynamicObjective, 'current' | 'completed' | 'collected'>[] = [
  // Beginner objectives
  { id: 'first_sleep', title: 'First Sleep Log', description: 'Track your sleep once', target: 1, reward: 5, type: 'sleep' },
  { id: 'first_meal', title: 'First Meal Log', description: 'Log a meal once', target: 1, reward: 5, type: 'meals' },
  { id: 'streak_3', title: '3-Day Streak', description: 'Track for 3 days in a row', target: 3, reward: 10, type: 'streak' },
  
  // Intermediate objectives
  { id: 'sleep_week', title: 'Sleep Week', description: 'Track sleep for 7 days', target: 7, reward: 15, type: 'sleep' },
  { id: 'complete_day', title: 'Perfect Day', description: 'Complete a full tracking day', target: 1, reward: 15, type: 'complete' },
  { id: 'meal_variety', title: 'Meal Tracker', description: 'Log meals for 5 different days', target: 5, reward: 12, type: 'meals' },
  
  // Advanced objectives
  { id: 'streak_week', title: 'Weekly Warrior', description: 'Maintain 7-day streak', target: 7, reward: 25, type: 'streak' },
  { id: 'sport_start', title: 'Get Active', description: 'Log sport activity 3 times', target: 3, reward: 18, type: 'sport' },
  { id: 'consistency_master', title: 'Consistency Master', description: 'Track for 15 total days', target: 15, reward: 30, type: 'consistency' },
  
  // Fun objectives
  { id: 'selfie_master', title: 'Selfie Star', description: 'Take a body photo', target: 1, reward: 20, type: 'selfie' },
  { id: 'complete_week', title: 'Perfect Week', description: 'Complete 3 full tracking days', target: 3, reward: 35, type: 'complete' },
  { id: 'sleep_master', title: 'Sleep Champion', description: 'Track sleep for 20 days', target: 20, reward: 40, type: 'sleep' }
];

export const getObjectivesProgress = (): { completedIds: string[], collectedIds: string[] } => {
  try {
    const data = localStorage.getItem('lotus-objectives');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading objectives progress:', error);
  }
  return { completedIds: [], collectedIds: [] };
};

export const saveObjectivesProgress = (progress: { completedIds: string[], collectedIds: string[] }): void => {
  try {
    localStorage.setItem('lotus-objectives', JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving objectives progress:', error);
  }
};

export const calculateObjectiveProgress = (objective: Omit<DynamicObjective, 'current' | 'completed' | 'collected'>, records: Record<string, any>): number => {
  const recordsArray = Object.entries(records);
  
  switch (objective.type) {
    case 'sleep':
      return recordsArray.filter(([, rec]) => rec.sleepSaved).length;
    case 'meals':
      return recordsArray.filter(([, rec]) => rec.mealsSaved).length;
    case 'sport':
      return recordsArray.filter(([, rec]) => rec.sportSaved).length;
    case 'complete':
      return recordsArray.filter(([, rec]) => rec.progress === 100).length;
    case 'consistency':
      return recordsArray.length;
    case 'selfie':
      // Check if there are any belly photos
      const photos = JSON.parse(localStorage.getItem('lotus-belly-photos') || '{}');
      return Object.keys(photos).length > 0 ? 1 : 0;
    case 'streak':
      // This should be passed from the component that knows the current streak
      return 0; // Will be calculated in component
    default:
      return 0;
  }
};

export const getCurrentObjectives = (records: Record<string, any>, currentStreak: number): DynamicObjective[] => {
  const progress = getObjectivesProgress();
  const availableObjectives: DynamicObjective[] = [];
  
  // Get next 3 uncollected objectives
  for (const objTemplate of ALL_OBJECTIVES) {
    if (availableObjectives.length >= 3) break;
    
    // Skip if already collected
    if (progress.collectedIds.includes(objTemplate.id)) continue;
    
    let current = calculateObjectiveProgress(objTemplate, records);
    if (objTemplate.type === 'streak') {
      current = currentStreak;
    }
    
    const completed = current >= objTemplate.target;
    
    availableObjectives.push({
      ...objTemplate,
      current,
      completed,
      collected: progress.collectedIds.includes(objTemplate.id)
    });
  }
  
  return availableObjectives;
};

export const collectObjectiveReward = (objectiveId: string, reward: number, character: any): boolean => {
  const progress = getObjectivesProgress();
  
  if (!progress.collectedIds.includes(objectiveId)) {
    // Add to collected
    progress.collectedIds.push(objectiveId);
    if (!progress.completedIds.includes(objectiveId)) {
      progress.completedIds.push(objectiveId);
    }
    
    // Add endolots to character
    const newEndolots = (character.endolots || 0) + reward;
    updateCharacterEndolots(character, newEndolots);
    
    saveObjectivesProgress(progress);
    return true;
  }
  return false;
};

// Premium purchases management
export interface PurchasedItems {
  [key: string]: string[]; // key = character property, value = array of purchased item values
}

export const getPurchasedItems = (): PurchasedItems => {
  try {
    const data = localStorage.getItem('lotus-purchased-items');
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading purchased items:', error);
  }
  return {};
};

export const savePurchasedItems = (purchasedItems: PurchasedItems): void => {
  try {
    localStorage.setItem('lotus-purchased-items', JSON.stringify(purchasedItems));
  } catch (error) {
    console.error('Error saving purchased items:', error);
  }
};

export const purchasePremiumItem = (category: string, itemValue: string, cost: number, character: any): boolean => {
  const currentEndolots = character.endolots || 0;
  
  // Check if user has enough endolots
  if (currentEndolots < cost) {
    return false;
  }
  
  // Get current purchased items
  const purchasedItems = getPurchasedItems();
  
  // Add item to purchased items if not already purchased
  if (!purchasedItems[category]) {
    purchasedItems[category] = [];
  }
  
  if (!purchasedItems[category].includes(itemValue)) {
    purchasedItems[category].push(itemValue);
    
    // Deduct endolots
    const newEndolots = currentEndolots - cost;
    updateCharacterEndolots(character, newEndolots);
    
    // Save purchased items
    savePurchasedItems(purchasedItems);
    
    return true;
  }
  
  return false; // Already purchased
};

export const isPremiumItemPurchased = (category: string, itemValue: string): boolean => {
  const purchasedItems = getPurchasedItems();
  return purchasedItems[category]?.includes(itemValue) || false;
};

// Simple endolots system - just stored in character
export const updateCharacterEndolots = (character: any, newEndolots: number): void => {
  try {
    // Update character endolots directly
    character.endolots = newEndolots;
    // Save to localStorage if needed
    const key = 'lotus-character';
    localStorage.setItem(key, JSON.stringify(character));
  } catch (error) {
    console.error('Error saving character endolots:', error);
  }
}; 

// Character storage functions
export const saveCharacter = (character: Character): void => {
  try {
    localStorage.setItem('lotus-character', JSON.stringify(character));
  } catch (error) {
    console.error('Error saving character:', error);
  }
};

export const loadCharacter = (): Character | null => {
  try {
    const data = localStorage.getItem('lotus-character');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading character:', error);
    return null;
  }
}; 