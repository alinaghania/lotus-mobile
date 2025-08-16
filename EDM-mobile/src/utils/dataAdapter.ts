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
  const result: DailyRecord = {
    date: doc.date
  };
  
  // Convertir vers l'ancien format sleep SI présent
  if (doc.sleep) {
    result.sleep = {
      bedTime: doc.sleep.bedtime || '',
      wakeTime: doc.sleep.wakeTime || '',
      sleepDuration: doc.sleep.duration || 0,
      sleepQuality: doc.sleep.quality || 0
    };
  }
  
  // Convertir vers l'ancien format meals SI présent
  if (doc.meals) {
    result.meals = {
      morning: (doc.meals.breakfast?.items || []).join(','),
      afternoon: (doc.meals.lunch?.items || []).join(','),
      evening: (doc.meals.dinner?.items || []).join(',')
    };
  }
  
  // Convertir vers l'ancien format digestive SI présent
  if (doc.digestive) {
    result.digestive = {
      photos: {
        morning: doc.digestive.morning?.photos || [],
        evening: doc.digestive.evening?.photos || []
      },
      notes: doc.digestive.morning?.notes || doc.digestive.evening?.notes || ''
    };
  }
  
  // Convertir sport vers ancien format activity SI présent
  if (doc.sport) {
    (result as any).activity = (doc.sport.activities as string[]) || [];
    (result as any).activityMinutes = doc.sport.totalDuration || 0;
  }
  
  // Ajouter toutes les autres données présentes dans Firebase
  if (doc.mood !== undefined) (result as any).mood = doc.mood;
  if (doc.energy !== undefined) (result as any).energy = doc.energy;
  if (doc.stress !== undefined) (result as any).stress = doc.stress;
  if (doc.symptoms && doc.symptoms.length > 0) (result as any).symptoms = doc.symptoms.join(',');
  if (doc.notes) (result as any).notes = doc.notes;
  
  return result;
}; 