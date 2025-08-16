import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Dimensions, TextInput, Animated } from 'react-native';
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
  const [claimedForDate, setClaimedForDate] = useState<Record<string, boolean>>({});
  const collectAnimsRef = React.useRef<Record<string, Animated.Value>>({});
  const getCollectAnim = (id: string) => {
    if (!collectAnimsRef.current[id]) collectAnimsRef.current[id] = new Animated.Value(1);
    return collectAnimsRef.current[id];
  };
  const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  const getClaimKey = (taskId: string) => `claim_${user?.id || 'anon'}_${selectedDateStr}_${taskId}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  // Load claims for this date when tasks or date changes
  useEffect(() => {
    const loadClaims = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all((tasks || []).map(async (t) => {
        try {
          const v = await AsyncStorage.getItem(getClaimKey(t.id));
          map[t.id] = v === '1';
        } catch {}
      }));
      setClaimedForDate(map);
    };
    loadClaims();
  }, [tasks, selectedDateStr, user]);
  const [streak, setStreak] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
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
    const tasks: Task[] = [
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
    return tasks;
  };

  const saveWeight = async (kg: number) => {
    if (!user) return;
    try {
      const profile = await profileService.getProfile(user.id);
      const now = selectedDate.toISOString().split('T')[0];
      const weights = (profile?.weights || []).filter(w => w.date !== now);
      weights.push({ date: now, kg });
      const merged = await profileService.upsertProfile(user.id, { weights, weightKg: kg });
      setProfile(merged);
      setShowWeightModal(false);
      Alert.alert('Saved', 'Weight saved.');
    } catch {}
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
                        task.completed ? styles.taskTextCompleted : styles.taskTextDefault,
                        claimedForDate[task.id] ? { textDecorationLine: 'line-through', textDecorationColor: '#ef4444', color: '#ef4444' } : null
                      ]}>
                        {task.text}
                      </Text>
                      {task.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredBadgeText}>REQUIRED</Text>
                        </View>
                      )}
                    </View>
                    {task.completed && !claimedForDate[task.id] && (
                      <Animated.View style={{ transform: [{ scale: getCollectAnim(task.id) }] }}>
                        <TouchableOpacity onPress={async () => {
                          if (claimedForDate[task.id]) return;
                          const anim = getCollectAnim(task.id);
                          const pulse = [
                            Animated.timing(anim, { toValue: 0.9, duration: 70, useNativeDriver: true }),
                            Animated.spring(anim, { toValue: 1, friction: 3, tension: 160, useNativeDriver: true })
                          ];
                          Animated.sequence([...pulse, ...pulse, ...pulse]).start();
                          setTimeout(async () => {
                            if (claimedForDate[task.id]) return;
                            setClaimedForDate(prev => ({ ...prev, [task.id]: true }));
                            try { await AsyncStorage.setItem(getClaimKey(task.id), '1'); } catch {}
                            setCharacter(prev => ({ ...prev, endolots: (prev.endolots || 0) + 1 } as any));
                            try {
                              await AsyncStorage.setItem('savedCharacter', JSON.stringify({ ...character, endolots: (character.endolots || 0) + 1 }));
                            } catch {}
                            Alert.alert('Reward', '+1 Endolot collected');
                          }, 240);
                        }} style={{ backgroundColor: '#ffd700', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#b8860b', shadowColor: '#000', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 }}>
                          <Text style={{ color: '#1f2937', fontSize: 13 }}>💎</Text>
                          <Text style={{ color: '#1f2937', fontWeight: '800', fontSize: 13 }}>Collect +1</Text>
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </View>
                </View>
              ))}
            </View>

                         {/* Monthly weight prompt on the 10th with select box */}
             {(() => {
               if (!profile) return null;
               const dayOfMonth = selectedDate.getDate();
               if (dayOfMonth !== 10) return null;
               const today = selectedDate.toISOString().split('T')[0];
               const already = (profile.weights || []).some(w => w.date === today);
               return (
                 <View style={[styles.taskItem, already ? styles.taskCompleted : styles.taskRequired]}>
                   <View style={styles.taskRow}>
                     <View style={styles.taskContent}>
                       <Ionicons name="fitness-outline" size={20} color="#2563eb" />
                       <Text style={[styles.taskText, already ? { textDecorationLine: 'line-through', textDecorationColor: '#ef4444', color: '#ef4444' } : styles.taskTextDefault]}>
                                                   What is your weight? {already && (profile?.weightKg ?? 0) > 0 ? `(${profile?.weightKg} kg)` : ''}
                       </Text>
                     </View>
                     {!already && (
                       <TouchableOpacity onPress={() => setShowWeightModal(true)} style={{ backgroundColor: '#ffd700', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#b8860b' }}>
                         <Text style={{ color: '#1f2937', fontWeight: '800' }}>💎 Collect +1</Text>
                       </TouchableOpacity>
                     )}
                     {already && (
                       <TouchableOpacity onPress={() => setShowWeightModal(true)} style={{ backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#d1d5db' }}>
                         <Text style={{ color: '#111827', fontWeight: '700' }}>Edit</Text>
                       </TouchableOpacity>
                     )}
                   </View>
                 </View>
               );
             })()}

             {/* Weight select modal */}
             <Modal visible={showWeightModal} transparent animationType="fade" onRequestClose={() => setShowWeightModal(false)}>
               <View style={styles.modalOverlay}>
                 <View style={[styles.modalCard, { maxWidth: 360 }]}>
                   <Text style={styles.modalTitle}>Select your weight (kg)</Text>
                   <View style={{ maxHeight: 220, marginTop: 8 }}>
                     <ScrollView>
                       {[...Array(151)].map((_, i) => 30 + i).map((kg) => (
                         <TouchableOpacity key={kg} onPress={() => setWeightInput(String(kg))} style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: weightInput===String(kg)?'#eef2ff':'#ffffff', borderRadius: 8, marginBottom: 6 }}>
                           <Text style={{ color: '#111827', fontWeight: weightInput===String(kg)?'700':'500' }}>{kg}</Text>
                         </TouchableOpacity>
                       ))}
                     </ScrollView>
                   </View>
                   <View style={styles.navigationContainer}>
                     <TouchableOpacity onPress={() => setShowWeightModal(false)} style={[styles.navButton, styles.navButtonDisabled]}>
                       <Text style={styles.navButtonTextDisabled}>Cancel</Text>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={async () => {
                       if (!user) return;
                       const kg = parseFloat(weightInput || '0');
                       if (!(kg > 0)) return;
                       const date = selectedDate.toISOString().split('T')[0];
                       const existing = ((profile?.weights || []) as any[]).filter((w: any) => w.date !== date);
                       const updated = await profileService.upsertProfile(user.id, { weights: [ ...existing, { date, kg } ], weightKg: kg });
                       setProfile(updated);
                       setShowWeightModal(false);
                       setWeightInput('');
                       Alert.alert('Saved', 'Weight entry saved');
                     }} style={[styles.navButton, styles.navButtonPrimary]}>
                       <Text style={styles.navButtonTextPrimary}>Save</Text>
                     </TouchableOpacity>
                   </View>
                 </View>
               </View>
             </Modal>

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