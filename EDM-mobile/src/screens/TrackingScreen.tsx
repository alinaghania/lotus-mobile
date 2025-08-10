import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useDate } from '../contexts/DateContext';
import { trackingService } from '../services/trackingService';
import { DailyRecord, MealData, TrackingProgress } from '../types/tracking';
import MultiSelect from '../components/MultiSelect';
import { mealOptions, snackOptions, drinkTypes, sportActivities, weekDays } from '../constants/meals';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeMealImage } from '../services/aiService';
import { useTranslation } from 'react-i18next';

import { trackingStyles } from '../styles/trackingStyles';
import { estimateCaloriesForRecord, estimateCaloriesForItems, estimateCaloriesForEntries } from '../services/caloriesService';

// sanitize helper for any token possibly contaminated by code fences or language tags
const sanitizeToken = (token: string): string => {
  return String(token || '')
    .replace(/[\[\]\r\"']/g, '')
    .replace(/`+/g, '')
    .replace(/^json\s*:?/i, '')
    .trim();
};

// Smooth progress animation state advances toward target analysisProgress
function useSmoothedProgress(target: number, isActive: boolean): number {
  const [smooth, setSmooth] = useState(0);
  useEffect(() => {
    if (!isActive) {
      setSmooth(target);
      return;
    }
    let raf: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      setSmooth(prev => {
        if (prev >= target) return prev;
        const delta = Math.max(0.5, (target - prev) * 0.2);
        const next = Math.min(target, prev + delta);
        return next;
      });
    };
    raf = setInterval(tick, 50);
    return () => { if (raf) clearInterval(raf); };
  }, [target, isActive]);
  return smooth;
}

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
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'sleep');
  const [saved, setSaved] = useState(false);
  const { selectedDate, triggerRefresh } = useDate();

  // Vision meal analysis UI state
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [detectedItems, setDetectedItems] = useState<string[]>([]);
  const [analysisImageUri, setAnalysisImageUri] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const smoothProgress = useSmoothedProgress(analysisProgress, analysisModalVisible && analysisProgress < 100);
  const [analysisCountdown, setAnalysisCountdown] = useState<number>(10);

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
      if (wakeTime < bedTime) {
        wakeTime = new Date(`2024-01-02 ${sleepData.wakeTime}`);
      }
      const diffMs = wakeTime.getTime() - bedTime.getTime();
      const duration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
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
        const record = await trackingService.getTrackingByDate(user.id, date);
        if (record) {
          if (record.sleep) {
            setSleepData({
              bedTime: record.sleep.bedTime || '',
              wakeTime: record.sleep.wakeTime || '',
              sleepQuality: record.sleep.sleepQuality || 0,
              sleepDuration: record.sleep.sleepDuration || 0
            });
          } else {
            setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
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
              morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {}
            });
          }

          if (record.symptoms) setSelectedSymptoms(record.symptoms); else setSelectedSymptoms([]);
          if (record.activity) setSelectedSports(record.activity); else setSelectedSports([]);
          if (record.period) setHasPeriod(record.period.active ? 'yes' : 'no'); else setHasPeriod('');
        } else {
          setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
          setMealData({ morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {} });
          setSelectedSymptoms([]);
          setSelectedSports([]);
          setHasPeriod('');
        }
        setMealSectionIndex(0); // reset to first section when date changes

        // Prefill from previous same weekday if toggles are on and fields empty
        const weekday = selectedDate.getDay();
        const all = await trackingService.getTrackingByUser(user.id);
        const sameWeekday = all
          .filter(r => new Date(r.date).getDay() === weekday)
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const last = sameWeekday[0];
        if (last) {
          if (sameSportRoutine && selectedSports.length === 0 && Array.isArray(last.activity) && last.activity.length > 0) {
            setSelectedSports(last.activity);
          }
          if (sameSleepRoutine && !sleepData.bedTime && !sleepData.wakeTime && last.sleep) {
            setSleepData({
              bedTime: last.sleep.bedTime || '',
              wakeTime: last.sleep.wakeTime || '',
              sleepQuality: last.sleep.sleepQuality || 0,
              sleepDuration: last.sleep.sleepDuration || 0,
            });
          }
        }
      } catch {}
    };

    loadSavedData();
  }, [user, selectedDate]);

  // Add focus listener to reload data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!user) return;
      try {
        const date = selectedDate.toISOString().split('T')[0];
        const record = await trackingService.getTrackingByDate(user.id, date);
        if (record) {
          if (record.sleep) {
            setSleepData({
              bedTime: record.sleep.bedTime || '',
              wakeTime: record.sleep.wakeTime || '',
              sleepQuality: record.sleep.sleepQuality || 0,
              sleepDuration: record.sleep.sleepDuration || 0
            });
          } else {
            setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
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
              morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {}
            });
          }

          if (record.symptoms) setSelectedSymptoms(record.symptoms); else setSelectedSymptoms([]);
          if (record.activity) setSelectedSports(record.activity); else setSelectedSports([]);
          if (record.period) setHasPeriod(record.period.active ? 'yes' : 'no'); else setHasPeriod('');
        } else {
          setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
          setMealData({ morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {} });
          setSelectedSymptoms([]);
          setSelectedSports([]);
          setHasPeriod('');
        }
      } catch {}
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
  const [mealQuantities, setMealQuantities] = useState<Record<'morning'|'afternoon'|'evening'|'snack', Record<string, number>>>({ morning: {}, afternoon: {}, evening: {}, snack: {} });
  const [manualCalories, setManualCalories] = useState<string>('');
  const [calCollapsed, setCalCollapsed] = useState<Record<'morning'|'afternoon'|'evening'|'snack', boolean>>({ morning: true, afternoon: true, evening: true, snack: true });
  const [perMealOverrides, setPerMealOverrides] = useState<Partial<Record<'morning'|'afternoon'|'evening'|'snack', number>>>({});
  const [qtyCollapsed, setQtyCollapsed] = useState<Record<'morning'|'afternoon'|'evening'|'snack', boolean>>({ morning: true, afternoon: true, evening: true, snack: true });

  const mealSections = [
    { icon: 'sunny-outline', title: 'Morning', key: 'morning' as const, type: 'meal' as const, required: true },
    { icon: 'partly-sunny-outline', title: 'Afternoon', key: 'afternoon' as const, type: 'meal' as const, required: true },
    { icon: 'moon-outline', title: 'Evening', key: 'evening' as const, type: 'meal' as const, required: true },
    { icon: 'fast-food-outline', title: 'Snacks', key: 'snack' as const, type: 'snack' as const, required: false },
    { icon: 'water-outline', title: 'Drinks', key: 'drinks' as const, type: 'drink' as const, required: false },
  ];

  const computeAutoCalories = (): number => {
    const entries: Array<{ name: string; quantity: number }> = [];
    (['morning','afternoon','evening','snack'] as const).forEach(section => {
      const raw = (mealData[section as keyof MealData] as string) || '';
      if (raw === 'Fasting') return; // fasting => 0 calories for that meal
      raw.split(',').filter(Boolean).forEach(name => {
        const qty = mealQuantities[section][name] ?? 1;
        entries.push({ name, quantity: qty });
      });
    });
    return estimateCaloriesForEntries(entries);
  };

  const computeTotalWithOverrides = (): number => {
    if (Object.keys(perMealOverrides).length === 0) return computeAutoCalories();
    let sum = 0;
    (['morning','afternoon','evening','snack'] as const).forEach(section => {
      if (typeof perMealOverrides[section] === 'number') {
        sum += perMealOverrides[section] as number;
      } else {
        const raw = (mealData[section as keyof MealData] as string) || '';
        if (raw && raw !== 'Fasting') {
          const entries = raw.split(',').filter(Boolean).map(name => ({ name, quantity: mealQuantities[section][name] ?? 1 }));
          sum += estimateCaloriesForEntries(entries);
        }
      }
    });
    return Math.round(sum);
  };

  const computeCurrentSectionCalories = (): number => {
    const section = mealSections[mealSectionIndex];
    if (!(section.type === 'meal' || section.type === 'snack')) return 0;
    const key = section.type === 'snack' ? 'snack' : section.key;
    const raw = (mealData[key as keyof MealData] as string) || '';
    if (raw === 'Fasting') return 0;
    const entries = raw.split(',').filter(Boolean).map(name => ({ name, quantity: mealQuantities[key as 'morning'|'afternoon'|'evening'|'snack'][name] ?? 1 }));
    return estimateCaloriesForEntries(entries);
  };

  // Check if a meal section is completed
  const isMealSectionCompleted = (sectionIndex: number): boolean => {
    const section = mealSections[sectionIndex];
    if (!section.required) return true;
    const value = mealData[section.key as keyof MealData] as string;
    return !!(value && value.trim() !== '');
  };

  // Check if user can proceed to next meal section
  const canProceedToNext = (): boolean => {
    return isMealSectionCompleted(mealSectionIndex);
  };

  // Save to database with proper date and alerts
  const saveToDatabase = async (data: Partial<DailyRecord>) => {
    if (!user) return;

    try {
      const date = selectedDate.toISOString().split('T')[0];
      await trackingService.updateTracking(user.id, date, data);
      Alert.alert('Success', 'Data saved successfully!');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // Inform Home via context refresh, then also reload current record
      triggerRefresh();
    } catch {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const handleSaveSymptoms = async () => {
    await saveToDatabase({ symptoms: selectedSymptoms });
  };

  const handleSaveSport = async () => {
    await saveToDatabase({ activity: selectedSports });
  };

  const handleSaveCycle = async () => {
    await saveToDatabase({
      period: { active: hasPeriod === 'yes', flow: 'medium', pain: 'none', notes: '' }
    });
  };

  const handleSaveMeals = async () => {
    // Validate required main meals
    const missing: string[] = [];
    if (!mealData.morning) missing.push('Morning');
    if (!mealData.afternoon) missing.push('Afternoon');
    if (!mealData.evening) missing.push('Evening');
    if (missing.length > 0) {
      Alert.alert('Missing required meals', `Please fill: ${missing.join(', ')}`);
      // Continue to save partial data
    }

    const date = selectedDate.toISOString().split('T')[0];
    const baseRecord: DailyRecord = {
      date,
      meals: mealData,
      hydration: {
        count: Object.values(mealData.drinkQuantities || {}).reduce((a, b) => a + b, 0),
        types: (mealData.drinkType || '').split(',').filter(Boolean),
        notes: ''
      }
    } as DailyRecord;
    // Respect per-meal overrides; manualCalories (global) removed per user request
    const totalCalories = (() => {
      const auto = computeAutoCalories();
      const sumOverrides = Object.values(perMealOverrides).reduce((a, b) => a + (b || 0), 0);
      // If any override set, recompute by combining overridden sections + auto for others
      if (Object.keys(perMealOverrides).length === 0) return auto;
      let sum = 0;
      (['morning','afternoon','evening','snack'] as const).forEach(section => {
        if (typeof perMealOverrides[section] === 'number') {
          sum += perMealOverrides[section] as number;
        } else {
          const raw = (mealData[section as keyof MealData] as string) || '';
          if (raw && raw !== 'Fasting') {
            const entries = raw.split(',').filter(Boolean).map(name => ({ name, quantity: mealQuantities[section][name] ?? 1 }));
            sum += estimateCaloriesForEntries(entries);
          }
        }
      });
      return Math.round(sum);
    })();
    await saveToDatabase({
      meals: mealData,
      hydration: baseRecord.hydration,
      nutrition: { totalCalories, perMealOverrides }
    });
  };

  // Vision meal analysis integration
  const requestMediaPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const startMealAnalysis = async () => {
    const ok = await requestMediaPermissions();
    if (!ok) {
      Alert.alert('Permission required', 'Media library permission is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (result.canceled) return;

    setAnalysisImageUri(result.assets[0].uri);
    setDetectedItems([]);
    setAnalysisProgress(10);
    setAnalysisCountdown(10);
    setAnalysisError(null);
    setAnalysisModalVisible(true);

    try {
      // smooth progressive animation: tick up while waiting
      const smoothTimer = setInterval(() => setAnalysisProgress(p => (p < 80 ? p + 2 : p)), 120);
      const countdownTimer = setInterval(() => setAnalysisCountdown(c => Math.max(0, c - 1)), 1000);

      const prediction = await analyzeMealImage(result.assets[0].uri);
      setAnalysisProgress(90);
      setDetectedItems(prediction.items);
      setAnalysisProgress(100);
      clearInterval(smoothTimer);
      clearInterval(countdownTimer);
    } catch (e: any) {
      setAnalysisError(e?.message || 'Unable to analyze the image');
      setAnalysisProgress(0);
    }
  };

  const applyDetectedItemsToCurrentSection = () => {
    const section = mealSections[mealSectionIndex];
    if (section.type !== 'meal' && section.type !== 'snack') {
      setAnalysisModalVisible(false);
      return;
    }
    const key = section.type === 'snack' ? 'snack' : section.key;
    const existing = (mealData[key as keyof MealData] as string) || '';
    const existingClean = existing
      .split(',')
      .map((s) => sanitizeToken(s))
      .filter(Boolean);
    const merged = Array.from(new Set([...existingClean, ...detectedItems.map(sanitizeToken)]));
    setMealData(prev => ({ ...prev, [key]: merged.join(',') }));
    // default quantity 1 for new items
    setMealQuantities(prev => {
      const updated = { ...prev } as any;
      updated[key] = { ...(prev as any)[key] };
      merged.forEach((name) => { if (!(updated[key][name] >= 0)) updated[key][name] = 1; });
      return updated;
    });
    setAnalysisModalVisible(false);
  };

  const renderProgressBar = () => {
    const mealsFilled = Boolean(mealData.morning && mealData.afternoon && mealData.evening);
    const tabProgress = {
      sleep: (sleepData.bedTime || sleepData.wakeTime) ? 20 : 0,
      meals: mealsFilled ? 20 : 0,
      sport: selectedSports.length > 0 ? 20 : 0,
      cycle: (hasPeriod === 'yes' || hasPeriod === 'no' || hasPeriod === 'none') ? 20 : 0,
      symptoms: selectedSymptoms.length > 0 ? 20 : 0,
    };

    const totalProgress = Object.values(tabProgress).reduce((sum, val) => sum + val, 0);
    const completedTabs = Object.values(tabProgress).filter(val => val > 0).length;

    return (
      <>
        <View style={trackingStyles.dateDisplay}>
          <Text style={trackingStyles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View style={trackingStyles.progressCard}>
          <View style={trackingStyles.progressHeader}>
            <Text style={trackingStyles.progressTitle}>Daily Progress</Text>
            <Text style={trackingStyles.progressPercentage}>{totalProgress}%</Text>
          </View>
          {totalProgress < 100 && (
            <>
              <View style={trackingStyles.progressBarContainer}>
                <View style={[trackingStyles.progressBar, { width: `${Math.min(totalProgress, 100)}%` }]} />
              </View>
              <View style={trackingStyles.progressBreakdown}>
                <Text style={trackingStyles.progressLabel}>Completed: {completedTabs} of 5 activities</Text>
              </View>
            </>
          )}
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
          style={[trackingStyles.tab, activeTab === tab.key && trackingStyles.activeTab]}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              trackingStyles.tabText,
              { maxWidth: '90%' },
              activeTab === tab.key ? trackingStyles.activeTabText : trackingStyles.inactiveTabText
            ]}
          >
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
      <Text style={trackingStyles.contentSubtitle}>Select any symptoms you're experiencing today</Text>
      <MultiSelect
        label="Symptoms"
        options={SYMPTOMS}
        value={selectedSymptoms}
        onChange={setSelectedSymptoms}
        allowOther
        category="symptoms"
      />
      <TouchableOpacity onPress={handleSaveSymptoms} style={trackingStyles.saveButton}>
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

        {/* Photo analysis trigger for meal/snack sections */}
        {(currentSection.type === 'meal' || currentSection.type === 'snack') && (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TouchableOpacity
              disabled={(mealData[currentSection.key as keyof MealData] as string) === 'Fasting'}
              onPress={async () => {
                const ok = await requestMediaPermissions();
                if (!ok) {
                  Alert.alert('Permission required', 'Media library permission is needed.');
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
                if (result.canceled) return;
                setAnalysisImageUri(result.assets[0].uri);
                setDetectedItems([]);
                setAnalysisProgress(10);
                setAnalysisCountdown(10);
                setAnalysisError(null);
                setAnalysisModalVisible(true);
                try {
                  const smoothTimer = setInterval(() => setAnalysisProgress(p => (p < 80 ? p + 2 : p)), 120);
                  const countdownTimer = setInterval(() => setAnalysisCountdown(c => Math.max(0, c - 1)), 1000);
                  const prediction = await analyzeMealImage(result.assets[0].uri);
                  setAnalysisProgress(90);
                  setDetectedItems(prediction.items);
                  setAnalysisProgress(100);
                  clearInterval(smoothTimer);
                  clearInterval(countdownTimer);
                } catch (e: any) {
                  setAnalysisError(e?.message || 'Unable to analyze the image');
                  setAnalysisProgress(0);
                }
              }}
              style={[trackingStyles.cameraButton, (mealData[currentSection.key as keyof MealData] as string) === 'Fasting' && { opacity: 0.5 }]}
            >
              <Ionicons name="camera" size={18} color="#374151" />
              <Text style={trackingStyles.cameraButtonText}>{t('takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={(mealData[currentSection.key as keyof MealData] as string) === 'Fasting'}
              onPress={startMealAnalysis}
              style={[trackingStyles.cameraButton, (mealData[currentSection.key as keyof MealData] as string) === 'Fasting' && { opacity: 0.5 }]}
            >
              <Ionicons name="image" size={18} color="#374151" />
              <Text style={trackingStyles.cameraButtonText}>{t('chooseFromLibrary')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentSection.type === 'meal' && (() => {
          const mealVal = mealData[currentSection.key as keyof MealData] as string;
          const isFasting = mealVal === 'Fasting';
          const items = (mealVal || '').split(',').map(sanitizeToken).filter(Boolean);
          return (
            <>
              <View style={trackingStyles.fastingContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (isFasting) {
                      setMealData(prev => ({ ...prev, [currentSection.key]: '' }));
                    } else {
                      setMealData(prev => ({ ...prev, [currentSection.key]: 'Fasting' }));
                      setMealQuantities(prev => ({ ...prev, [currentSection.key]: {} }));
                    }
                  }}
                  style={[trackingStyles.fastingButton, isFasting ? trackingStyles.fastingButtonSelected : trackingStyles.fastingButtonUnselected]}
                >
                  <View style={[trackingStyles.fastingCheckbox, isFasting ? trackingStyles.fastingCheckboxSelected : trackingStyles.fastingCheckboxUnselected]}>
                    {isFasting && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={isFasting ? trackingStyles.fastingTextSelected : trackingStyles.fastingTextUnselected}>Fasting</Text>
                </TouchableOpacity>
              </View>

              {!isFasting && (
                <>
                  <MultiSelect
                    key={`${currentSection.key}-${isFasting}`}
                    label={currentSection.title}
                    options={currentSection.key === 'morning' ? mealOptions.breakfast : currentSection.key === 'afternoon' ? mealOptions.lunch : mealOptions.dinner}
                    value={items}
                    onChange={(vals) => {
                      const filtered = vals.filter((v) => v !== 'Fasting').map(sanitizeToken).filter(Boolean);
                      const unique = Array.from(new Set(filtered));
                      setMealData(prev => ({ ...prev, [currentSection.key]: unique.join(',') }));
                      setMealQuantities(prev => {
                        const copy = { ...prev } as any;
                        const q = { ...(prev as any)[currentSection.key] };
                        unique.forEach((n) => { if (!(q[n] >= 0)) q[n] = 1; });
                        Object.keys(q).forEach(k => { if (!unique.includes(k)) delete (q as any)[k]; });
                        copy[currentSection.key] = q;
                        return copy;
                      });
                    }}
                    allowOther
                    disabled={false}
                  />

                  {items.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <TouchableOpacity onPress={() => setQtyCollapsed(prev => ({ ...prev, [currentSection.key]: !prev[currentSection.key] }))} style={[trackingStyles.cameraButton, { backgroundColor: '#eef2ff' }]}>
                        <Ionicons name={qtyCollapsed[currentSection.key] ? 'chevron-down' : 'chevron-up'} size={18} color="#374151" />
                        <Text style={trackingStyles.cameraButtonText}>Adjust quantities</Text>
                      </TouchableOpacity>
                      {!qtyCollapsed[currentSection.key] && (
                        <View style={{ marginTop: 8 }}>
                          {items.map((item) => (
                            <View key={item} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                              <Text style={{ width: 120, color: '#374151' }}>{item}</Text>
                              <TextInput
                                value={String(mealQuantities[currentSection.key][item] ?? 1)}
                                onChangeText={(t) => {
                                  const qty = Math.max(0, parseFloat(t) || 0);
                                  setMealQuantities(prev => ({ ...prev, [currentSection.key]: { ...prev[currentSection.key], [item]: qty } }));
                                }}
                                keyboardType="numeric"
                                style={[trackingStyles.drinkQuantityInput, { flex: 0, width: 80 }]}
                                placeholder="Qty"
                              />
                              <Text style={{ marginLeft: 8, color: '#6b7280' }}>serving(s)</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </>
          );
        })()}

        {currentSection.type === 'snack' && (
          <>
            <MultiSelect
              label="snack"
              options={snackOptions}
              value={(mealData.snack || '').split(',').map(sanitizeToken).filter(Boolean)}
              onChange={(vals) => {
                const unique = Array.from(new Set(vals.map(sanitizeToken).filter(Boolean)));
                setMealData(prev => ({ ...prev, snack: unique.join(',') }));
                setMealQuantities(prev => {
                  const copy = { ...prev } as any;
                  const q = { ...(prev as any)[currentSection.key] };
                  unique.forEach((n) => { if (!(q[n] >= 0)) q[n] = 1; });
                  Object.keys(q).forEach(k => { if (!unique.includes(k)) delete (q as any)[k]; });
                  copy[currentSection.key] = q;
                  return copy;
                });
              }}
              allowOther
            />
            {(mealData.snack || '').split(',').map(sanitizeToken).filter(Boolean).length > 0 && (
              <View style={{ marginTop: 8 }}>
                <TouchableOpacity onPress={() => setQtyCollapsed(prev => ({ ...prev, snack: !prev.snack }))} style={[trackingStyles.cameraButton, { backgroundColor: '#eef2ff' }]}>                
                  <Ionicons name={qtyCollapsed.snack ? 'chevron-down' : 'chevron-up'} size={18} color="#374151" />
                  <Text style={trackingStyles.cameraButtonText}>Adjust quantities</Text>
                </TouchableOpacity>
                {!qtyCollapsed.snack && (
                  <View style={{ marginTop: 8 }}>
                    {(mealData.snack || '').split(',').map(sanitizeToken).filter(Boolean).map((item) => (
                      <View key={item} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ width: 120, color: '#374151' }}>{item}</Text>
                        <TextInput
                          value={String(mealQuantities.snack[item] ?? 1)}
                          onChangeText={(t) => {
                            const qty = Math.max(0, parseFloat(t) || 0);
                            setMealQuantities(prev => ({ ...prev, snack: { ...prev.snack, [item]: qty } }));
                          }}
                          keyboardType="numeric"
                          style={[trackingStyles.drinkQuantityInput, { flex: 0, width: 80 }]}
                          placeholder="Qty"
                        />
                        <Text style={{ marginLeft: 8, color: '#6b7280' }}>serving(s)</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        )}

        {currentSection.type === 'drink' && (
          <>
            <MultiSelect
              label="drink type"
              options={drinkTypes}
              value={(mealData.drinkType || '').split(',').map(sanitizeToken).filter(Boolean)}
              onChange={(vals) => {
                const unique = Array.from(new Set(vals.map(sanitizeToken).filter(Boolean)));
                setMealData(prev => {
                  const newQ = { ...prev.drinkQuantities } as Record<string, number>;
                  Object.keys(newQ).forEach((k) => { if (!unique.includes(k)) delete newQ[k]; });
                  unique.forEach((d) => { if (!(d in newQ)) newQ[d] = 0; });
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
                      setMealData(prev => ({ ...prev, drinkQuantities: { ...prev.drinkQuantities, [item]: qty } }));
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

        {/* Adjust calories (per-meal override) */}
        {(['meal','snack'].includes(currentSection.type)) && (() => {
          const key = currentSection.type === 'snack' ? 'snack' : currentSection.key;
          const raw = (mealData[key as keyof MealData] as string) || '';
          if (!raw || raw === 'Fasting') return null;
          return (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity onPress={() => setCalCollapsed(prev => ({ ...prev, [key]: !prev[key as 'morning'|'afternoon'|'evening'|'snack'] }))} style={[trackingStyles.cameraButton, { backgroundColor: '#fff7ed' }]}> 
                <Ionicons name={calCollapsed[key as 'morning'|'afternoon'|'evening'|'snack'] ? 'chevron-down' : 'chevron-up'} size={18} color="#f59e0b" />
                <Text style={[trackingStyles.cameraButtonText, { color: '#b45309' }]}>Adjust calories</Text>
              </TouchableOpacity>
              {!calCollapsed[key as 'morning'|'afternoon'|'evening'|'snack'] && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                  <TextInput
                    value={String(perMealOverrides[key as 'morning'|'afternoon'|'evening'|'snack'] ?? '')}
                    onChangeText={(text) => {
                      const v = text.trim() === '' ? undefined : (parseInt(text) || 0);
                      setPerMealOverrides(prev => ({ ...prev, [key]: v as any }));
                    }}
                    keyboardType="numeric"
                    style={[trackingStyles.drinkQuantityInput, { flex: 0, width: 160 }]}
                    placeholder="Override kcal for this meal"
                  />
                  <Text style={{ marginLeft: 8, color: '#6b7280' }}>Leave empty to use estimate</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Selected items display */}
        <View style={trackingStyles.selectedItemsContainer}>
          {(currentSection.type === 'snack' || currentSection.type === 'meal') && (() => {
            const raw = mealData[(currentSection.type === 'snack' ? 'snack' : currentSection.key) as keyof MealData] as string;
            if (raw === 'Fasting') {
              return [
                <View key="fast" style={trackingStyles.selectedItemFasting}>
                  <Text style={trackingStyles.selectedItemTextFasting}>Fasting</Text>
                  <TouchableOpacity onPress={() => setMealData(prev => ({ ...prev, [currentSection.key]: '' }))}>
                    <Ionicons name="close" size={16} color="#c2410c" />
                  </TouchableOpacity>
                </View>
              ];
            }
            return Array.from(new Set((raw || '').split(',').map(sanitizeToken).filter(Boolean))).map((item) => (
              <View key={item} style={trackingStyles.selectedItem}>
                <Text style={trackingStyles.selectedItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const prop = currentSection.type === 'snack' ? 'snack' : currentSection.key;
                    const items = ((mealData[prop as keyof MealData] as string) || '')
                      .split(',')
                      .map(sanitizeToken)
                      .filter((m) => m !== item);
                    setMealData(prev => ({ ...prev, [prop]: items.join(',') }));
                    setMealQuantities(prev => ({ ...prev, [prop]: Object.fromEntries(Object.entries(prev[prop]).filter(([k]) => k !== item)) } as any));
                  }}
                >
                  <Ionicons name="close" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ));
          })()}
        </View>

        {/* Inline dynamic calories just before navigation */}
        {(() => {
          const section = mealSections[mealSectionIndex];
          if (!(section.type === 'meal' || section.type === 'snack')) return null;
          const key = section.type === 'snack' ? 'snack' : section.key;
          const raw = (mealData[key as keyof MealData] as string) || '';
          if (!raw || raw === 'Fasting') return null;
          return (
            <View style={[trackingStyles.caloriesRow, { marginBottom: 8 }]}>
              <Text style={trackingStyles.caloriesText}>
                Your meal: <Text style={trackingStyles.caloriesHighlight}>{computeCurrentSectionCalories()} kcal</Text>
              </Text>
              <Text style={[trackingStyles.caloriesText, { marginTop: 2 }]}>
                Calories today: <Text style={trackingStyles.caloriesHighlight}>{computeTotalWithOverrides()} kcal</Text>
              </Text>
            </View>
          );
        })()}

        {/* Navigation */}
        <View style={trackingStyles.navigationContainer}>
          <TouchableOpacity
            disabled={mealSectionIndex === 0}
            onPress={() => setMealSectionIndex(i => Math.max(0, i - 1))}
            style={[trackingStyles.navButton, mealSectionIndex === 0 ? trackingStyles.navButtonDisabled : trackingStyles.navButtonEnabled]}
          >
            <Text style={mealSectionIndex === 0 ? trackingStyles.navButtonTextDisabled : trackingStyles.navButtonTextEnabled}>Previous</Text>
          </TouchableOpacity>

          {isLastSection ? (
            <TouchableOpacity onPress={handleSaveMeals} style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}>
              <Text style={trackingStyles.navButtonTextPrimary}>Save Meals</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={!canProceedToNext()}
              onPress={() => setMealSectionIndex(i => Math.min(mealSections.length - 1, i + 1))}
              style={[trackingStyles.navButton, canProceedToNext() ? trackingStyles.navButtonPrimary : trackingStyles.navButtonDisabled]}
            >
              <Text style={canProceedToNext() ? trackingStyles.navButtonTextPrimary : trackingStyles.navButtonTextDisabled}>Next</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Analysis modal simplified */}
        <Modal visible={analysisModalVisible} transparent onRequestClose={() => setAnalysisModalVisible(false)}>
          <View style={trackingStyles.modalOverlay}>
            <View style={trackingStyles.modalCard}>
              <Text style={trackingStyles.modalTitle}>Analyzing meal...</Text>
              {analysisImageUri && (
                <View style={trackingStyles.modalImageContainer}>
                  <Image source={{ uri: analysisImageUri }} style={trackingStyles.modalImage} resizeMode="cover" />
                  {analysisProgress < 100 && (
                    <View style={trackingStyles.imageProgressOverlay}>
                      <View style={[trackingStyles.imageProgressTrack, { backgroundColor: 'rgba(236,72,153,0.25)' }]}>
                        <View style={[trackingStyles.imageProgressFill, { backgroundColor: '#ec4899', width: `${smoothProgress}%` }]} />
                      </View>
                      <Text style={{ color: 'white', marginTop: 6, fontWeight: '600' }}>
                        ≈ {analysisCountdown}s remaining
                      </Text>
                    </View>
                  )}
                </View>
              )}
              {analysisError ? (
                <Text style={{ color: '#dc2626', marginTop: 8 }}>{analysisError}</Text>
              ) : null}
              {detectedItems.length > 0 && (
                <View style={trackingStyles.caloriesRow}>
                  <Text style={trackingStyles.caloriesText}>
                    Your meal: <Text style={trackingStyles.caloriesHighlight}>{estimateCaloriesForEntries(detectedItems.map(n => ({ name: n, quantity: 1 }))) } kcal</Text>
                  </Text>
                </View>
              )}
              {detectedItems.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <View style={trackingStyles.selectedItemsContainer}>
                    {detectedItems.map((item) => (
                      <View key={item} style={trackingStyles.selectedItem}>
                        <Text style={trackingStyles.selectedItemText}>{item}</Text>
                        <TouchableOpacity onPress={() => setDetectedItems(prev => prev.filter(i => i !== item))}>
                          <Ionicons name="close" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <View style={trackingStyles.navigationContainer}>
                <TouchableOpacity onPress={() => setAnalysisModalVisible(false)} style={[trackingStyles.navButton, trackingStyles.navButtonDisabled]}>
                  <Text style={trackingStyles.navButtonTextDisabled}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={detectedItems.length === 0} onPress={applyDetectedItemsToCurrentSection} style={[trackingStyles.navButton, detectedItems.length === 0 ? trackingStyles.navButtonDisabled : trackingStyles.navButtonPrimary]}>
                  <Text style={detectedItems.length === 0 ? trackingStyles.navButtonTextDisabled : trackingStyles.navButtonTextPrimary}>{t('confirm')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
      <View style={trackingStyles.routineToggleContainer}>
        <TouchableOpacity onPress={() => setSameSportRoutine(!sameSportRoutine)} style={trackingStyles.routineToggle}>
          <View style={[trackingStyles.routineCheckbox, sameSportRoutine ? trackingStyles.routineCheckboxSelected : trackingStyles.routineCheckboxUnselected]}>
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
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity onPress={handleSaveSport} style={trackingStyles.saveButton}>
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
            style={[trackingStyles.cycleOption, hasPeriod === option.key ? trackingStyles.cycleOptionSelected : trackingStyles.cycleOptionUnselected]}
          >
            <View style={[trackingStyles.cycleOptionRadio, hasPeriod === option.key ? trackingStyles.cycleOptionRadioSelected : trackingStyles.cycleOptionRadioUnselected]}>
              {hasPeriod === option.key && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text style={hasPeriod === option.key ? trackingStyles.cycleOptionTextSelected : trackingStyles.cycleOptionTextUnselected}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={handleSaveCycle} style={trackingStyles.saveButton}>
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
      <View style={trackingStyles.routineToggleContainer}>
        <TouchableOpacity onPress={() => setSameSleepRoutine(!sameSleepRoutine)} style={trackingStyles.routineToggle}>
          <View style={[trackingStyles.routineCheckbox, sameSleepRoutine ? trackingStyles.routineCheckboxSelected : trackingStyles.routineCheckboxUnselected]}>
            {sameSleepRoutine && <Ionicons name="checkmark" size={12} color="white" />}
          </View>
          <Text style={trackingStyles.routineToggleText}>Same routine</Text>
        </TouchableOpacity>
        {sameSleepRoutine && (
          <Text style={trackingStyles.routineHint}>Pre-filled from your saved routine</Text>
        )}
      </View>
      <View style={trackingStyles.sportActivityCard}>
        <Text style={trackingStyles.sportActivityTitle}>Sleep Schedule</Text>
        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Bedtime:</Text>
          <TextInput value={sleepData.bedTime} onChangeText={(text) => setSleepData(prev => ({ ...prev, bedTime: text }))} style={trackingStyles.sportActivityInput} placeholder="e.g., 23:00" />
        </View>
        <View style={trackingStyles.sportActivityRow}>
          <Text style={trackingStyles.sportActivityLabel}>Wake time:</Text>
          <TextInput value={sleepData.wakeTime} onChangeText={(text) => setSleepData(prev => ({ ...prev, wakeTime: text }))} style={trackingStyles.sportActivityInput} placeholder="e.g., 07:00" />
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
      <TouchableOpacity onPress={async () => {
        let calculatedDuration = sleepData.sleepDuration;
        if (sleepData.bedTime && sleepData.wakeTime) {
          const bedTime = new Date(`2024-01-01 ${sleepData.bedTime}`);
          let wakeTime = new Date(`2024-01-01 ${sleepData.wakeTime}`);
          if (wakeTime < bedTime) wakeTime = new Date(`2024-01-02 ${sleepData.wakeTime}`);
          const diffMs = wakeTime.getTime() - bedTime.getTime();
          calculatedDuration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
        }
        await saveToDatabase({ sleep: { ...sleepData, sleepDuration: calculatedDuration } });
      }} style={trackingStyles.saveButton}>
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
          <View style={trackingStyles.header}>
            <Text style={trackingStyles.welcomeText}>Track Your Health</Text>
          </View>
          {renderProgressBar()}
          {renderTabs()}
          <View style={trackingStyles.content}>
            {renderContent()}
          </View>
        </ScrollView>
        {saved && (
          <View style={trackingStyles.successToast}>
            <Text style={trackingStyles.successToastText}>Saved</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
} 