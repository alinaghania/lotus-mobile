import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useDate } from '../contexts/DateContext';
import { trackingService } from '../services/trackingService';
import { DailyRecord, MealData, TrackingProgress } from '../types/tracking';
import MultiSelect from '../components/MultiSelect';
import { mealOptions, snackOptions, drinkTypes, sportActivities, weekDays } from '../constants/meals';
import { useNavigation } from '@react-navigation/native';

import { trackingStyles } from '../styles/trackingStyles';

const SYMPTOMS = [
  // Physical Symptoms
  'Headache', 'Migraine', 'Fatigue', 'Dizziness', 'Nausea', 'Vomiting', 
  'Fever', 'Chills', 'Body Aches', 'Joint Pain', 'Muscle Pain', 'Back Pain',
  'Neck Pain', 'Chest Pain', 'Shortness of Breath',
  
  // Digestive Issues
  'Bloating', 'Gas', 'Stomach Pain', 'Acid Reflux', 'Heartburn', 'Constipation',
  'Diarrhea', 'Cramps', 'Loss of Appetite', 'Food Cravings',
  
  // Mental & Emotional
  'Anxiety', 'Depression', 'Mood Swings', 'Irritability', 'Stress', 'Brain Fog',
  'Concentration Issues', 'Memory Problems', 'Overwhelmed',
  
  // Energy & Sleep
  'Low Energy', 'High Energy', 'Insomnia', 'Drowsiness', 'Restless Sleep',
  'Night Sweats', 'Sleep Disturbances',
  
  // Skin & Appearance
  'Acne', 'Dry Skin', 'Rash', 'Itching', 'Dark Circles', 'Puffy Eyes',
  'Hair Loss', 'Brittle Nails',
  
  // Women's Health
  'PMS', 'Menstrual Cramps', 'Breast Tenderness', 'Hot Flashes',
  'Hormonal Changes',
  
  // Other
  'Allergies', 'Congestion', 'Sore Throat', 'Cough', 'Swollen Lymph Nodes',
  'Other'
];

type TabType = 'meals' | 'sport' | 'cycle' | 'symptoms' | 'sleep';
type MealSection = 'morning' | 'afternoon' | 'evening' | 'snack' | 'drinks';

export default function TrackingScreen({ route }: { route?: { params?: { initialTab?: TabType } } }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'sleep');
  const [saved, setSaved] = useState(false);
  const { selectedDate, triggerRefresh } = useDate();

  // Symptoms state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Sport state
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [sportDurations, setSportDurations] = useState<Record<string, number>>({});
  const [sameSportRoutine, setSameSportRoutine] = useState(false);
  const [routineDays, setRoutineDays] = useState<string[]>([]);
  const [routineTime, setRoutineTime] = useState('');

  // Sleep state
  const [sleepData, setSleepData] = useState({
    bedTime: '',
    wakeTime: '',
    sleepQuality: 0,
    sleepDuration: 0
  });
  const [sameSleepRoutine, setSameSleepRoutine] = useState(false);

  // Auto-calculate sleep duration when bedTime or wakeTime changes
  useEffect(() => {
    if (sleepData.bedTime && sleepData.wakeTime) {
      const bedTime = new Date(`2024-01-01 ${sleepData.bedTime}`);
      let wakeTime = new Date(`2024-01-01 ${sleepData.wakeTime}`);
      
      // If wake time is earlier than bed time, assume it's next day
      if (wakeTime < bedTime) {
        wakeTime = new Date(`2024-01-02 ${sleepData.wakeTime}`);
      }
      
      const diffMs = wakeTime.getTime() - bedTime.getTime();
      const duration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
      
      if (duration > 0 && duration !== sleepData.sleepDuration) {
        setSleepData(prev => ({ ...prev, sleepDuration: duration }));
      }
    }
  }, [sleepData.bedTime, sleepData.wakeTime]);

  // Load saved data when component mounts or date changes
  useEffect(() => {
    const loadSavedData = async () => {
      if (!user) return;

      try {
        const date = selectedDate.toISOString().split('T')[0];
        console.log('🔍 TRACKING: Loading data for date:', date, 'user:', user.id);
        const record = await trackingService.getTrackingByDate(user.id, date);
        console.log('📦 TRACKING: Loaded record:', record);
        
        if (record) {
          // Load sleep data
          if (record.sleep) {
            console.log('😴 TRACKING: Loading sleep data:', record.sleep);
            setSleepData({
              bedTime: record.sleep.bedTime || '',
              wakeTime: record.sleep.wakeTime || '',
              sleepQuality: record.sleep.sleepQuality || 0,
              sleepDuration: record.sleep.sleepDuration || 0
            });
          } else {
            console.log('😴 TRACKING: No sleep data found - resetting');
            setSleepData({
              bedTime: '',
              wakeTime: '',
              sleepQuality: 0,
              sleepDuration: 0
            });
          }

          // Load meal data
          if (record.meals) {
            console.log('🍽️ TRACKING: Loading meal data:', record.meals);
            setMealData({
              morning: record.meals.morning || '',
              afternoon: record.meals.afternoon || '',
              evening: record.meals.evening || '',
              snack: record.meals.snack || '',
              drinkType: record.meals.drinkType || '',
              drinkQuantities: record.meals.drinkQuantities || {}
            });
          } else {
            console.log('🍽️ TRACKING: No meal data found - resetting');
            setMealData({
              morning: '',
              afternoon: '',
              evening: '',
              snack: '',
              drinkType: '',
              drinkQuantities: {}
            });
          }

          // Load symptoms
          if (record.symptoms) {
            console.log('🩺 TRACKING: Loading symptoms:', record.symptoms);
            setSelectedSymptoms(record.symptoms);
          } else {
            console.log('🩺 TRACKING: No symptoms found - resetting');
            setSelectedSymptoms([]);
          }

          // Load sports
          if (record.activity) {
            console.log('💪 TRACKING: Loading activity:', record.activity);
            setSelectedSports(record.activity);
          } else {
            console.log('💪 TRACKING: No activity found - resetting');
            setSelectedSports([]);
          }

          // Load cycle data
          if (record.period) {
            console.log('🌸 TRACKING: Loading period:', record.period);
            setHasPeriod(record.period.active ? 'yes' : 'no');
          } else {
            console.log('🌸 TRACKING: No period data found - resetting');
            setHasPeriod('');
          }
        } else {
          console.log('❌ TRACKING: No record found for this date - resetting all states');
          // Reset all states when no record exists for this date
          setSleepData({
            bedTime: '',
            wakeTime: '',
            sleepQuality: 0,
            sleepDuration: 0
          });
          setMealData({
            morning: '',
            afternoon: '',
            evening: '',
            snack: '',
            drinkType: '',
            drinkQuantities: {}
          });
          setSelectedSymptoms([]);
          setSelectedSports([]);
          setHasPeriod('');
        }
      } catch (error) {
        console.error('❌ TRACKING: Error loading saved data:', error);
      }
    };

    loadSavedData();
  }, [user, selectedDate]); // Load when user or date changes

  // Add focus listener to reload data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!user) return;

      try {
        const date = selectedDate.toISOString().split('T')[0];
        const record = await trackingService.getTrackingByDate(user.id, date);
        
        if (record) {
          // Reload all data when screen is focused
          if (record.sleep) {
            setSleepData({
              bedTime: record.sleep.bedTime || '',
              wakeTime: record.sleep.wakeTime || '',
              sleepQuality: record.sleep.sleepQuality || 0,
              sleepDuration: record.sleep.sleepDuration || 0
            });
          } else {
            setSleepData({
              bedTime: '',
              wakeTime: '',
              sleepQuality: 0,
              sleepDuration: 0
            });
          }

          if (record.meals) {
            setMealData({
              morning: record.meals.morning || '',
              afternoon: record.meals.afternoon || '',
              evening: record.meals.evening || '',
              snack: record.meals.snack || '',
              drinkType: record.meals.drinkType || '',
              drinkQuantities: record.meals.drinkQuantities || {}
            });
          } else {
            setMealData({
              morning: '',
              afternoon: '',
              evening: '',
              snack: '',
              drinkType: '',
              drinkQuantities: {}
            });
          }

          if (record.symptoms) {
            setSelectedSymptoms(record.symptoms);
          } else {
            setSelectedSymptoms([]);
          }

          if (record.activity) {
            setSelectedSports(record.activity);
          } else {
            setSelectedSports([]);
          }

          if (record.period) {
            setHasPeriod(record.period.active ? 'yes' : 'no');
          } else {
            setHasPeriod('');
          }
        } else {
          // Reset all states when no record exists for this date
          setSleepData({
            bedTime: '',
            wakeTime: '',
            sleepQuality: 0,
            sleepDuration: 0
          });
          setMealData({
            morning: '',
            afternoon: '',
            evening: '',
            snack: '',
            drinkType: '',
            drinkQuantities: {}
          });
          setSelectedSymptoms([]);
          setSelectedSports([]);
          setHasPeriod('');
        }
      } catch (error) {
        console.error('Error loading saved data on focus:', error);
      }
    });

    return unsubscribe;
  }, [navigation, user, selectedDate]);

  // Cycle state
  const [hasPeriod, setHasPeriod] = useState<'yes' | 'no' | 'none' | ''>('');

  // Meals state
  const [mealData, setMealData] = useState<MealData>({
    morning: '',
    afternoon: '',
    evening: '',
    snack: '',
    drinkType: '',
    drinkQuantities: {}
  });
  const [mealSectionIndex, setMealSectionIndex] = useState(0);

  const mealSections = [
    { icon: 'sunny-outline', title: 'Morning', key: 'morning' as const, type: 'meal' as const, required: true },
    { icon: 'partly-sunny-outline', title: 'Afternoon', key: 'afternoon' as const, type: 'meal' as const, required: true },
    { icon: 'moon-outline', title: 'Evening', key: 'evening' as const, type: 'meal' as const, required: true },
    { icon: 'fast-food-outline', title: 'Snacks', key: 'snack' as const, type: 'snack' as const, required: false },
    { icon: 'water-outline', title: 'Drinks', key: 'drinks' as const, type: 'drink' as const, required: false },
  ];

  // Check if a meal section is completed
  const isMealSectionCompleted = (sectionIndex: number): boolean => {
    const section = mealSections[sectionIndex];
    if (!section.required) return true; // Optional sections don't block progression
    
    const value = mealData[section.key as keyof MealData] as string;
    return value && value.trim() !== '';
  };

  // Check if user can proceed to next meal section
  const canProceedToNext = (): boolean => {
    return isMealSectionCompleted(mealSectionIndex);
  };

  // Save to database with proper date and alerts
  const saveToDatabase = async (data: Partial<DailyRecord>) => {
    if (!user) return;

    try {
      const date = selectedDate.toISOString().split('T')[0]; // Use selectedDate not today
      console.log('💾 TRACKING: Saving data for date:', date);
      console.log('💾 TRACKING: Data to save:', data);
      await trackingService.updateTracking(user.id, date, data); // Use updateTracking to merge data
      console.log('✅ TRACKING: Data saved successfully');
      Alert.alert('Success', 'Data saved successfully!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      triggerRefresh(); // Trigger refresh in Home screen
    } catch (error) {
      console.error('❌ TRACKING: Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleSaveSymptoms = async () => {
    await saveToDatabase({ symptoms: selectedSymptoms });
  };

  const handleSaveSport = async () => {
    await saveToDatabase({
      activity: selectedSports // Now array of strings
    });
  };

  const handleSaveCycle = async () => {
    await saveToDatabase({
      period: {
        active: hasPeriod === 'yes',
        flow: 'medium' as const,
        pain: 'none' as const,
        notes: ''
      }
    });
  };

  const handleSaveMeals = async () => {
    await saveToDatabase({
      meals: mealData,
      hydration: {
        count: Object.values(mealData.drinkQuantities || {}).reduce((a, b) => a + b, 0),
        types: (mealData.drinkType || '').split(',').filter(Boolean),
        notes: ''
      }
    });
  };

  const handleSaveSleep = async () => {
    // Calculate duration automatically
    let calculatedDuration = sleepData.sleepDuration;
    if (sleepData.bedTime && sleepData.wakeTime) {
      const bedTime = new Date(`2024-01-01 ${sleepData.bedTime}`);
      let wakeTime = new Date(`2024-01-01 ${sleepData.wakeTime}`);
      
      // If wake time is earlier than bed time, assume it's next day
      if (wakeTime < bedTime) {
        wakeTime = new Date(`2024-01-02 ${sleepData.wakeTime}`);
      }
      
      const diffMs = wakeTime.getTime() - bedTime.getTime();
      calculatedDuration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
    }

    await saveToDatabase({
      sleep: {
        ...sleepData,
        sleepDuration: calculatedDuration
      }
    });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const renderProgressBar = () => {
    // Calculate progress: 20% per tab (5 tabs = 100%) - SAME AS HOME
    // Use current local state to show real-time progress including unsaved changes
    const tabProgress = {
      sleep: (sleepData.bedTime || sleepData.wakeTime) ? 20 : 0,
      meals: (mealData.morning || mealData.afternoon || mealData.evening) ? 20 : 0,
      sport: selectedSports.length > 0 ? 20 : 0,
      cycle: hasPeriod && hasPeriod !== '' ? 20 : 0,
      symptoms: selectedSymptoms.length > 0 ? 20 : 0,
    };
    
    console.log('🧮 TRACKING: Current states for progress calculation:');
    console.log('😴 TRACKING: sleepData:', sleepData, '→ progress:', tabProgress.sleep);
    console.log('🍽️ TRACKING: mealData:', mealData, '→ progress:', tabProgress.meals);
    console.log('💪 TRACKING: selectedSports:', selectedSports, '→ progress:', tabProgress.sport);
    console.log('🌸 TRACKING: hasPeriod:', hasPeriod, '→ progress:', tabProgress.cycle);
    console.log('🩺 TRACKING: selectedSymptoms:', selectedSymptoms, '→ progress:', tabProgress.symptoms);
    
    const totalProgress = Object.values(tabProgress).reduce((sum, val) => sum + val, 0);
    const completedTabs = Object.values(tabProgress).filter(val => val > 0).length;
    
    console.log('📊 TRACKING: Total calculated progress:', totalProgress, '%');
    
    return (
      <>
        {/* Date Display */}
        <View style={trackingStyles.dateDisplay}>
          <Text style={trackingStyles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={trackingStyles.progressCard}>
          <View style={trackingStyles.progressHeader}>
            <Text style={trackingStyles.progressTitle}>Daily Progress</Text>
            <Text style={trackingStyles.progressPercentage}>{totalProgress}%</Text>
          </View>
          
          {/* Main Progress Bar */}
          <View style={trackingStyles.progressBarContainer}>
            <View 
              style={[
                trackingStyles.progressBar,
                { width: `${Math.min(totalProgress, 100)}%` }
              ]}
            />
          </View>

          {/* 100% Completion Message */}
          {totalProgress === 100 && (
            <View style={trackingStyles.successMessage}>
              <Text style={trackingStyles.successText}>🎉 Congratulations!</Text>
              <Text style={trackingStyles.successSubtext}>You've completed all your daily health tracking!</Text>
            </View>
          )}

          {/* Simple Activities Checklist */}
          <View style={trackingStyles.progressBreakdown}>
            <Text style={trackingStyles.progressLabel}>Completed: {completedTabs} of 5 activities</Text>
          </View>
        </View>
      </>
    );
  };

  const renderTabs = () => (
    <View style={trackingStyles.tabsContainer}>
      {[
        { key: 'sleep', label: 'Sleep' },
        { key: 'meals', label: 'Meals' },
        { key: 'sport', label: 'Sport' },
        { key: 'cycle', label: 'Cycle' },
        { key: 'symptoms', label: 'Symptoms' }
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => setActiveTab(tab.key as TabType)}
          style={[
            trackingStyles.tab,
            activeTab === tab.key && trackingStyles.activeTab
          ]}
        >
          <Text style={[
            trackingStyles.tabText,
            activeTab === tab.key ? trackingStyles.activeTabText : trackingStyles.inactiveTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );



  const renderSymptomsTab = () => (
    <View style={trackingStyles.contentCard}>
      <View style={trackingStyles.contentHeader}>
        <Ionicons name="medical-outline" size={24} color="#ef4444" />
        <Text style={trackingStyles.contentTitle}>Symptoms</Text>
      </View>
      <Text style={trackingStyles.contentSubtitle}>
        Select any symptoms you're experiencing today
      </Text>
      
      <MultiSelect
        label="Symptoms"
        options={SYMPTOMS}
        value={selectedSymptoms}
        onChange={setSelectedSymptoms}
        allowOther
        category="symptoms"
      />

      <TouchableOpacity
        onPress={handleSaveSymptoms}
        style={trackingStyles.saveButton}
      >
        <Text style={trackingStyles.saveButtonText}>Save Symptoms</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMealsTab = () => {
    const currentSection = mealSections[mealSectionIndex];
    const isLastSection = mealSectionIndex === mealSections.length - 1;

    return (
      <View style={trackingStyles.contentCard}>
        <View style={trackingStyles.contentHeader}>
          <Ionicons name={currentSection.icon as any} size={24} color="#f59e0b" />
          <Text style={trackingStyles.contentTitle}>{currentSection.title}</Text>
          {currentSection.required && (
            <View style={trackingStyles.requiredBadge}>
              <Text style={trackingStyles.requiredBadgeText}>REQUIRED</Text>
            </View>
          )}
        </View>

        {currentSection.type === 'meal' && (() => {
          const mealVal = mealData[currentSection.key as keyof MealData] as string;
          const isFasting = mealVal === 'Fasting';
          return (
            <>
              <View style={trackingStyles.fastingContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (isFasting) {
                      setMealData(prev => ({ ...prev, [currentSection.key]: '' }));
                    } else {
                      setMealData(prev => ({ ...prev, [currentSection.key]: 'Fasting' }));
                    }
                  }}
                  style={[
                    trackingStyles.fastingButton,
                    isFasting ? trackingStyles.fastingButtonSelected : trackingStyles.fastingButtonUnselected
                  ]}
                >
                  <View style={[
                    trackingStyles.fastingCheckbox,
                    isFasting ? trackingStyles.fastingCheckboxSelected : trackingStyles.fastingCheckboxUnselected
                  ]}>
                    {isFasting && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={isFasting ? trackingStyles.fastingTextSelected : trackingStyles.fastingTextUnselected}>
                    Fasting
                  </Text>
                </TouchableOpacity>
              </View>
              <MultiSelect
                key={`${currentSection.key}-${isFasting}`}
                label={currentSection.title}
                options={currentSection.key === 'morning' ? mealOptions.breakfast : 
                        currentSection.key === 'afternoon' ? mealOptions.lunch : 
                        mealOptions.dinner}
                value={isFasting ? [] : mealVal.split(',').filter(Boolean)}
                onChange={(vals) => {
                  const filtered = vals.filter((v) => v !== 'Fasting');
                  const unique = Array.from(new Set(filtered));
                  setMealData(prev => ({ ...prev, [currentSection.key]: unique.join(',') }));
                }}
                allowOther
                disabled={isFasting}
              />
            </>
          );
        })()}

        {currentSection.type === 'snack' && (
          <MultiSelect
            label="snack"
            options={snackOptions}
            value={(mealData.snack || '').split(',').filter(Boolean)}
            onChange={(vals) => {
              const unique = Array.from(new Set(vals));
              setMealData(prev => ({ ...prev, snack: unique.join(',') }));
            }}
            allowOther
          />
        )}

        {currentSection.type === 'drink' && (
          <>
            <MultiSelect
              label="drink type"
              options={drinkTypes}
              value={(mealData.drinkType || '').split(',').filter(Boolean)}
              onChange={(vals) => {
                const unique = Array.from(new Set(vals));
                setMealData(prev => {
                  const newQ = { ...prev.drinkQuantities };
                  Object.keys(newQ).forEach((k) => {
                    if (!unique.includes(k)) delete newQ[k];
                  });
                  unique.forEach((d) => {
                    if (!(d in newQ)) newQ[d] = 0;
                  });
                  return { ...prev, drinkType: unique.join(','), drinkQuantities: newQ };
                });
              }}
              allowOther
            />
            <View style={trackingStyles.drinkQuantityContainer}>
              {(mealData.drinkType || '').split(',').filter(Boolean).map((item) => (
                <View key={item} style={trackingStyles.drinkQuantityRow}>
                  <View style={trackingStyles.drinkQuantityLabel}>
                    <Text style={trackingStyles.drinkQuantityLabelText}>{item}</Text>
                  </View>
                  <TextInput
                    value={String(mealData.drinkQuantities?.[item] ?? 0)}
                    onChangeText={(text) => {
                      const qty = parseInt(text) || 0;
                      setMealData(prev => ({
                        ...prev,
                        drinkQuantities: { ...prev.drinkQuantities, [item]: qty },
                      }));
                    }}
                    keyboardType="numeric"
                    style={trackingStyles.drinkQuantityInput}
                    placeholder="Quantity"
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Selected items display */}
        <View style={trackingStyles.selectedItemsContainer}>
          {(currentSection.type === 'snack' || currentSection.type === 'meal') && (() => {
            const raw = mealData[(currentSection.type === 'snack' ? 'snack' : currentSection.key) as keyof MealData] as string;
            if (raw === 'Fasting') {
              return [
                <View key="fast" style={trackingStyles.selectedItemFasting}>
                  <Text style={trackingStyles.selectedItemTextFasting}>Fasting</Text>
                  <TouchableOpacity
                    onPress={() => setMealData(prev => ({ ...prev, [currentSection.key]: '' }))}
                  >
                    <Ionicons name="close" size={16} color="#c2410c" />
                  </TouchableOpacity>
                </View>
              ];
            }
            return Array.from(new Set((raw || '').split(',').filter(Boolean))).map((item) => (
              <View key={item} style={trackingStyles.selectedItem}>
                <Text style={trackingStyles.selectedItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const prop = currentSection.type === 'snack' ? 'snack' : currentSection.key;
                    const items = ((mealData[prop as keyof MealData] as string) || '').split(',').filter((m) => m !== item);
                    setMealData(prev => ({ ...prev, [prop]: items.join(',') }));
                  }}
                >
                  <Ionicons name="close" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ));
          })()}
        </View>

        {/* Navigation */}
        <View style={trackingStyles.navigationContainer}>
          <TouchableOpacity
            disabled={mealSectionIndex === 0}
            onPress={() => setMealSectionIndex(i => Math.max(0, i - 1))}
            style={[
              trackingStyles.navButton,
              mealSectionIndex === 0 ? trackingStyles.navButtonDisabled : trackingStyles.navButtonEnabled
            ]}
          >
            <Text style={
              mealSectionIndex === 0 ? trackingStyles.navButtonTextDisabled : trackingStyles.navButtonTextEnabled
            }>
              Previous
            </Text>
          </TouchableOpacity>
          
          {isLastSection ? (
            <TouchableOpacity
              onPress={handleSaveMeals}
              style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}
            >
              <Text style={trackingStyles.navButtonTextPrimary}>Save Meals</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!canProceedToNext()}
              onPress={() => setMealSectionIndex(i => Math.min(mealSections.length - 1, i + 1))}
              style={[
                trackingStyles.navButton, 
                canProceedToNext() ? trackingStyles.navButtonPrimary : trackingStyles.navButtonDisabled
              ]}
            >
              <Text style={
                canProceedToNext() ? trackingStyles.navButtonTextPrimary : trackingStyles.navButtonTextDisabled
              }>
                Next
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSportTab = () => (
    <View style={trackingStyles.contentCard}>
      <View style={trackingStyles.contentHeader}>
        <Ionicons name="fitness-outline" size={24} color="#10b981" />
        <Text style={trackingStyles.contentTitle}>Physical Activity</Text>
        <View style={trackingStyles.optionalBadge}>
          <Text style={trackingStyles.optionalBadgeText}>OPTIONAL</Text>
        </View>
      </View>
      
      {/* Same Routine Toggle */}
      <View style={trackingStyles.routineToggleContainer}>
        <TouchableOpacity
          onPress={() => setSameSportRoutine(!sameSportRoutine)}
          style={trackingStyles.routineToggle}
        >
          <View style={[
            trackingStyles.routineCheckbox,
            sameSportRoutine ? trackingStyles.routineCheckboxSelected : trackingStyles.routineCheckboxUnselected
          ]}>
            {sameSportRoutine && <Ionicons name="checkmark" size={12} color="white" />}
          </View>
          <Text style={trackingStyles.routineToggleText}>Same routine</Text>
        </TouchableOpacity>
        {sameSportRoutine && (
          <Text style={trackingStyles.routineHint}>Pre-filled from your saved routine</Text>
        )}
      </View>

      <MultiSelect
        label="Activity Type"
        options={sportActivities}
        value={selectedSports}
        onChange={setSelectedSports}
        allowOther
        category="sports"
      />

      {/* Duration and Schedule */}
      {selectedSports.length > 0 && (
        <View style={trackingStyles.sportActivitiesContainer}>
          {selectedSports.map(activity => (
            <View key={activity} style={trackingStyles.sportActivityCard}>
              <Text style={trackingStyles.sportActivityTitle}>{activity}</Text>
              
              <View style={trackingStyles.sportActivityRow}>
                <Text style={trackingStyles.sportActivityLabel}>Duration (minutes):</Text>
                <TextInput
                  value={String(sportDurations[activity] || '')}
                  onChangeText={(text) => {
                    const duration = parseInt(text) || 0;
                    setSportDurations(prev => ({ ...prev, [activity]: duration }));
                  }}
                  keyboardType="numeric"
                  style={trackingStyles.sportActivityInput}
                  placeholder="30"
                />
              </View>

              {sameSportRoutine && (
                <>
                  <MultiSelect
                    label="Days of the week"
                    options={weekDays}
                    value={routineDays}
                    onChange={setRoutineDays}
                  />
                  
                  <View style={trackingStyles.sportActivityRow}>
                    <Text style={trackingStyles.sportActivityLabel}>Time:</Text>
                    <TextInput
                      value={routineTime}
                      onChangeText={setRoutineTime}
                      style={trackingStyles.sportActivityInput}
                      placeholder="e.g., 18:00"
                    />
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={handleSaveSport}
        style={trackingStyles.saveButton}
      >
        <Text style={trackingStyles.saveButtonText}>Save Activity</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCycleTab = () => (
    <View style={trackingStyles.contentCard}>
      <View style={trackingStyles.contentHeader}>
        <Ionicons name="calendar-outline" size={24} color="#ec4899" />
        <Text style={trackingStyles.contentTitle}>Menstrual Cycle</Text>
        <View style={trackingStyles.optionalBadge}>
          <Text style={trackingStyles.optionalBadgeText}>OPTIONAL</Text>
        </View>
      </View>
      
      <Text style={trackingStyles.contentSubtitle}>Are you currently on your period?</Text>
      
      <View style={trackingStyles.cycleOptionsContainer}>
        {[
          { key: 'yes', label: 'Yes, I am on my period' },
          { key: 'no', label: 'No, I am not on my period' },
          { key: 'none', label: 'Not applicable' }
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setHasPeriod(option.key as any)}
            style={[
              trackingStyles.cycleOption,
              hasPeriod === option.key ? trackingStyles.cycleOptionSelected : trackingStyles.cycleOptionUnselected
            ]}
          >
            <View style={[
              trackingStyles.cycleOptionRadio,
              hasPeriod === option.key ? trackingStyles.cycleOptionRadioSelected : trackingStyles.cycleOptionRadioUnselected
            ]}>
              {hasPeriod === option.key && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text style={hasPeriod === option.key ? trackingStyles.cycleOptionTextSelected : trackingStyles.cycleOptionTextUnselected}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleSaveCycle}
        style={trackingStyles.saveButton}
      >
        <Text style={trackingStyles.saveButtonText}>Save Cycle Info</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSleepTab = () => (
    <View style={trackingStyles.contentCard}>
      <View style={trackingStyles.contentHeader}>
        <Ionicons name="moon-outline" size={24} color="#7c3aed" />
        <Text style={trackingStyles.contentTitle}>Sleep Tracking</Text>
        <View style={trackingStyles.optionalBadge}>
          <Text style={trackingStyles.optionalBadgeText}>OPTIONAL</Text>
        </View>
      </View>
      
      {/* Same Routine Toggle */}
      <View style={trackingStyles.routineToggleContainer}>
        <TouchableOpacity
          onPress={() => setSameSleepRoutine(!sameSleepRoutine)}
          style={trackingStyles.routineToggle}
        >
          <View style={[
            trackingStyles.routineCheckbox,
            sameSleepRoutine ? trackingStyles.routineCheckboxSelected : trackingStyles.routineCheckboxUnselected
          ]}>
            {sameSleepRoutine && <Ionicons name="checkmark" size={12} color="white" />}
          </View>
          <Text style={trackingStyles.routineToggleText}>Same sleep routine</Text>
        </TouchableOpacity>
        {sameSleepRoutine && (
          <Text style={trackingStyles.routineHint}>Pre-filled from your saved sleep schedule</Text>
        )}
      </View>

      <View style={trackingStyles.sportActivityCard}>
        <Text style={trackingStyles.sportActivityTitle}>Sleep Schedule</Text>
        
        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Bedtime:</Text>
          <TextInput
            value={sleepData.bedTime}
            onChangeText={(text) => setSleepData(prev => ({ ...prev, bedTime: text }))}
            style={trackingStyles.sportActivityInput}
            placeholder="e.g., 23:00"
          />
        </View>

        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Wake time:</Text>
          <TextInput
            value={sleepData.wakeTime}
            onChangeText={(text) => setSleepData(prev => ({ ...prev, wakeTime: text }))}
            style={trackingStyles.sportActivityInput}
            placeholder="e.g., 07:00"
          />
        </View>

        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Sleep quality (1-10):</Text>
          <TextInput
            value={String(sleepData.sleepQuality || '')}
            onChangeText={(text) => {
              const quality = parseInt(text) || 0;
              setSleepData(prev => ({ ...prev, sleepQuality: Math.max(0, Math.min(10, quality)) }));
            }}
            keyboardType="numeric"
            style={trackingStyles.sportActivityInput}
            placeholder="8"
          />
        </View>

        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Duration:</Text>
          <View style={[trackingStyles.sportActivityInput, { justifyContent: 'center', backgroundColor: '#f3f4f6' }]}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>
              {sleepData.sleepDuration > 0 ? `${sleepData.sleepDuration}h` : 'Auto-calculated'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSaveSleep}
        style={trackingStyles.saveButton}
      >
        <Text style={trackingStyles.saveButtonText}>Save Sleep Data</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'symptoms':
        return renderSymptomsTab();
      case 'meals':
        return renderMealsTab();
      case 'sport':
        return renderSportTab();
      case 'cycle':
        return renderCycleTab();
      case 'sleep':
        return renderSleepTab();
      default:
        return renderSymptomsTab();
    }
  };

  return (
    <SafeAreaView style={trackingStyles.container}>
      <View style={trackingStyles.scrollContainer}>
        <ScrollView style={trackingStyles.padding}>
          {/* Simplified Header */}
          <View style={trackingStyles.header}>
            <Text style={trackingStyles.welcomeText}>Track Your Health</Text>
          </View>

          {renderProgressBar()}
          {renderTabs()}

          <View style={trackingStyles.content}>
            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 