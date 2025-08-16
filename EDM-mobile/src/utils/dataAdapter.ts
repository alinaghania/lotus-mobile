// Adaptateur pour convertir entre les types legacy et Firebase
import { DailyRecord } from '../types/tracking';
import { TrackingDocument } from '../services/firebaseService';

export const convertToFirebaseFormat = (data: DailyRecord, userId: string): Omit<TrackingDocument, 'createdAt' | 'updatedAt'> => {
  const firebaseData: any = {
    userId,
    date: data.date,
    symptoms: [],
    notes: '',
    completeness: 100,
    entryMethod: 'manual'
  };
  
  // Ajouter sleep SEULEMENT si présent
  if (data.sleep) {
    firebaseData.sleep = {
      bedtime: (data.sleep as any).bedTime || '',
      wakeTime: (data.sleep as any).wakeTime || '',
      duration: (data.sleep as any).sleepDuration || 0,
      quality: (data.sleep as any).sleepQuality || 0,
      routine: '',
      notes: ''
    };
  }
  
  // Ajouter meals SEULEMENT si présent
  if (data.meals) {
    firebaseData.meals = {
      breakfast: { 
        items: (data.meals as any).morning || [], 
        time: '', 
        notes: '' 
      },
      lunch: { 
        items: (data.meals as any).afternoon || [], 
        time: '', 
        notes: '' 
      },
      dinner: { 
        items: (data.meals as any).evening || [], 
        time: '', 
        notes: '' 
      },
      snacks: { items: [], time: '', notes: '' },
      totalCalories: 0,
      waterIntake: 0
    };
  }
  
  // Ajouter digestive SEULEMENT si présent
  if (data.digestive) {
    firebaseData.digestive = {
      morning: {
        photos: (data.digestive.photos as any)?.morning || [],
        bloated: false,
        pain: 0,
        notes: data.digestive.notes || ''
      },
      evening: {
        photos: (data.digestive.photos as any)?.evening || [],
        bloated: false,
        pain: 0,
        notes: ''
      },
      symptoms: [],
      medication: []
    };
  }
  
  // Ajouter sport SEULEMENT si présent (depuis l'ancien format)
  if ((data as any).activity) {
    firebaseData.sport = {
      activities: (data as any).activity || [],
      duration: (data as any).activityMinutes || 0,
      intensity: 'medium',
      notes: ''
    };
  }
  
  return firebaseData;
};

export const convertFromFirebaseFormat = (doc: TrackingDocument): DailyRecord => {
  return {
    date: doc.date,
    
    // Convertir vers l'ancien format sleep
    sleep: doc.sleep ? {
      bedTime: doc.sleep.bedtime || '',
      wakeTime: doc.sleep.wakeTime || '',
      sleepDuration: doc.sleep.duration || 0,
      sleepQuality: doc.sleep.quality || 0
    } : undefined,
    
    // Convertir vers l'ancien format meals
    meals: doc.meals ? {
      morning: doc.meals.breakfast?.items || [],
      afternoon: doc.meals.lunch?.items || [],
      evening: doc.meals.dinner?.items || []
    } : undefined,
    
    // Convertir vers l'ancien format digestive
    digestive: doc.digestive ? {
      photos: {
        morning: doc.digestive.morning?.photos || [],
        evening: doc.digestive.evening?.photos || []
      },
      notes: doc.digestive.morning?.notes || doc.digestive.evening?.notes || ''
    } : undefined
  };
}; 