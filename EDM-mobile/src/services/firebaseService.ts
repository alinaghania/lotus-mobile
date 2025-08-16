import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Types pour Firestore - STRUCTURE ROBUSTE POUR ANALYTICS
export interface UserDocument {
  userId: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Données complètes d'inscription
  registrationData: {
    age?: string;
    sex?: 'female' | 'male' | 'other';
    weight?: string;
    hasEndometriosis?: 'yes' | 'no';
    endometriosisTypes?: string[];
    isMenopause?: 'yes' | 'no';
    medicalConditions?: string[];
    deviceInfo?: {
      platform: string;
      version: string;
    };
    preferences?: {
      notifications: boolean;
      dataSharing: boolean;
      language: string;
    };
  };
  
  // Character/Avatar
  character?: {
    skin: string;
    hair: string;
    hairColor: string;
    outfit: string;
    level: number;
    endolots: number;
    healthPoints: number;
    [key: string]: any;
  };
  
  // Métadonnées utilisateur (pas de stats calculées)
  metadata: {
    lastLoginDate: Date;
    accountCreatedDate: Date;
    profileCompleteness: number;
    appVersion: string;
    platform: string;
  };
}

export interface TrackingDocument {
  userId: string;
  date: string; // YYYY-MM-DD format
  createdAt: Date;
  updatedAt: Date;
  
  // Données de tracking détaillées pour analytics
  sleep?: {
    bedtime?: string;
    wakeTime?: string;
    duration?: number; // en minutes
    quality?: number; // 1-5
    routine?: string;
    notes?: string;
  };
  
  meals?: {
    breakfast?: { items: string[]; time?: string; notes?: string; };
    lunch?: { items: string[]; time?: string; notes?: string; };
    dinner?: { items: string[]; time?: string; notes?: string; };
    snacks?: { items: string[]; time?: string; notes?: string; };
    totalCalories?: number;
    waterIntake?: number; // en ml
  };
  
  sport?: {
    activities?: Array<{
      type: string;
      duration: number; // en minutes
      intensity?: 'low' | 'medium' | 'high';
      calories?: number;
      time?: string;
      notes?: string;
    }>;
    totalDuration?: number;
    totalCalories?: number;
    routine?: string;
  };
  
  digestive?: {
    morning?: {
      photos?: string[]; // URLs Firebase Storage
      bloated?: boolean;
      pain?: number; // 1-5
      notes?: string;
    };
    evening?: {
      photos?: string[]; // URLs Firebase Storage  
      bloated?: boolean;
      pain?: number; // 1-5
      notes?: string;
    };
    symptoms?: string[];
    medication?: string[];
  };
  
  // Autres données
  mood?: number; // 1-5
  energy?: number; // 1-5
  stress?: number; // 1-5
  symptoms?: string[];
  notes?: string;
  
  // Metadata pour analytics
  completeness?: number; // 0-100%
  entryMethod?: 'manual' | 'routine' | 'auto';
}

export interface PhotoDocument {
  userId: string;
  photoId: string;
  downloadURL: string;
  storagePath: string;
  time: 'morning' | 'evening';
  timestamp: Date;
  notes: string;
  bloated: boolean;
  pain?: number; // 1-5
  
  // Metadata pour analytics
  fileSize?: number;
  dimensions?: { width: number; height: number; };
  uploadDuration?: number; // en ms
  
  // Analytics
  viewCount?: number;
  lastViewed?: Date;
}

// NOUVELLES COLLECTIONS POUR ANALYTICS
export interface UserActivityDocument {
  userId: string;
  activityId: string;
  action: string;
  category: 'auth' | 'tracking' | 'character' | 'navigation' | 'settings' | 'photo';
  details?: any;
  timestamp: Date;
  sessionId?: string;
  
  // Context
  screen?: string;
  platform: string;
  appVersion: string;
  
  // Performance data
  duration?: number; // temps passé sur l'action (ms)
  success: boolean;
  errorMessage?: string;
}

export interface UserSessionDocument {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // en minutes
  screensVisited: string[];
  actionsCount: number;
  platform: string;
  appVersion: string;
  
  // Analytics additionnelles
  crashCount: number;
  dataUsage?: number; // en bytes
  batteryLevel?: number; // 0-100
}

export interface RoutineDocument {
  userId: string;
  routineId: string;
  type: 'sleep' | 'sport' | 'meal';
  name: string;
  schedule: {
    days: string[]; // ['monday', 'tuesday', ...]
    time?: string; // pour les routines programmées
  };
  
  // Configuration spécifique
  config?: {
    // Sleep routine
    bedtime?: string;
    wakeTime?: string;
    duration?: number;
    
    // Sport routine  
    activities?: Array<{
      type: string;
      duration: number;
      intensity?: string;
    }>;
    
    // Meal routine
    meals?: {
      breakfast?: string[];
      lunch?: string[];
      dinner?: string[];
    };
  };
  
  // Analytics
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  lastUsed?: Date;
  effectiveness?: number; // 0-100% basé sur le suivi
}

class FirebaseService {
  // ==================== UTILITY METHODS ====================
  
  // Utilitaire pour nettoyer les undefined (Firebase les refuse)
  private removeUndefinedValues(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          const cleanedValue = this.removeUndefinedValues(value);
          if (Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  // ==================== USER OPERATIONS ====================

  async createUser(userData: Omit<UserDocument, 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    try {
      const now = new Date();
      const userDoc: UserDocument = {
        ...userData,
        createdAt: now,
        updatedAt: now
      };

      await setDoc(doc(db, 'users', userData.userId), userDoc);
      console.log('✅ User created in Firestore:', userData.userId);
      return userDoc;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data() as UserDocument;
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt?.toDate() : data.updatedAt
      };
    } catch (error) {
      console.error('❌ Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data() as UserDocument;
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt?.toDate() : data.updatedAt
      };
    } catch (error) {
      console.error('❌ Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<UserDocument>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      console.log('✅ User updated in Firestore:', userId);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log('✅ User deleted from Firestore:', userId);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  // ==================== TRACKING OPERATIONS ====================

  async saveTracking(trackingData: Omit<TrackingDocument, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const docId = `${trackingData.userId}_${trackingData.date}`;
      const now = new Date();

      // Nettoyer les undefined AVANT de sauvegarder
      const cleanData = this.removeUndefinedValues(trackingData);

      const docRef = doc(db, 'tracking', docId);
      const existingDoc = await getDoc(docRef);
      
      if (existingDoc.exists()) {
        await updateDoc(docRef, {
          ...cleanData,
          updatedAt: now
        });
        console.log('✅ Tracking updated in Firestore:', docId);
      } else {
        await setDoc(docRef, {
          ...cleanData,
          createdAt: now,
          updatedAt: now
        });
        console.log('✅ Tracking created in Firestore:', docId);
      }
    } catch (error) {
      console.error('❌ Error saving tracking:', error);
      throw error;
    }
  }

  async getTrackingByDate(userId: string, date: string): Promise<TrackingDocument | null> {
    try {
      const docId = `${userId}_${date}`;
      const docRef = doc(db, 'tracking', docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data() as TrackingDocument;
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
      };
    } catch (error) {
      console.error('❌ Error getting tracking by date:', error);
      throw error;
    }
  }

  async getUserTracking(userId: string, limitCount: number = 30): Promise<TrackingDocument[]> {
    try {
      const q = query(
        collection(db, 'tracking'), 
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as TrackingDocument;
        return {
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
        };
      });
    } catch (error) {
      console.error('❌ Error getting user tracking:', error);
      throw error;
    }
  }

  // ==================== PHOTO OPERATIONS ====================

  async savePhoto(photoData: Omit<PhotoDocument, 'downloadURL' | 'storagePath'>, imageUri: string): Promise<PhotoDocument> {
    try {
      const { userId, photoId } = photoData;
      
      // 1. Upload image to Firebase Storage
      const storagePath = `photos/${userId}/${photoId}.jpg`;
      const storageRef = ref(storage, storagePath);
      
      // Pour Expo, nous devons fetch l'image puis l'upload
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      // 2. Save photo metadata to Firestore
      const photoDoc: PhotoDocument = {
        ...photoData,
        downloadURL,
        storagePath
      };
      
      await setDoc(doc(db, 'photos', photoId), photoDoc);
      console.log('✅ Photo saved to Firebase:', photoId);
      
      return photoDoc;
    } catch (error) {
      console.error('❌ Error saving photo:', error);
      throw error;
    }
  }

  async getUserPhotos(userId: string): Promise<PhotoDocument[]> {
    try {
      const q = query(
        collection(db, 'photos'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as PhotoDocument;
        return {
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp
        };
      });
    } catch (error) {
      console.error('❌ Error getting user photos:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string, userId: string): Promise<void> {
    try {
      // 1. Get photo document to get storage path
      const docRef = doc(db, 'photos', photoId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.warn('Photo document not found:', photoId);
        return;
      }
      
      const photoData = docSnap.data() as PhotoDocument;
      
      // 2. Delete from Firebase Storage
      if (photoData.storagePath) {
        try {
          const storageRef = ref(storage, photoData.storagePath);
          await deleteObject(storageRef);
          console.log('✅ Photo deleted from Storage:', photoData.storagePath);
        } catch (storageError) {
          console.warn('Error deleting from storage:', storageError);
        }
      }
      
      // 3. Delete from Firestore
      await deleteDoc(docRef);
      console.log('✅ Photo deleted from Firestore:', photoId);
    } catch (error) {
      console.error('❌ Error deleting photo:', error);
      throw error;
    }
  }

  // ==================== ACTIVITY TRACKING OPERATIONS ====================

  async saveUserActivity(activityData: UserActivityDocument): Promise<void> {
    try {
      await setDoc(doc(db, 'user_activities', activityData.activityId), activityData);
    } catch (error) {
      console.error('❌ Error saving user activity:', error);
      throw error;
    }
  }

  async saveUserSession(sessionData: UserSessionDocument): Promise<void> {
    try {
      await setDoc(doc(db, 'user_sessions', sessionData.sessionId), sessionData);
    } catch (error) {
      console.error('❌ Error saving user session:', error);
      throw error;
    }
  }

  async saveRoutine(routineData: RoutineDocument): Promise<void> {
    try {
      await setDoc(doc(db, 'routines', routineData.routineId), routineData);
    } catch (error) {
      console.error('❌ Error saving routine:', error);
      throw error;
    }
  }

  async getUserActivities(userId: string, limitCount: number = 100): Promise<UserActivityDocument[]> {
    try {
      const q = query(
        collection(db, 'user_activities'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as UserActivityDocument;
        return {
          ...data,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp
        };
      });
    } catch (error) {
      console.error('❌ Error getting user activities:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  // Listener pour changements en temps réel
  subscribeToUserTracking(userId: string, callback: (trackingData: TrackingDocument[]) => void) {
    const q = query(
      collection(db, 'tracking'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const trackingData = querySnapshot.docs.map(doc => {
          const data = doc.data() as TrackingDocument;
          return {
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt
          };
        });
        callback(trackingData);
      },
      (error) => {
        console.error('❌ Error in tracking subscription:', error);
      }
    );
  }

  subscribeToUserPhotos(userId: string, callback: (photos: PhotoDocument[]) => void) {
    const q = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q,
      (querySnapshot) => {
        const photos = querySnapshot.docs.map(doc => {
          const data = doc.data() as PhotoDocument;
          return {
            ...data,
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp
          };
        });
        callback(photos);
      },
      (error) => {
        console.error('❌ Error in photos subscription:', error);
      }
    );
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService; 