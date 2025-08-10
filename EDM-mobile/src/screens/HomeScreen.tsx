import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { useDate } from '../contexts/DateContext';
import { trackingService } from '../services/trackingService';
import { Character } from '../types/character';
import { TrackingProgress, DailyRecord, MealData } from '../types/tracking';
import DetailedCharacter from '../components/DetailedCharacter';
import { styles } from '../styles/homeStyles';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  progress: number;
  required: boolean;
}

const loadSavedCharacter = async (): Promise<Character> => {
  try {
    const characterData = await AsyncStorage.getItem('savedCharacter');
    if (characterData) {
      const savedCharacter = JSON.parse(characterData);
      console.log('Loaded character from storage:', savedCharacter);
      // Ensure all required properties exist (backwards compatibility + AVATAAARS support)
      return {
        ...savedCharacter,
        eyebrowColor: savedCharacter.eyebrowColor || savedCharacter.hairColor || '#8B4513',
        eyebrows: savedCharacter.eyebrows || 'natural',
        eyes: savedCharacter.eyes || 'happy',
        mouth: savedCharacter.mouth || 'smile',
        shoes: savedCharacter.shoes || 'sneakers',
        accessory: savedCharacter.accessory || 'none',
        accessories: savedCharacter.accessories || 'none',
        outfitColor: savedCharacter.outfitColor || '#93c5fd',
        outfitGraphic: savedCharacter.outfitGraphic || 'none',
        accessoryColor: savedCharacter.accessoryColor || '#000000',
        endolots: savedCharacter.endolots || 150,
        healthPoints: savedCharacter.healthPoints || 100
      };
    }
  } catch (error) {
    console.error('Failed to load character:', error);
  }
  
  // Return default AVATAAARS character if no saved character found
  return {
    skin: '#F1C3A7',
    hair: 'long',
    hairColor: '#8B4513',
    eyebrowColor: '#8B4513',
    eyes: 'happy',
    mouth: 'smile',
    outfit: 'tshirt',
    outfitColor: '#93c5fd',
    outfitGraphic: 'none',
    shoes: 'sneakers',
    accessory: 'none',
    accessories: 'none',
    accessoryColor: '#000000',
    level: 1,
    endolots: 150,
    healthPoints: 100
  };
};

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { selectedDate, setSelectedDate, refreshTrigger } = useDate();
  const [character, setCharacter] = useState<Character>({
    skin: '#F1C3A7',
    hair: 'long',
    hairColor: '#8B4513',
    eyebrowColor: '#8B4513',
    eyes: '#8B4513',
    outfit: 'tshirt',
    shoes: 'sneakers',
    accessory: 'none',
    level: 1,
    endolots: 150,
    healthPoints: 100
  });
  const [streak, setStreak] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [trackingProgress, setTrackingProgress] = useState<TrackingProgress>({
    meals: 0,
    symptoms: 0,
    digestive: 0,
    optional: {
      sleep: 0,
      sport: 0,
      cycle: 0,
      drinks: 0,
      snacks: 0
    }
  });

  // Calculate tracking progress from data (20% per tab)
  const calculateTrackingProgress = (record: DailyRecord | null): TrackingProgress => {
    console.log('🧮 HOME: Calculating progress for record:', record);
    
    const progress: TrackingProgress = {
      meals: 0,
      symptoms: 0,
      digestive: 0,
      optional: {
        sport: 0,
        cycle: 0,
        drinks: 0,
        snacks: 0,
        sleep: 0
      }
    };

    if (!record) {
      console.log('🧮 HOME: No record, returning 0% progress');
      return progress;
    }

    // Sleep (20%)
    const hasSleepData = record.sleep && (record.sleep.bedTime || record.sleep.wakeTime);
    progress.optional.sleep = hasSleepData ? 20 : 0;
    console.log('😴 HOME: Sleep progress:', progress.optional.sleep, '(has data:', !!hasSleepData, ')');

    // Meals (20%)
    if (record.meals) {
      const hasMeals = record.meals.morning || record.meals.afternoon || record.meals.evening;
      progress.meals = hasMeals ? 20 : 0;
      console.log('🍽️ HOME: Meals progress:', progress.meals, '(has data:', !!hasMeals, ')');
    } else {
      console.log('🍽️ HOME: No meals data');
    }

    // Sport (20%)
    progress.optional.sport = (record.activity && record.activity.length > 0) ? 20 : 0;
    console.log('💪 HOME: Sport progress:', progress.optional.sport, '(activity:', record.activity, ')');

    // Cycle (20%)
    progress.optional.cycle = record.period ? 20 : 0;
    console.log('🌸 HOME: Cycle progress:', progress.optional.cycle, '(period:', record.period, ')');

    // Symptoms (20%)
    progress.symptoms = (record.symptoms && record.symptoms.length > 0) ? 20 : 0;
    console.log('🩺 HOME: Symptoms progress:', progress.symptoms, '(symptoms:', record.symptoms, ')');

    const totalProgress = progress.meals + progress.symptoms + progress.optional.sleep + progress.optional.sport + progress.optional.cycle;
    console.log('📊 HOME: Total calculated progress:', totalProgress, '%');

    return progress;
  };

  // Generate tasks based on tracking progress (20% per tab)
  const generateTasksFromProgress = (progress: TrackingProgress): Task[] => {
    return [
      {
        id: '1',
        text: 'Log your sleep schedule',
        completed: progress.optional.sleep >= 20,
        progress: progress.optional.sleep,
        required: true
      },
      {
        id: '2',
        text: 'Complete your meals',
        completed: progress.meals >= 20,
        progress: progress.meals,
        required: true
      },
      {
        id: '3',
        text: 'Log physical activity',
        completed: progress.optional.sport >= 20,
        progress: progress.optional.sport,
        required: true
      },
      {
        id: '4',
        text: 'Track menstrual cycle',
        completed: progress.optional.cycle >= 20,
        progress: progress.optional.cycle,
        required: false // Made optional since not everyone needs this
      },
      {
        id: '5', 
        text: 'Track your symptoms',
        completed: progress.symptoms >= 20,
        progress: progress.symptoms,
        required: true
      }
    ];
  };

  // Load data on component mount and when selectedDate changes
  useEffect(() => {
    const loadData = async () => {
      const savedCharacter = await loadSavedCharacter();
      setCharacter(savedCharacter);
      
      if (user) {
        try {
          const date = selectedDate.toISOString().split('T')[0];
          console.log('🏠 HOME: Loading data for date:', date, 'user:', user.id);
          const record = await trackingService.getTrackingByDate(user.id, date);
          console.log('📦 HOME: Loaded record:', record);
          setDailyRecord(record);
          const p = await profileService.getProfile(user.id);
          setProfile(p);
          
          const progress = calculateTrackingProgress(record);
          console.log('📊 HOME: Calculated progress:', progress);
          setTrackingProgress(progress);
          setTasks(generateTasksFromProgress(progress));
        } catch (error) {
          console.error('❌ HOME: Error loading tracking data:', error);
          // Set empty progress and tasks if there's an error
          setTasks(generateTasksFromProgress(trackingProgress));
        }
      }
    };
    
    loadData();
  }, [user, selectedDate, refreshTrigger]); // Added refreshTrigger

  // Add focus listener to reload data when returning from tracking
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const savedCharacter = await loadSavedCharacter();
      setCharacter(savedCharacter);
      
      if (user) {
        try {
          const date = selectedDate.toISOString().split('T')[0];
          const record = await trackingService.getTrackingByDate(user.id, date);
          setDailyRecord(record);
          
          const progress = calculateTrackingProgress(record);
          setTrackingProgress(progress);
          setTasks(generateTasksFromProgress(progress));
        } catch (error) {
          console.error('Error loading tracking data:', error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, user, selectedDate, refreshTrigger]); // Added refreshTrigger

  const todayKey = selectedDate.toLocaleDateString('sv-SE');
  const markedDates = [todayKey];

  // Navigate to specific tracking tab or digestive
  const navigateToTracking = (tab: string) => {
    if (tab === 'digestive') {
      navigation.navigate('DigestiveScreen' as never);
    } else {
      navigation.navigate('Tracking' as never);
    }
  };

  // Simple progress calculation: completed activities / total activities
  const completedActivities = [
    trackingProgress.optional?.sleep > 0, // Sleep tracked
    trackingProgress.meals > 0, // Meals tracked
    trackingProgress.optional?.sport > 0, // Sport activity
    trackingProgress.optional?.cycle > 0, // Cycle tracked
    trackingProgress.symptoms > 0, // Symptoms tracked
  ].filter(Boolean).length;
  
  const totalActivities = 5;
  const simpleProgress = Math.round((completedActivities / totalActivities) * 100);
  
  // Calculate total progress from trackingProgress (should match simpleProgress)
  const totalTrackingProgress = trackingProgress.meals + trackingProgress.symptoms + 
    trackingProgress.optional.sleep + trackingProgress.optional.sport + trackingProgress.optional.cycle;
  
  console.log('🏠 HOME: Simple progress:', simpleProgress, '% | Total tracking progress:', totalTrackingProgress, '%');
  
  const completedRequiredTasks = tasks.filter(task => task.required && task.completed).length;
  const totalRequiredTasks = tasks.filter(task => task.required).length;

  // Simple calendar grid
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setShowCalendar(false)}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekdaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isFuture = day > today; // Check if date is in the future
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (!isFuture) { // Only allow selection if not future
                    setSelectedDate(day);
                    setShowCalendar(false);
                  }
                }}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDay,
                  isFuture && styles.disabledDay // Add disabled style for future dates
                ]}
                disabled={isFuture} // Disable touch for future dates
              >
                <Text style={[
                  styles.dayText,
                  isSelected ? styles.selectedDayText :
                  isToday ? styles.todayText :
                  isFuture ? styles.disabledDayText : // Gray out future dates
                  isCurrentMonth ? styles.currentMonthText : styles.otherMonthText
                ]}>
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.padding}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerText}>Welcome back, Lotus!</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('CharacterCustomization' as never)}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={24} color="#d97706" />
            </TouchableOpacity>
          </View>

          {/* Date Selector */}
          <View style={styles.dateSelector}>
            <TouchableOpacity 
              onPress={() => setShowCalendar(!showCalendar)}
              style={styles.dateSelectorButton}
            >
              <Text style={styles.dateSelectorText}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Espace */}
          <View style={{ height: 16 }} />

          {/* Simple Daily Progress */}
          <View style={styles.card}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={styles.progressPercentage}>{totalTrackingProgress}%</Text>
            </View>
            
            {/* Main Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${Math.min(totalTrackingProgress, 100)}%` }
                ]}
              />
            </View>

            <View style={styles.progressSummary}>
              <Text style={styles.progressSummaryText}>
                {completedActivities} of {totalActivities} activities completed
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  onPress={() => navigateToTracking('meals')}
                  style={[styles.quickActionButton, styles.quickActionYellow]}
                >
                  <Text style={{ fontSize: 20 }}>🍽️</Text>
                  <Text style={[styles.quickActionText, styles.quickActionTextYellow]}>Log Meals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigateToTracking('symptoms')}
                  style={[styles.quickActionButton, styles.quickActionPurple]}
                >
                  <Text style={{ fontSize: 20 }}>🩺</Text>
                  <Text style={[styles.quickActionText, styles.quickActionTextPurple]}>Add Symptoms</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.quickActionsRow, { marginTop: 8 }]}>
                <TouchableOpacity
                  onPress={() => navigateToTracking('digestive')}
                  style={[styles.quickActionButton, styles.quickActionBlue]}
                >
                  <Text style={{ fontSize: 20 }}>📸</Text>
                  <Text style={[styles.quickActionText, styles.quickActionTextBlue]}>Take Photos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigateToTracking('sleep')}
                  style={[styles.quickActionButton, styles.quickActionGreen]}
                >
                  <Text style={{ fontSize: 20 }}>😴</Text>
                  <Text style={[styles.quickActionText, styles.quickActionTextGreen]}>Log Sleep</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Your Lotus Character - Glamour Display */}
          <View style={styles.lotusCardGlamour}>
            <Text style={styles.characterTitle}>Your Lotus</Text>
            <Text style={styles.levelText}>Level {character.level}</Text>
            
            {/* Lotus + Endolots Section */}
            <View style={styles.lotusSection}>
              {/* Large Lotus in Center */}
              <View style={styles.lotusDisplay}>
                <DetailedCharacter character={character} size={240} />
              </View>
              
              {/* Endolots Display */}
              <View style={styles.endolotsDisplay}>
                <Ionicons name="diamond" size={20} color="#d97706" />
                <Text style={styles.endolotsNumber}>{character.endolots}</Text>
                <Text style={styles.endolotsLabel}>Endolots</Text>
              </View>
            </View>
            
            {/* Customize Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('CharacterCustomization' as never)}
              style={styles.customizeButtonGlamour}
            >
              <Text style={styles.customizeButtonTextGlamour}>Customize Your Lotus</Text>
            </TouchableOpacity>
          </View>

          {/* Today's Tasks */}
          <View style={styles.card}>
            <View style={styles.tasksHeader}>
              <Text style={styles.progressTitle}>Today's Tasks</Text>
              <View style={styles.tasksBadge}>
                <Text style={styles.tasksBadgeText}>
                  {completedRequiredTasks}/{totalRequiredTasks} required
                </Text>
              </View>
            </View>
            
            <View>
              {tasks.map(task => (
                <View
                  key={task.id}
                  style={[
                    styles.taskItem,
                    task.completed 
                      ? styles.taskCompleted
                      : task.required 
                      ? styles.taskRequired 
                      : styles.taskOptional
                  ]}
                >
                  <View style={styles.taskRow}>
                    <View style={styles.taskContent}>
                      <Ionicons 
                        name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                        size={20} 
                        color={task.completed ? "#10b981" : "#9ca3af"} 
                      />
                      <Text style={[
                        styles.taskText,
                        task.completed ? styles.taskTextCompleted : styles.taskTextDefault
                      ]}>
                        {task.text}
                      </Text>
                      {task.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  {/* Progress bar for each task */}
                  <View style={styles.taskProgressBar}>
                    <View 
                      style={[
                        styles.taskProgressFill,
                        { width: `${Math.min(task.progress, 100)}%` },
                        task.completed ? styles.taskProgressCompleted : 
                        task.required ? styles.taskProgressRequired : styles.taskProgressOptional
                      ]}
                    />
                  </View>
                  <Text style={styles.taskProgressText}>
                    {Math.round(task.progress)}% complete
                  </Text>
                </View>
              ))}
            </View>

            {/* Weekly weight task */}
            {(() => {
              if (!profile) return null;
              const dow = profile.weightDayOfWeek ?? -1;
              const todayDow = new Date().getDay();
              const lastEntry = (profile.weights || []).slice(-1)[0];
              const thisWeek = new Date();
              const startOfWeek = new Date(thisWeek);
              startOfWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
              const hasEntryThisWeek = (profile.weights || []).some(w => new Date(w.date) >= startOfWeek);
              const shouldAskToday = dow === todayDow && !hasEntryThisWeek;
              if (!shouldAskToday) return null;
              return (
                <View style={[styles.taskItem, styles.taskRequired]}>
                  <View style={styles.taskRow}>
                    <View style={styles.taskContent}>
                      <Ionicons name="fitness-outline" size={20} color="#2563eb" />
                      <Text style={[styles.taskText, styles.taskTextDefault]}>What is your weight?</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <TextInput
                      value={weightInput}
                      onChangeText={setWeightInput}
                      keyboardType="numeric"
                      style={{ backgroundColor: '#f3f4f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, flex: 1, marginRight: 8 }}
                      placeholder="kg"
                    />
                    <TouchableOpacity onPress={async () => {
                      if (!user) return;
                      const kg = parseFloat(weightInput || '0');
                      if (!(kg > 0)) return;
                      const date = new Date().toISOString().split('T')[0];
                      const updated = await profileService.upsertProfile(user.id, { weights: [ ...(profile.weights || []), { date, kg } ] });
                      setProfile(updated);
                      setWeightInput('');
                      Alert.alert('Saved', 'Weight entry saved');
                    }} style={[styles.continueButton, { paddingVertical: 10 }]}>
                      <Text style={styles.continueButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}

            <TouchableOpacity
              onPress={() => navigation.navigate('Tracking' as never)}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>
                Continue Tracking
              </Text>
            </TouchableOpacity>
          </View>


        </View>
      </ScrollView>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalContainer}>
          {renderCalendar()}
        </View>
      </Modal>
    </SafeAreaView>
  );
}