import { firebaseService, UserActivityDocument, UserSessionDocument } from './firebaseService';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

let currentSessionId: string | null = null;
let sessionStartTime: Date | null = null;
let screensVisited: string[] = [];
let actionsCount = 0;

class ActivityTrackingService {
  private userId: string | null = null;
  
  // Initialiser le tracking pour un utilisateur
  setUser(userId: string) {
    this.userId = userId;
    this.startSession();
  }
  
  // Démarrer une nouvelle session
  private startSession() {
    if (!this.userId) return;
    
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime = new Date();
    screensVisited = [];
    actionsCount = 0;
    
    console.log('📊 Session started:', currentSessionId);
  }
  
  // Terminer la session actuelle
  async endSession() {
    if (!this.userId || !currentSessionId || !sessionStartTime) return;
    
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000 / 60); // minutes
    
    const sessionData: Omit<UserSessionDocument, 'crashCount' | 'dataUsage' | 'batteryLevel'> = {
      userId: this.userId,
      sessionId: currentSessionId,
      startTime: sessionStartTime,
      endTime,
      duration,
      screensVisited: [...new Set(screensVisited)], // unique screens
      actionsCount,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || '1.0.0',
    };
    
    try {
      // Sauvegarder la session dans Firestore
      await firebaseService.saveUserSession({
        ...sessionData,
        crashCount: 0,
        dataUsage: 0,
        batteryLevel: 0
      });
      
      console.log('📊 Session ended and saved:', currentSessionId);
    } catch (error) {
      console.error('❌ Error saving session:', error);
    }
    
    // Reset session
    currentSessionId = null;
    sessionStartTime = null;
    screensVisited = [];
    actionsCount = 0;
  }
  
  // Tracker la navigation vers un écran
  trackScreenVisit(screenName: string) {
    if (!this.userId || !currentSessionId) return;
    
    screensVisited.push(screenName);
    
    this.trackActivity({
      action: 'screen_visit',
      category: 'navigation',
      details: { screenName },
      screen: screenName,
      success: true
    });
  }
  
  // Tracker une action utilisateur
  async trackActivity(params: {
    action: string;
    category: 'auth' | 'tracking' | 'character' | 'navigation' | 'settings' | 'photo';
    details?: any;
    screen?: string;
    duration?: number;
    success: boolean;
    errorMessage?: string;
  }) {
    if (!this.userId) return;
    
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const activityData: UserActivityDocument = {
      userId: this.userId,
      activityId,
      action: params.action,
      category: params.category,
      details: params.details,
      timestamp: new Date(),
      sessionId: currentSessionId || undefined,
      screen: params.screen,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || '1.0.0',
      duration: params.duration,
      success: params.success,
      errorMessage: params.errorMessage
    };
    
    try {
      // Sauvegarder l'activité
      await firebaseService.saveUserActivity(activityData);
      actionsCount++;
    } catch (error) {
      console.error('❌ Error saving activity:', error);
    }
  }
  
  // Tracker les actions de tracking (sleep, meal, sport, etc.)
  trackDataEntry(type: 'sleep' | 'meal' | 'sport' | 'digestive', data: any, screen: string) {
    this.trackActivity({
      action: `${type}_entry`,
      category: 'tracking',
      details: { type, dataKeys: Object.keys(data), hasData: Object.keys(data).length > 0 },
      screen,
      success: true
    });
  }
  
  // Tracker les uploads de photos
  trackPhotoUpload(success: boolean, fileSize?: number, uploadDuration?: number, errorMessage?: string) {
    this.trackActivity({
      action: 'photo_upload',
      category: 'photo',
      details: { fileSize, uploadDuration },
      duration: uploadDuration,
      success,
      errorMessage
    });
  }
  
  // Tracker les changements de character
  trackCharacterCustomization(changes: any, screen: string) {
    this.trackActivity({
      action: 'character_update',
      category: 'character',
      details: { changes, changedFields: Object.keys(changes) },
      screen,
      success: true
    });
  }
  
  // Tracker les erreurs
  trackError(error: any, screen: string, action: string) {
    this.trackActivity({
      action: `${action}_error`,
      category: 'settings',
      details: { 
        errorMessage: error?.message || 'Unknown error',
        errorStack: error?.stack,
        errorName: error?.name
      },
      screen,
      success: false,
      errorMessage: error?.message || 'Unknown error'
    });
  }
  
  // Tracker les actions de routine
  trackRoutineAction(action: 'create' | 'edit' | 'delete' | 'use', routineType: 'sleep' | 'sport', routineData?: any) {
    this.trackActivity({
      action: `routine_${action}`,
      category: 'tracking',
      details: { routineType, routineData },
      success: true
    });
  }
  
  // Stats rapides pour debug
  getCurrentSession() {
    return {
      sessionId: currentSessionId,
      startTime: sessionStartTime,
      screensVisited: screensVisited.length,
      actionsCount
    };
  }
}

// Service singleton
export const activityTrackingService = new ActivityTrackingService();
export default activityTrackingService; 