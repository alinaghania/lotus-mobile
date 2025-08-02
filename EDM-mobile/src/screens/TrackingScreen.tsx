import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { trackingService } from '../services/trackingService';
import { DailyRecord, MealData, TrackingProgress } from '../types/tracking';
import MultiSelect from '../components/MultiSelect';
import { mealOptions, snackOptions, drinkTypes, sportActivities, weekDays } from '../constants/meals';

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
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'symptoms');
  const [saved, setSaved] = useState(false);

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

  // Calculate progress
  const calculateProgress = (): TrackingProgress => {
    const progress: TrackingProgress = {
      meals: 0,
      symptoms: 0,
      digestive: 0,
      optional: {
        sport: 0,
        cycle: 0,
        drinks: 0,
        snacks: 0
      }
    };

    // Required meals (20% each = 60% total)
    const requiredMeals = ['morning', 'afternoon', 'evening'];
    const completedMeals = requiredMeals.filter(meal => {
      const value = mealData[meal as keyof MealData] as string;
      return value && (value === 'Fasting' || value.trim() !== '');
    });
    progress.meals = (completedMeals.length / requiredMeals.length) * 60;

    // Symptoms (20%)
    progress.symptoms = selectedSymptoms.length > 0 ? 20 : 0;

    // Digestive photos would be calculated from DigestiveIssuesScreen (20%)
    // For now, we'll assume it's tracked separately
    progress.digestive = 0; // Will be updated when digestive screen is integrated

    // Optional items
    progress.optional.sport = sportActivities.length > 0 ? 100 : 0;
    progress.optional.cycle = hasPeriod !== '' ? 100 : 0;
    progress.optional.drinks = mealData.drinkType && mealData.drinkType.trim() !== '' ? 100 : 0;
    progress.optional.snacks = mealData.snack && mealData.snack.trim() !== '' ? 100 : 0;

    return progress;
  };

  const progress = calculateProgress();
  const totalProgress = progress.meals + progress.symptoms + progress.digestive;

  const saveToDatabase = async (data: Partial<DailyRecord>) => {
    if (!user) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      await trackingService.createTracking(user.id, date, { date, ...data });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleSaveSymptoms = async () => {
    await saveToDatabase({ symptoms: selectedSymptoms });
  };

  const handleSaveSport = async () => {
    await saveToDatabase({
      activity: sportActivities.length > 0 ? {
        type: sportActivities.join(', '),
        duration: Object.values(sportDurations).reduce((a, b) => a + b, 0),
        intensity: 'moderate' as const,
        notes: ''
      } : undefined
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

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const renderProgressBar = () => {
    // Simple progress calculation: completed activities / total activities
    const completedActivities = [
      selectedSymptoms.length > 0, // Symptoms tracked
      mealData.morning && (mealData.morning === 'Fasting' || mealData.morning.trim() !== ''), // Morning meal
      mealData.afternoon && (mealData.afternoon === 'Fasting' || mealData.afternoon.trim() !== ''), // Afternoon meal  
      mealData.evening && (mealData.evening === 'Fasting' || mealData.evening.trim() !== ''), // Evening meal
      sportActivities.length > 0, // Sport activity
    ].filter(Boolean).length;
    
    const totalActivities = 5;
    const simpleProgress = Math.round((completedActivities / totalActivities) * 100);
    
    return (
      <View style={trackingStyles.progressCard}>
        <View style={trackingStyles.progressHeader}>
          <Text style={trackingStyles.progressTitle}>Daily Progress</Text>
          <Text style={trackingStyles.progressPercentage}>{simpleProgress}%</Text>
        </View>
        
        {/* Main Progress Bar */}
        <View style={trackingStyles.progressBarContainer}>
          <View 
            style={[
              trackingStyles.progressBar,
              { width: `${Math.min(simpleProgress, 100)}%` }
            ]}
          />
        </View>

        {/* Simple Activities Checklist */}
        <View style={trackingStyles.progressBreakdown}>
          <Text style={trackingStyles.progressLabel}>Completed: {completedActivities} of {totalActivities} activities</Text>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={trackingStyles.tabsContainer}>
      {[
        { key: 'meals', label: 'Meals' },
        { key: 'sport', label: 'Sport' },
        { key: 'cycle', label: 'Cycle' },
        { key: 'symptoms', label: 'Symptoms' },
        { key: 'sleep', label: 'Sleep' }
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
              onPress={() => setMealSectionIndex(i => Math.min(mealSections.length - 1, i + 1))}
              style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}
            >
              <Text style={trackingStyles.navButtonTextPrimary}>Next</Text>
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
          <Text style={trackingStyles.sportActivityLabel}>Duration (hours):</Text>
          <TextInput
            value={String(sleepData.sleepDuration || '')}
            onChangeText={(text) => {
              const duration = parseFloat(text) || 0;
              setSleepData(prev => ({ ...prev, sleepDuration: duration }));
            }}
            keyboardType="numeric"
            style={trackingStyles.sportActivityInput}
            placeholder="8"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => console.log('Save sleep data')}
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
      {saved && (
        <View style={trackingStyles.successToast}>
          <Text style={trackingStyles.successToastText}>Data saved successfully!</Text>
        </View>
      )}
      
      <ScrollView style={trackingStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={trackingStyles.padding}>
          {/* Header */}
          <View style={trackingStyles.header}>
            <Text style={trackingStyles.headerTitle}>Daily Tracking</Text>
            <Text style={trackingStyles.headerSubtitle}>Track your daily health data</Text>
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Tabs */}
          {renderTabs()}

          {/* Content */}
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 