// Types complets pour sauvegarder TOUTES les données utilisateur
export interface UserRegistrationData {
  // Données de base
  name: string;
  email: string;
  
  // Informations personnelles
  age?: string;
  sex?: 'female' | 'male' | 'other';
  weight?: string;
  
  // Informations de santé
  hasEndometriosis?: 'yes' | 'no';
  endometriosisTypes?: string[];
  isMenopause?: 'yes' | 'no';
  medicalConditions?: string[];
  
  // Métadonnées
  registrationDate: Date;
  deviceInfo?: {
    platform: string;
    version: string;
  };
  
  // Préférences initiales
  preferences?: {
    notifications: boolean;
    dataSharing: boolean;
    language: string;
  };
}

export interface CompleteUserProfile extends UserRegistrationData {
  // ID Firebase
  uid: string;
  
  // Données character/avatar
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
  
  // Données de tracking historiques
  trackingStats?: {
    daysTracked: number;
    consecutiveDays: number;
    lastActivityDate: Date;
    totalMealsLogged: number;
    totalSportsessions: number;
    averageSleepHours: number;
  };
  
  // Dernière mise à jour
  lastUpdated: Date;
  profileCompleteness: number; // 0-100%
}

export interface UserActivity {
  // Action tracking pour analytics
  userId: string;
  action: string;
  category: 'auth' | 'tracking' | 'character' | 'navigation' | 'settings';
  details?: any;
  timestamp: Date;
  sessionId?: string;
  
  // Context
  screen?: string;
  platform: string;
  appVersion: string;
}

export interface UserSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // en minutes
  screensVisited: string[];
  actionsCount: number;
  platform: string;
} 