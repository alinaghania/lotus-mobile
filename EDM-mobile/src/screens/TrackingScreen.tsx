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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as const;
type SleepRoutine = { bedTime: string; wakeTime: string; sleepQuality: number; sleepDuration: number };
type SportRoutine = { activities: string[]; durations: Record<string, number> };
// New: named routine definitions for modal managers
type SleepRoutineDef = { id: string; name: string; bedTime: string; wakeTime: string };
type SportRoutineDef = { id: string; name: string; activities: string[]; durations: Record<string, number> };

type CopyPreset = 'this' | 'weekdays' | 'all' | 'custom';
type SleepHabits = { bed: Array<[string, number]>; wake: Array<[string, number]>; avgDur: number } | null;
type SportHabit = { name: string; count: number; avgMin: number };

export default function TrackingScreen({ route }: { route?: { params?: { initialTab?: TabType; openSleepRoutineManager?: boolean } } }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>(route?.params?.initialTab || 'sleep');
  const [saved, setSaved] = useState(false);
  const { selectedDate, triggerRefresh } = useDate();
  // Per-tab saved/edit state
  const [hasSleepSaved, setHasSleepSaved] = useState(false);
  const [hasSportSaved, setHasSportSaved] = useState(false);
  const [hasMealsSaved, setHasMealsSaved] = useState(false);
  const [hasCycleSaved, setHasCycleSaved] = useState(false);
  const [hasSymptomsSaved, setHasSymptomsSaved] = useState(false);
  const [isSleepEditing, setIsSleepEditing] = useState(true);
  const [isSportEditing, setIsSportEditing] = useState(true);
  const [isMealsEditing, setIsMealsEditing] = useState(true);
  const [isCycleEditing, setIsCycleEditing] = useState(true);
  const [isSymptomsEditing, setIsSymptomsEditing] = useState(true);

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

  // Sleep state
  const [sleepData, setSleepData] = useState({
    bedTime: '',
    wakeTime: '',
    sleepQuality: 0,
    sleepDuration: 0
  });
  const [sleepQualityPickerOpen, setSleepQualityPickerOpen] = useState(false);

  // Weekly routine templates per weekday (0=Sun..6=Sat)
  const [sportRoutineByWeekday, setSportRoutineByWeekday] = useState<Record<number, { activities: string[]; durations: Record<string, number> }>>({});
  const [sleepRoutineByWeekday, setSleepRoutineByWeekday] = useState<Record<number, { bedTime: string; wakeTime: string; sleepQuality: number; sleepDuration: number }>>({});
  const [sleepRoutineNameByWeekday, setSleepRoutineNameByWeekday] = useState<Record<number, string>>({});
  const [sportRoutineNameByWeekday, setSportRoutineNameByWeekday] = useState<Record<number, string>>({});

  // New: routine managers (collections)
  const [sleepRoutines, setSleepRoutines] = useState<SleepRoutineDef[]>([]);
  const [sportRoutines, setSportRoutines] = useState<SportRoutineDef[]>([]);
  const [sleepRoutineModalOpen, setSleepRoutineModalOpen] = useState(false);
  const [sportRoutineModalOpen, setSportRoutineModalOpen] = useState(false);
  const [sleepDaysSelected, setSleepDaysSelected] = useState<number[]>([]);
  const [sportDaysSelected, setSportDaysSelected] = useState<number[]>([]);
  // Create routine states
  const [creatingSleep, setCreatingSleep] = useState(false);
  const [showSleepDaysStep, setShowSleepDaysStep] = useState(false); // Show days selection after routine config
 
  const [newSleepName, setNewSleepName] = useState('');
  const [newSleepBed, setNewSleepBed] = useState('23:00');
  const [newSleepWake, setNewSleepWake] = useState('07:00');

  const [creatingSport, setCreatingSport] = useState(false);
  const [showSportDaysStep, setShowSportDaysStep] = useState(false); // Show days selection for sport routines
  const [showSportActivitiesStep, setShowSportActivitiesStep] = useState(false); // Show activities selection
  const [showSportDurationsStep, setShowSportDurationsStep] = useState(false); // Show durations selection

  const [newSportActivities, setNewSportActivities] = useState<string[]>([]);
  const [newSportDurations, setNewSportDurations] = useState<Record<string, number>>({});

  const ROUTINE_NAME_PRESETS = ['Routine 1','Routine 2','Routine 3','Routine 4'];
  // Generate full 24-hour options at 15-minute steps
  const generateTimeOptions = (stepMin: number = 15): string[] => {
    const options: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += stepMin) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        options.push(`${hh}:${mm}`);
      }
    }
    return options;
  };
  const TIME_OPTIONS = generateTimeOptions(15);
  const DURATION_PRESETS = [15, 30, 45, 60];

  // New: time picker lists for "select" UX
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // New: intelligent routine name generator (Routine 1, Routine 2, ...)
  function generateNextRoutineName(existing: string[]): string {
    const pattern = /^Routine\s+(\d{1,3})$/i;
    const nums = existing
      .map(n => {
        const m = n.match(pattern);
        return m ? parseInt(m[1]) : 0;
      })
      .filter(n => n > 0);
    const next = (nums.length > 0 ? Math.max(...nums) + 1 : 1);
    return `Routine ${next}`;
  }

  // Custom time picker for sleep presets
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'bed' | 'wake'>('bed');
  const [tempHour, setTempHour] = useState<number>(23);
  const [tempMinute, setTempMinute] = useState<number>(0);
  const [timePickerForNewRoutine, setTimePickerForNewRoutine] = useState<boolean>(false);
  const pad2 = (n: number) => String(n).padStart(2, '0');

  // Helpers to simplify weekly routine behavior
  const loadWeeklyTemplates = async (uid: string) => {
    try {
      const [sleepTplRaw, sportTplRaw, sleepNamesRaw, sportNamesRaw] = await Promise.all([
        AsyncStorage.getItem(`sleepRoutineByWeekday:${uid}`),
        AsyncStorage.getItem(`sportRoutineByWeekday:${uid}`),
        AsyncStorage.getItem(`sleepRoutineNames:${uid}`),
        AsyncStorage.getItem(`sportRoutineNames:${uid}`),
      ]);
      if (sleepTplRaw) setSleepRoutineByWeekday(JSON.parse(sleepTplRaw));
      if (sportTplRaw) setSportRoutineByWeekday(JSON.parse(sportTplRaw));
      if (sleepNamesRaw) setSleepRoutineNameByWeekday(JSON.parse(sleepNamesRaw));
      if (sportNamesRaw) setSportRoutineNameByWeekday(JSON.parse(sportNamesRaw));
    } catch {}
  };

  const loadSavedRoutines = async (uid: string) => {
    try {
      const [sleepRaw, sportRaw] = await Promise.all([
        AsyncStorage.getItem(`sleepRoutines:${uid}`),
        AsyncStorage.getItem(`sportRoutines:${uid}`),
      ]);
      if (sleepRaw) setSleepRoutines(JSON.parse(sleepRaw));
      if (sportRaw) setSportRoutines(JSON.parse(sportRaw));
    } catch {}
  };

  // Intelligent detection helpers (declare early so they are available everywhere)
  const getSavedDays = (kind: 'sleep' | 'sport'): number[] => {
    const map = kind === 'sleep' ? sleepRoutineByWeekday : sportRoutineByWeekday;
    return Object.keys(map).map((n) => Number(n)).filter((n) => !Number.isNaN(n));
  };
  const getEmptyDays = (kind: 'sleep' | 'sport'): number[] => {
    const saved = new Set(getSavedDays(kind));
    const all = [0,1,2,3,4,5,6];
    return all.filter((d) => !saved.has(d));
  };
  const formatDaysList = (days: number[]) => days.sort((a,b)=>a-b).map(d => WEEKDAYS[d]).join(', ');

  // Prefill from templates automatically when editing and no data present
  const prefillFromTemplate = (kind: 'sleep' | 'sport', force: boolean = false) => {
    if (!user) return;
    const day = selectedDate.getDay();
    if (kind === 'sleep' && isSleepEditing) {
      const tpl = sleepRoutineByWeekday[day];
      if (tpl && (force || (!sleepData.bedTime && !sleepData.wakeTime))) {
        setSleepData({ ...tpl });
      }
    }
    if (kind === 'sport' && isSportEditing) {
      const tpl = sportRoutineByWeekday[day];
      if (tpl && (force || selectedSports.length === 0)) {
        setSelectedSports(tpl.activities);
        setSportDurations(tpl.durations || {});
      }
    }
  };

  const getPresetDays = (preset: CopyPreset, baseWeekday: number, custom: number[]): number[] => {
    switch (preset) {
      case 'weekdays':
        return [1,2,3,4,5];
      case 'all':
        return [0,1,2,3,4,5,6];
      case 'custom':
        return Array.from(new Set(custom)).sort((a,b)=>a-b);
      case 'this':
      default:
        return [baseWeekday];
    }
  };

  const applyRoutineToDays = async (
    kind: 'sleep' | 'sport',
    payload: SleepRoutine | SportRoutine,
    days: number[],
    routineName?: string
  ) => {
    if (!user) return;
    try {
      if (kind === 'sleep') {
        const updated = { ...sleepRoutineByWeekday } as Record<number, SleepRoutine>;
        const nameMap = { ...sleepRoutineNameByWeekday } as Record<number, string>;
        days.forEach((d) => {
          updated[d] = payload as SleepRoutine;
          if (routineName) nameMap[d] = routineName;
        });
        setSleepRoutineByWeekday(updated);
        setSleepRoutineNameByWeekday(nameMap);
        await Promise.all([
          AsyncStorage.setItem(`sleepRoutineByWeekday:${user.id}`, JSON.stringify(updated)),
          AsyncStorage.setItem(`sleepRoutineNames:${user.id}`, JSON.stringify(nameMap)),
        ]);
      } else {
        const updated = { ...sportRoutineByWeekday } as Record<number, SportRoutine>;
        const nameMap = { ...sportRoutineNameByWeekday } as Record<number, string>;
        days.forEach((d) => {
          updated[d] = payload as SportRoutine;
          if (routineName) nameMap[d] = routineName;
        });
        setSportRoutineByWeekday(updated);
        setSportRoutineNameByWeekday(nameMap);
        await Promise.all([
          AsyncStorage.setItem(`sportRoutineByWeekday:${user.id}`, JSON.stringify(updated)),
          AsyncStorage.setItem(`sportRoutineNames:${user.id}`, JSON.stringify(nameMap)),
        ]);
      }
    } catch {}
  };

  // Grouping helpers and clearing
  type SleepGroup = { name: string; bedTime: string; wakeTime: string; days: number[] };
  const groupSleepAssignments = (): SleepGroup[] => {
    const map = new Map<string, SleepGroup>();
    Object.entries(sleepRoutineByWeekday || {}).forEach(([k, v]) => {
      const d = Number(k);
      const name = sleepRoutineNameByWeekday[d] || 'Routine';
      const key = `${name}|${v.bedTime}|${v.wakeTime}`;
      const grp = map.get(key) || { name, bedTime: v.bedTime, wakeTime: v.wakeTime, days: [] };
      grp.days.push(d);
      map.set(key, grp);
    });
    return Array.from(map.values()).sort((a,b)=>a.days[0]-b.days[0]);
  };

  type SportGroup = { name: string; activities: string[]; days: number[] };
  const groupSportAssignments = (): SportGroup[] => {
    const map = new Map<string, SportGroup>();
    Object.entries(sportRoutineByWeekday || {}).forEach(([k, v]) => {
      const d = Number(k);
      const name = sportRoutineNameByWeekday[d] || 'Routine';
      const key = `${name}`;
      const grp = map.get(key) || { name, activities: v.activities || [], days: [] };
      grp.days.push(d);
      map.set(key, grp);
    });
    return Array.from(map.values()).sort((a,b)=>a.days[0]-b.days[0]);
  };

  const clearRoutineFromDays = async (kind: 'sleep' | 'sport', days: number[], routineName?: string) => {
    if (!user) return;
    try {
      if (kind === 'sleep') {
        const upd = { ...sleepRoutineByWeekday } as Record<number, SleepRoutine>;
        const nameMap = { ...sleepRoutineNameByWeekday } as Record<number, string>;
        days.forEach(d => {
          if (!routineName || nameMap[d] === routineName) {
            delete upd[d];
            delete nameMap[d];
          }
        });
        setSleepRoutineByWeekday(upd);
        setSleepRoutineNameByWeekday(nameMap);
        await Promise.all([
          AsyncStorage.setItem(`sleepRoutineByWeekday:${user.id}`, JSON.stringify(upd)),
          AsyncStorage.setItem(`sleepRoutineNames:${user.id}`, JSON.stringify(nameMap)),
        ]);
      } else {
        const upd = { ...sportRoutineByWeekday } as Record<number, SportRoutine>;
        const nameMap = { ...sportRoutineNameByWeekday } as Record<number, string>;
        days.forEach(d => {
          if (!routineName || nameMap[d] === routineName) {
            delete upd[d];
            delete nameMap[d];
          }
        });
        setSportRoutineByWeekday(upd);
        setSportRoutineNameByWeekday(nameMap);
        await Promise.all([
          AsyncStorage.setItem(`sportRoutineByWeekday:${user.id}`, JSON.stringify(upd)),
          AsyncStorage.setItem(`sportRoutineNames:${user.id}`, JSON.stringify(nameMap)),
        ]);
      }
    } catch {}
  };

  const clearAllAssignments = async (kind: 'sleep' | 'sport') => {
    if (!user) return;
    try {
      if (kind === 'sleep') {
        setSleepRoutineByWeekday({});
        setSleepRoutineNameByWeekday({});
        setSleepRoutines([]); // Also clear the routines list
        await Promise.all([
          AsyncStorage.setItem(`sleepRoutineByWeekday:${user.id}`, JSON.stringify({})),
          AsyncStorage.setItem(`sleepRoutineNames:${user.id}`, JSON.stringify({})),
          AsyncStorage.setItem(`sleepRoutines:${user.id}`, JSON.stringify([])), // Clear routines from storage
        ]);
      } else {
        setSportRoutineByWeekday({});
        setSportRoutineNameByWeekday({});
        setSportRoutines([]); // Also clear the routines list
        await Promise.all([
          AsyncStorage.setItem(`sportRoutineByWeekday:${user.id}`, JSON.stringify({})),
          AsyncStorage.setItem(`sportRoutineNames:${user.id}`, JSON.stringify({})),
          AsyncStorage.setItem(`sportRoutines:${user.id}`, JSON.stringify([])), // Clear routines from storage
        ]);
      }
    } catch {}
  };

  const computeGroupHours = (days: number[]): number => {
    if (!days || days.length === 0) return 0;
    const d = days[0];
    const tpl = sportRoutineByWeekday[d];
    if (!tpl) return 0;
    const totalMin = Object.values(tpl.durations || {}).reduce((a, b) => a + (Number(b) || 0), 0);
    return Math.round((totalMin / 60) * 10) / 10;
  };

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

  // Prefill from routines when switching to edit mode
  useEffect(() => {
    if (user && isSleepEditing && !hasSleepSaved) {
      prefillFromTemplate('sleep');
    }
  }, [isSleepEditing, user, selectedDate]);

  useEffect(() => {
    if (user && isSportEditing && !hasSportSaved) {
      prefillFromTemplate('sport');
    }
  }, [isSportEditing, user, selectedDate]);

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
             setHasSleepSaved(true);
             setIsSleepEditing(false);
           } else {
             setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
             setHasSleepSaved(false);
             setIsSleepEditing(true);
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
             setHasMealsSaved(Boolean(record.meals.morning || record.meals.afternoon || record.meals.evening || record.meals.snack || record.meals.drinkType));
             setIsMealsEditing(!Boolean(record.meals.morning || record.meals.afternoon || record.meals.evening || record.meals.snack || record.meals.drinkType));
           } else {
             setMealData({
               morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {}
             });
             setHasMealsSaved(false);
             setIsMealsEditing(true);
           }

           if (record.symptoms) {
             setSelectedSymptoms(record.symptoms);
             setHasSymptomsSaved(record.symptoms.length > 0);
             setIsSymptomsEditing(!(record.symptoms.length > 0));
           } else {
             setSelectedSymptoms([]);
             setHasSymptomsSaved(false);
             setIsSymptomsEditing(true);
           }
           if (record.activity) setSelectedSports(record.activity); else setSelectedSports([]);
           setSportDurations({});
           if (record.period) {
             setHasPeriod(record.period.active ? 'yes' : 'no');
             setHasCycleSaved(true);
             setIsCycleEditing(false);
           } else {
             setHasPeriod('');
             setHasCycleSaved(false);
             setIsCycleEditing(true);
           }
           if (Array.isArray(record.activity) && record.activity.length > 0) {
             setHasSportSaved(true);
             setIsSportEditing(false);
           } else {
             setHasSportSaved(false);
             setIsSportEditing(true);
           }
         } else {
           setSleepData({ bedTime: '', wakeTime: '', sleepQuality: 0, sleepDuration: 0 });
           setMealData({ morning: '', afternoon: '', evening: '', snack: '', drinkType: '', drinkQuantities: {} });
           setSelectedSymptoms([]);
           setSelectedSports([]);
           setSportDurations({});
           setHasPeriod('');
           setHasSleepSaved(false);
           setHasSportSaved(false);
           setHasMealsSaved(false);
           setHasCycleSaved(false);
           setHasSymptomsSaved(false);
           setIsSleepEditing(true);
           setIsSportEditing(true);
           setIsMealsEditing(true);
           setIsCycleEditing(true);
           setIsSymptomsEditing(true);
         }
         setMealSectionIndex(0);

         // Load templates and routines, then prefill
         await loadWeeklyTemplates(user.id);
         await loadSavedRoutines(user.id);
         prefillFromTemplate('sleep');
         prefillFromTemplate('sport');
        } catch {}
      };

     loadSavedData();
   }, [user, selectedDate]);

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
     setHasSymptomsSaved(true);
     setIsSymptomsEditing(false);
   };

  const handleSaveSport = async () => {
    const totalMinutes = Object.values(sportDurations || {}).reduce((a, b) => a + (b || 0), 0);
    await saveToDatabase({ activity: selectedSports, activityMinutes: totalMinutes });
    setHasSportSaved(true);
    setIsSportEditing(false);

  };

    const handleSaveCycle = async () => {
     await saveToDatabase({
       period: { active: hasPeriod === 'yes', flow: 'medium', pain: 'none', notes: '' }
     });
     setHasCycleSaved(true);
     setIsCycleEditing(false);
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
     setHasMealsSaved(true);
     setIsMealsEditing(false);
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
      {hasSymptomsSaved && !isSymptomsEditing ? (
        <View style={[trackingStyles.sportActivityCard, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
          <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}>Data is already saved for this day.</Text>
          <TouchableOpacity onPress={() => setIsSymptomsEditing(true)} style={[trackingStyles.saveButton, { backgroundColor: '#e5e7eb' }]}>
            <Text style={[trackingStyles.saveButtonText, { color: '#111827' }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
        </>
      )}
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

        {hasMealsSaved && !isMealsEditing ? (
          <View style={[trackingStyles.sportActivityCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}>Data is already saved for this day.</Text>
            <TouchableOpacity onPress={() => setIsMealsEditing(true)} style={[trackingStyles.saveButton, { backgroundColor: '#e5e7eb' }]}>
              <Text style={[trackingStyles.saveButtonText, { color: '#111827' }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>

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
        </>
        )}
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
      {hasSportSaved && !isSportEditing ? (
        <View style={[trackingStyles.sportActivityCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}> 
          <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}> 
            {(() => { const d = new Date(selectedDate).getDay(); const nm = sportRoutineNameByWeekday[d]; return sportRoutineByWeekday[d] ? `${nm || 'Routine'} applied` : 'Data is already saved for this day.'; })()} 
          </Text>
          <TouchableOpacity onPress={() => {
            setIsSportEditing(true);
            // Force prefill from routine if available for this day
            setTimeout(() => prefillFromTemplate('sport', true), 100);
          }} style={[trackingStyles.saveButton, { backgroundColor: '#e5e7eb' }]}> 
            <Text style={[trackingStyles.saveButtonText, { color: '#111827' }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {(() => {
            const groups = groupSportAssignments();
            if (groups.length === 0) return null;
            return (
              <View style={{ borderWidth: 1, borderColor: '#d1fae5', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ color: '#111827', fontWeight: '800', marginBottom: 12, fontSize: 16 }}>Sport Routines</Text>
                
                {/* Active Routines Section */}
                <ScrollView 
                  style={{ maxHeight: 300, marginBottom: 12 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                {groups.map(g => (
                    <View key={`${g.name}`} style={{ 
                      backgroundColor: '#ffffff', 
                      padding: 12, 
                      borderRadius: 8, 
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#10b981'
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 15 }}>{g.name}</Text>
                        <TouchableOpacity onPress={() => clearRoutineFromDays('sport', g.days, g.name)} style={{ padding: 4 }}>
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                      <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>
                        Sports: {(g.activities||[]).join(', ')}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>
                        Days: {formatDaysList(g.days)}
                      </Text>
                      <Text style={{ color: '#6b7280', fontSize: 13 }}>
                        Duration: {computeGroupHours(g.days)}h total
                      </Text>
                  </View>
                ))}
                </ScrollView>

                {/* Remaining Days Section */}
                {(() => { 
                  const remaining = [0,1,2,3,4,5,6].filter(x => !sportRoutineByWeekday[x]); 
                  return remaining.length > 0 ? (
                    <View style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: 10, 
                      borderRadius: 8, 
                      borderWidth: 1, 
                      borderColor: '#e2e8f0',
                      marginBottom: 12
                    }}>
                      <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600' }}>
                        Available days: {formatDaysList(remaining)}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                        Create routines to assign to these days
                      </Text>
                    </View>
                  ) : (
                    <View style={{ 
                      backgroundColor: '#f0fdf4', 
                      padding: 10, 
                      borderRadius: 8, 
                      borderWidth: 1, 
                      borderColor: '#bbf7d0',
                      marginBottom: 12
                    }}>
                      <Text style={{ color: '#059669', fontSize: 14, fontWeight: '600' }}>
                        ✓ All days have routines assigned
                      </Text>
                    </View>
                  ); 
                })()}

                {/* Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => clearAllAssignments('sport')} style={{ 
                    paddingHorizontal: 12, 
                    paddingVertical: 8, 
                    borderRadius: 8, 
                    backgroundColor: '#fee2e2',
                    borderWidth: 1,
                    borderColor: '#fecaca'
                  }}>
                    <Text style={{ color: '#9f1239', fontWeight: '700', fontSize: 13 }}>Clear All Routines</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
          <TouchableOpacity onPress={() => setSportRoutineModalOpen(true)} style={[trackingStyles.cameraButton, { backgroundColor: '#111827' }]}> 
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={[trackingStyles.cameraButtonText, { color: '#ffffff' }]}>Manage Routines</Text>
          </TouchableOpacity>
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
        </>
      )}
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
      {hasCycleSaved && !isCycleEditing ? (
        <View style={[trackingStyles.sportActivityCard, { backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }]}>
          <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}>Data is already saved for this day.</Text>
          <TouchableOpacity onPress={() => setIsCycleEditing(true)} style={[trackingStyles.saveButton, { backgroundColor: '#e5e7eb' }]}>
            <Text style={[trackingStyles.saveButtonText, { color: '#111827' }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
        </>
      )}
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
      {hasSleepSaved && !isSleepEditing ? (
        (() => {
          const d = new Date(selectedDate).getDay();
          const nm = sleepRoutineNameByWeekday[d];
          const routine = sleepRoutineByWeekday[d];
          const hasRoutine = !!routine;
          
          // Check if user followed their routine (if they have one)
          let routineFollowed = true;
          let routineMessage = hasRoutine ? `${nm || 'Routine'} applied` : 'Data is already saved for this day.';
          
          if (hasRoutine && sleepData.bedTime && sleepData.wakeTime) {
            const actualBed = sleepData.bedTime;
            const actualWake = sleepData.wakeTime;
            const routineBed = routine.bedTime;
            const routineWake = routine.wakeTime;
            
            routineFollowed = actualBed === routineBed && actualWake === routineWake;
            
            if (!routineFollowed) {
              routineMessage = `${nm || 'Routine'} - Times modified`;
            }
          }
          
          return (
            <View style={[
              trackingStyles.sportActivityCard, 
              { 
                backgroundColor: routineFollowed ? '#eef2ff' : '#fef3c7', 
                borderColor: routineFollowed ? '#c7d2fe' : '#f59e0b' 
              }
            ]}> 
              <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}> 
                {routineMessage}
              </Text>
              {hasRoutine && !routineFollowed && (
                <Text style={{ color: '#92400e', fontSize: 14, marginBottom: 8, fontStyle: 'italic' }}>
                  Routine: {routine.bedTime} → {routine.wakeTime} • Actual: {sleepData.bedTime} → {sleepData.wakeTime}
                </Text>
              )}
              <TouchableOpacity onPress={() => {
                setIsSleepEditing(true);
                // Force prefill from routine if available for this day
                setTimeout(() => prefillFromTemplate('sleep', true), 100);
              }} style={[trackingStyles.saveButton, { backgroundColor: '#e5e7eb' }]}> 
                <Text style={[trackingStyles.saveButtonText, { color: '#111827' }]}>
                  {hasRoutine && !routineFollowed ? 'Edit for this day' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()
      ) : (
        <>
          {/* Manage Routines Button - Always visible */}
          <TouchableOpacity onPress={() => setSleepRoutineModalOpen(true)} style={[trackingStyles.cameraButton, { backgroundColor: '#111827', marginTop: 16, marginBottom: 10 }]}> 
            <Ionicons name="time-outline" size={18} color="#ffffff" />
            <Text style={[trackingStyles.cameraButtonText, { color: '#ffffff' }]}>Manage Sleep Routines</Text>
          </TouchableOpacity>

          {(() => {
            const groups = groupSleepAssignments();
            if (groups.length === 0) return null;
            return (
              <View style={{ borderWidth: 1, borderColor: '#e0e7ff', backgroundColor: '#f0f4ff', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                <Text style={{ color: '#111827', fontWeight: '700', marginBottom: 8, fontSize: 14 }}>Sleep Routines</Text>
                
                {/* Active Routines Section - Compact */}
                <ScrollView 
                  style={{ maxHeight: 200, marginBottom: 8 }}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                {groups.map(g => (
                    <View key={`${g.name}-${g.bedTime}-${g.wakeTime}`} style={{ 
                      backgroundColor: '#ffffff', 
                      padding: 8, 
                      borderRadius: 6, 
                      marginBottom: 6,
                      borderWidth: 1,
                      borderColor: '#7c3aed',
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#7c3aed', fontWeight: '600', fontSize: 13 }}>{g.name}</Text>
                        <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 1 }}>
                          {g.bedTime} → {g.wakeTime} • {formatDaysList(g.days)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => clearRoutineFromDays('sleep', g.days, g.name)} style={{ padding: 2 }}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                </ScrollView>

                {/* Remaining Days Section */}
                {(() => { 
                  const remaining = [0,1,2,3,4,5,6].filter(x => !sleepRoutineByWeekday[x]); 
                  return remaining.length > 0 ? (
                    <View style={{ 
                      backgroundColor: '#f8fafc', 
                      padding: 10, 
                      borderRadius: 8, 
                      borderWidth: 1, 
                      borderColor: '#e2e8f0',
                      marginBottom: 12
                    }}>
                      <Text style={{ color: '#475569', fontSize: 14, fontWeight: '600' }}>
                        Available days: {formatDaysList(remaining)}
                      </Text>
                      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                        Create routines to assign to these days
                      </Text>
                    </View>
                  ) : (
                    <View style={{ 
                      backgroundColor: '#f0fdf4', 
                      padding: 10, 
                      borderRadius: 8, 
                      borderWidth: 1, 
                      borderColor: '#bbf7d0',
                      marginBottom: 12
                    }}>
                      <Text style={{ color: '#059669', fontSize: 14, fontWeight: '600' }}>
                        ✓ All days have routines assigned
                      </Text>
                    </View>
                  ); 
                })()}

                {/* Actions */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => clearAllAssignments('sleep')} style={{ 
                    paddingHorizontal: 12, 
                    paddingVertical: 8, 
                    borderRadius: 8, 
                    backgroundColor: '#fee2e2',
                    borderWidth: 1,
                    borderColor: '#fecaca'
                  }}>
                    <Text style={{ color: '#9f1239', fontWeight: '700', fontSize: 13 }}>Clear All Routines</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}
          {(() => {
            const dayIdx = new Date(selectedDate).getDay();
            const routineToday = sleepRoutineByWeekday[dayIdx];
            if (routineToday) {
              return (
                <>
                  <View style={[trackingStyles.sportActivityCard, { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }]}> 
                    <Text style={[trackingStyles.sportActivityTitle, { marginBottom: 8 }]}>
                      {isSleepEditing ? 'Edit Sleep Schedule' : 'Routine applied for this day'}
                    </Text>
                    {!isSleepEditing && (
                      <Text style={{ color: '#6b7280', marginBottom: 8 }}>{(sleepRoutineNameByWeekday[dayIdx] || 'Routine')}: {routineToday.bedTime} → {routineToday.wakeTime}</Text>
                    )}
                    
                    {isSleepEditing ? (
                      <>
                        {/* Show editable time inputs when editing */}
                        <View style={trackingStyles.sportActivityRow}>
                          <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                            <Text style={trackingStyles.sportActivityLabelText}>Bedtime:</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                            <TouchableOpacity onPress={() => { 
                              setTimePickerForNewRoutine(false); 
                              setTimePickerTarget('bed'); 
                              const [hh, mm] = (sleepData.bedTime || routineToday.bedTime || '23:00').split(':'); 
                              setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                              setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                              setTimePickerOpen(true); 
                            }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                              <Text style={{ color: '#111827', fontSize: 16 }}>{sleepData.bedTime || routineToday.bedTime || 'Select'}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={trackingStyles.sportActivityRow}>
                          <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                            <Text style={trackingStyles.sportActivityLabelText}>Wake time:</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                            <TouchableOpacity onPress={() => { 
                              setTimePickerForNewRoutine(false); 
                              setTimePickerTarget('wake'); 
                              const [hh, mm] = (sleepData.wakeTime || routineToday.wakeTime || '07:00').split(':'); 
                              setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                              setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                              setTimePickerOpen(true); 
                            }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                              <Text style={{ color: '#111827', fontSize: 16 }}>{sleepData.wakeTime || routineToday.wakeTime || 'Select'}</Text>
                            </TouchableOpacity>
                          </View>
                                                 </View>
                         
                         {/* Show calculated duration when editing */}
                         <View style={trackingStyles.sportActivityRow}>
                           <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                             <Text style={trackingStyles.sportActivityLabelText}>Duration:</Text>
                           </View>
                           <View style={[trackingStyles.sportActivityInput, { justifyContent: 'center', backgroundColor: '#f3f4f6', flex: 1 }]}> 
                             <Text style={{ color: '#6b7280', fontSize: 16 }}>
                               {(() => {
                                 const bed = sleepData.bedTime || routineToday.bedTime;
                                 const wake = sleepData.wakeTime || routineToday.wakeTime;
                                 if (bed && wake) {
                                   const bedTime = new Date(`2024-01-01 ${bed}`);
                                   let wakeTime = new Date(`2024-01-01 ${wake}`);
                                   if (wakeTime < bedTime) {
                                     wakeTime = new Date(`2024-01-02 ${wake}`);
                                   }
                                   const diffMs = wakeTime.getTime() - bedTime.getTime();
                                   const duration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
                                   return `${duration}h (auto)`;
                                 }
                                 return '0h (auto)';
                               })()}
                             </Text>
                           </View>
                         </View>
                       </>
                     ) : null}
                     
                     <View style={[trackingStyles.sportActivityRow, { marginTop: isSleepEditing ? 0 : 12 }]}>
                      <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                        <Text style={trackingStyles.sportActivityLabelText}>Sleep quality (1-10):</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                        <TouchableOpacity onPress={() => setSleepQualityPickerOpen(true)} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                          <Text style={{ color: '#111827', fontSize: 16 }}>{sleepData.sleepQuality ? String(sleepData.sleepQuality) : 'Select'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={async () => {
                    // Use edited times if available, otherwise use routine times
                    const bedTime = sleepData.bedTime || routineToday.bedTime;
                    const wakeTime = sleepData.wakeTime || routineToday.wakeTime;
                    let calculatedDuration = 0;
                    if (bedTime && wakeTime) {
                      const b = new Date(`2024-01-01 ${bedTime}`);
                      let w = new Date(`2024-01-01 ${wakeTime}`);
                      if (w < b) w = new Date(`2024-01-02 ${wakeTime}`);
                      calculatedDuration = Math.round(((w.getTime() - b.getTime()) / (1000 * 60 * 60)) * 10) / 10;
                    }
                    await saveToDatabase({ sleep: { bedTime, wakeTime, sleepQuality: sleepData.sleepQuality || 0, sleepDuration: calculatedDuration } });
                    setHasSleepSaved(true);
                    setIsSleepEditing(false);
                  }} style={trackingStyles.saveButton}>
                    <Text style={trackingStyles.saveButtonText}>
                      {isSleepEditing ? 'Save Sleep Data' : "Save Today's Routine"}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            }
            return (
              <>
                <View style={trackingStyles.sportActivityCard}>
                  <Text style={trackingStyles.sportActivityTitle}>Sleep Schedule</Text>
                  <View style={trackingStyles.sportActivityRow}>
                    <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                      <Text style={trackingStyles.sportActivityLabelText}>Bedtime:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                      <TouchableOpacity onPress={() => { 
                        setTimePickerForNewRoutine(false); 
                        setTimePickerTarget('bed'); 
                        const [hh, mm] = (sleepData.bedTime || '23:00').split(':'); 
                        setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                        setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                        setTimePickerOpen(true); 
                      }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                        <Text style={{ color: '#111827', fontSize: 16 }}>{sleepData.bedTime || 'Select'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={trackingStyles.sportActivityRow}>
                    <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                      <Text style={trackingStyles.sportActivityLabelText}>Wake time:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                      <TouchableOpacity onPress={() => { 
                        setTimePickerForNewRoutine(false); 
                        setTimePickerTarget('wake'); 
                        const [hh, mm] = (sleepData.wakeTime || '07:00').split(':'); 
                        setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                        setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                        setTimePickerOpen(true); 
                      }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                        <Text style={{ color: '#111827', fontSize: 16 }}>{sleepData.wakeTime || 'Select'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={trackingStyles.sportActivityRow}>
                    <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                      <Text style={trackingStyles.sportActivityLabelText}>Sleep quality:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                      {(() => {
                        const dayIdx = new Date(selectedDate).getDay();
                        const hasRoutineToday = !!sleepRoutineByWeekday[dayIdx];
                        return (
                          <TouchableOpacity 
                            onPress={() => setSleepQualityPickerOpen(true)} 
                            style={[
                              trackingStyles.sportActivityInput, 
                              { 
                                justifyContent: 'center',
                                backgroundColor: hasRoutineToday ? '#fef3c7' : '#ffffff',
                                borderColor: hasRoutineToday ? '#f59e0b' : '#e5e7eb',
                                borderWidth: hasRoutineToday ? 2 : 1
                              }
                            ]}
                          > 
                            <Text style={{ 
                              color: hasRoutineToday ? '#92400e' : '#111827', 
                              fontSize: 16,
                              fontWeight: hasRoutineToday ? '700' : '400'
                            }}>
                              {sleepData.sleepQuality ? String(sleepData.sleepQuality) : (hasRoutineToday ? 'Please rate quality ⭐' : 'Select')}
                            </Text>
                    </TouchableOpacity>
                        );
                      })()}
                    </View>
                  </View>
                  <View style={trackingStyles.sportActivityRow}>
                    <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                      <Text style={trackingStyles.sportActivityLabelText}>Duration:</Text>
                    </View>
                    <View style={[trackingStyles.sportActivityInput, { justifyContent: 'center', backgroundColor: '#f3f4f6', flex: 1 }]}> 
                      <Text style={{ color: '#6b7280', fontSize: 16 }}>{`${sleepData.sleepDuration || 0}h (auto)`}</Text>
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
                  setHasSleepSaved(true);
                  setIsSleepEditing(false);
                }} style={trackingStyles.saveButton}>
                  <Text style={trackingStyles.saveButtonText}>Save Sleep Data</Text>
                </TouchableOpacity>
              </>
            );
          })()}
        </>
      )}
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

  // Habit summaries (declared early)
  const computeSleepHabits = (): SleepHabits => {
    const values = Object.values(sleepRoutineByWeekday || {});
    if (values.length === 0) return null;
    const freq = <T extends string>(arr: T[]) => {
      const m = new Map<T, number>();
      arr.forEach((v) => m.set(v, (m.get(v) || 0) + 1));
      return Array.from(m.entries()).sort((a,b) => b[1] - a[1]);
    };
    const bed = freq(values.map(v => v.bedTime).filter(Boolean));
    const wake = freq(values.map(v => v.wakeTime).filter(Boolean));
    const avgDur = Math.round((values.reduce((s,v)=> s + (Number(v.sleepDuration) || 0), 0) / values.length) * 10) / 10;
    return { bed, wake, avgDur };
  };

  const computeSportHabits = (): SportHabit[] | null => {
    const values = Object.values(sportRoutineByWeekday || {});
    if (values.length === 0) return null;
    const countByActivity = new Map<string, { count: number; totalMin: number }>();
    values.forEach(v => {
      (v.activities || []).forEach((name) => {
        const mins = Number(v.durations?.[name] || 0);
        const prev = countByActivity.get(name) || { count: 0, totalMin: 0 };
        countByActivity.set(name, { count: prev.count + 1, totalMin: prev.totalMin + mins });
      });
    });
    const list: SportHabit[] = Array.from(countByActivity.entries()).map(([name, data]) => ({ name, count: data.count, avgMin: Math.round((data.totalMin / Math.max(1, data.count)) * 10) / 10 }));
    list.sort((a,b) => b.count - a.count || b.avgMin - a.avgMin);
    return list;
  };

  // Optionally open Sleep Routine Manager when arriving with a specific intent
  useEffect(() => {
    if (route?.params?.openSleepRoutineManager) {
      setActiveTab('sleep');
      setSleepRoutineModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.openSleepRoutineManager]);

  return (
    <>
    <SafeAreaView style={trackingStyles.container}>
              <View style={trackingStyles.scrollContainer}> 
                 <ScrollView style={trackingStyles.padding} contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <View style={trackingStyles.header}>
            <Text style={trackingStyles.welcomeText}>Track Your Health</Text>
          </View>
          {renderProgressBar()}
          {renderTabs()}
                     <View style={[trackingStyles.content, { paddingBottom: 80 }]}>
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

    {/* Sleep Routine Manager */}
    <Modal visible={sleepRoutineModalOpen} transparent animationType="fade" onRequestClose={() => setSleepRoutineModalOpen(false)}>
      <View style={trackingStyles.modalOverlay} pointerEvents="auto">
        <View style={[trackingStyles.modalCard, { maxWidth: 420 }]} pointerEvents="auto"> 
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[trackingStyles.modalTitle, { color: '#111827' }]}>{creatingSleep ? 'Create New Routine' : 'Sleep Routines'}</Text>
            <TouchableOpacity onPress={() => setSleepRoutineModalOpen(false)}><Ionicons name="close" size={20} color="#111827" /></TouchableOpacity>
          </View>

          {sleepRoutines.length === 0 && !creatingSleep && (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ color: '#6b7280', fontWeight: '700', fontSize: 16 }}>No routines yet</Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>Create your first routine below</Text>
            </View>
          )}

          {!creatingSleep && sleepRoutines.map((r) => {
            const assigned = Object.keys(sleepRoutineNameByWeekday)
              .map(n => Number(n))
              .filter(d => sleepRoutineNameByWeekday[d] === r.name);
            const bedTime = new Date(`2024-01-01 ${r.bedTime}`);
            let wakeTime = new Date(`2024-01-01 ${r.wakeTime}`);
            if (wakeTime < bedTime) {
              wakeTime = new Date(`2024-01-02 ${r.wakeTime}`);
            }
            const hours = Math.round(((wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60)) * 10) / 10;
            
            return (
              <View key={r.id} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginTop: 12, backgroundColor: '#fafafa' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#111827', fontWeight: '700', fontSize: 16 }}>{r.name}</Text>
                <TouchableOpacity onPress={async () => {
                    Alert.alert(
                      'Delete Routine',
                      `Are you sure you want to delete "${r.name}"? This will remove it from all assigned days.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            // Remove routine from ALL days (not just calculated assigned days)
                            // Search all days that have this routine name and clear them
                            const allDaysWithThisRoutine = Object.keys(sleepRoutineNameByWeekday)
                              .map(n => Number(n))
                              .filter(d => sleepRoutineNameByWeekday[d] === r.name);
                            
                            if (allDaysWithThisRoutine.length > 0) {
                              await clearRoutineFromDays('sleep', allDaysWithThisRoutine, r.name);
                            }
                            // Remove routine from saved routines
                            const filtered = sleepRoutines.filter(x => x.id !== r.id);
                            // Rename remaining routines sequentially (Routine 1, Routine 2, etc.)
                            const renumbered = filtered.map((routine, index) => ({
                              ...routine,
                              name: `Routine ${index + 1}`
                            }));
                            setSleepRoutines(renumbered);
                            if (user) await AsyncStorage.setItem(`sleepRoutines:${user.id}`, JSON.stringify(renumbered));
                            
                            // Update routine names in day assignments
                            const updatedNameMap = { ...sleepRoutineNameByWeekday };
                            Object.keys(updatedNameMap).forEach(dayKey => {
                              const day = parseInt(dayKey);
                              const oldName = updatedNameMap[day];
                              const matchingRoutine = renumbered.find(routine => {
                                const original = sleepRoutines.find(orig => orig.name === oldName);
                                return original && routine.id === original.id;
                              });
                              if (matchingRoutine) {
                                updatedNameMap[day] = matchingRoutine.name;
                              }
                            });
                            setSleepRoutineNameByWeekday(updatedNameMap);
                            if (user) await AsyncStorage.setItem(`sleepRoutineNames:${user.id}`, JSON.stringify(updatedNameMap));
                          }
                        }
                      ]
                    );
                }}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
                <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>
                  {r.bedTime} → {r.wakeTime} ({hours}h)
                </Text>
                {assigned.length > 0 ? (
                  <Text style={{ color: '#059669', fontSize: 14, fontWeight: '600' }}>
                    Assigned to: {formatDaysList(assigned)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    Not assigned to any days
                  </Text>
                )}
              </View>
            );
          })}

          {/* Days selection for applying routines - Only when creating AND selecting days */}
          {showSleepDaysStep && creatingSleep && (
            <>
              <Text style={{ color: '#111827', fontWeight: '800', marginTop: 18, marginBottom: 8 }}>
                1) Select days to assign routine:
              </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[0,1,2,3,4,5,6].map((d) => {
              const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const active = sleepDaysSelected.includes(d);
                  const hasRoutine = !!sleepRoutineByWeekday[d];
                  const routineName = sleepRoutineNameByWeekday[d];
                  
              return (
                    <TouchableOpacity 
                      key={d} 
                      onPress={() => setSleepDaysSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} 
                      style={{ 
                        paddingHorizontal: 16, 
                        paddingVertical: 10, 
                        borderRadius: 12, 
                        backgroundColor: active ? '#111827' : (hasRoutine ? '#eef2ff' : '#eef2f7'),
                        borderWidth: hasRoutine ? 2 : 1,
                        borderColor: hasRoutine ? '#7c3aed' : '#e5e7eb'
                      }}
                    >
                      <Text style={{ 
                        color: active ? '#ffffff' : (hasRoutine ? '#7c3aed' : '#6b7280'), 
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {labels[d]}
                      </Text>
                      {hasRoutine && !active && (
                        <Text style={{ 
                          color: '#7c3aed', 
                          fontSize: 10, 
                          textAlign: 'center', 
                          marginTop: 2 
                        }}>
                          {routineName}
                        </Text>
                      )}
                </TouchableOpacity>
              );
            })}
          </View>
              
              {/* Validation error */}
              {sleepDaysSelected.length === 0 && (
                <Text style={{ color: '#dc2626', fontSize: 14, marginTop: 8, fontWeight: '600' }}>
                  * Please select days
                </Text>
              )}
              
              {/* Instructions */}
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                Days with purple borders already have routines assigned. Select days to assign a new routine.
              </Text>
            </>
          )}

          {/* Create routine CTA */}
          {!creatingSleep ? (
            <TouchableOpacity onPress={() => { 
              // Check if all days are already covered by routines
              const allDays = [0, 1, 2, 3, 4, 5, 6];
              const coveredDays = allDays.filter(d => !!sleepRoutineNameByWeekday[d]);
              
              if (coveredDays.length === 7) {
                Alert.alert(
                  'All Days Managed',
                  'You already have routines for all days of the week. You can edit existing routines or delete some to create new ones.',
                  [{ text: 'OK', style: 'default' }]
                );
                return;
              }

              setSleepDaysSelected([]); 
              setNewSleepBed('23:00'); 
              setNewSleepWake('07:00'); 
              setShowSleepDaysStep(true); // Start with days selection first
              setCreatingSleep(true);
            }} style={{ marginTop: 18, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>+ Create New Routine</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 16 }}>
              {/* Sleep Schedule Card - Same design as main Sleep tab - Show only when NOT selecting days */}
              {!showSleepDaysStep && (
              <View style={trackingStyles.sportActivityCard}>
                <Text style={trackingStyles.sportActivityTitle}>2) Sleep Schedule</Text>
                                <View style={trackingStyles.sportActivityRow}>
                  <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                    <Text style={trackingStyles.sportActivityLabelText}>Bedtime:</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity onPress={() => { 
                      setTimePickerForNewRoutine(true); 
                      setTimePickerTarget('bed'); 
                      const [hh, mm] = (newSleepBed || '23:00').split(':'); 
                      setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                      setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                      setTimePickerOpen(true); 
                    }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                      <Text style={{ color: '#111827', fontSize: 16 }}>{newSleepBed || 'Select'}</Text>
                    </TouchableOpacity>
                </View>
                </View>
                <View style={trackingStyles.sportActivityRow}>
                  <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                    <Text style={trackingStyles.sportActivityLabelText}>Wake time:</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                    <TouchableOpacity onPress={() => { 
                      setTimePickerForNewRoutine(true); 
                      setTimePickerTarget('wake'); 
                      const [hh, mm] = (newSleepWake || '07:00').split(':'); 
                      setTempHour(Math.max(0, Math.min(23, parseInt(hh) || 0))); 
                      setTempMinute(Math.max(0, Math.min(59, parseInt(mm) || 0))); 
                      setTimePickerOpen(true); 
                    }} style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}> 
                      <Text style={{ color: '#111827', fontSize: 16 }}>{newSleepWake || 'Select'}</Text>
                    </TouchableOpacity>
                </View>
                </View>
                <View style={trackingStyles.sportActivityRow}>
                  <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                    <Text style={trackingStyles.sportActivityLabelText}>Duration:</Text>
                  </View>
                  <View style={[trackingStyles.sportActivityInput, { justifyContent: 'center', backgroundColor: '#f3f4f6', flex: 1 }]}> 
                    <Text style={{ color: '#6b7280', fontSize: 16 }}>
                      {(() => {
                        if (newSleepBed && newSleepWake) {
                          const bedTime = new Date(`2024-01-01 ${newSleepBed}`);
                          let wakeTime = new Date(`2024-01-01 ${newSleepWake}`);
                          if (wakeTime < bedTime) {
                            wakeTime = new Date(`2024-01-02 ${newSleepWake}`);
                          }
                          const diffMs = wakeTime.getTime() - bedTime.getTime();
                          const duration = Math.round(diffMs / (1000 * 60 * 60) * 10) / 10;
                          return `${duration}h (auto)`;
                        }
                        return '0h (auto)';
                      })()}
                    </Text>
                  </View>
                </View>
              </View>
              )}
              {(() => {
                // Show live conflicts for selected days
                const conflicts = (sleepDaysSelected || []).map(d => ({ d, name: sleepRoutineNameByWeekday[d] })).filter(x => !!x.name) as Array<{ d: number; name: string }>;
                if (conflicts.length === 0) return null;
                const label = conflicts.map(c => `${WEEKDAYS[c.d]} (${c.name})`).join(', ');
                return (
                  <Text style={{ color: '#b91c1c', marginTop: 10, fontWeight: '700' }}>Conflicts: {label}</Text>
                );
              })()}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => { 
                  setCreatingSleep(false); 
                  setShowSleepDaysStep(false);
                  setSleepDaysSelected([]);
                }} style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#111827', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={async () => {
                    if (showSleepDaysStep) {
                      // Step 1: Days selected, now go to schedule configuration
                      setShowSleepDaysStep(false);
                      return;
                    }
                    
                    // Step 2: Apply routine to selected days
                    if (sleepDaysSelected.length === 0) {
                      return; // Error already shown in UI
                    }

                    const days = Array.from(new Set(sleepDaysSelected)).sort();

                  // Smart routine detection: check if a routine with same times already exists
                  const existingRoutine = sleepRoutines.find(r => r.bedTime === newSleepBed && r.wakeTime === newSleepWake);
                  
                  if (existingRoutine) {
                    // Automatically add days to existing routine
                    const payload: SleepRoutine = { bedTime: newSleepBed, wakeTime: newSleepWake, sleepQuality: 0, sleepDuration: 0 } as any;
                    await applyRoutineToDays('sleep', payload, days, existingRoutine.name);
                    Alert.alert('Success', `Days added to ${existingRoutine.name}: ${formatDaysList(days)}`);
                    setCreatingSleep(false);
                    setShowSleepDaysStep(true);
                    setSleepDaysSelected([]);
                    return;
                  }

                  // Create new routine if no similar one exists
                  const id = String(Date.now());
                  const sleepRoutineName = generateNextRoutineName(sleepRoutines.map(r => r.name));
                  const next = [...sleepRoutines, { id, name: sleepRoutineName, bedTime: newSleepBed, wakeTime: newSleepWake }];
                  setSleepRoutines(next);
                  if (user) await AsyncStorage.setItem(`sleepRoutines:${user.id}`, JSON.stringify(next));
                    
                  try {
                      // Conflict detection: find days already assigned
                      const conflicts = days.filter(d => !!sleepRoutineNameByWeekday[d]);
                      if (conflicts.length > 0) {
                        const first = conflicts[0];
                        const assignedName = sleepRoutineNameByWeekday[first];
                        const dayLabel = WEEKDAYS[first];
                        Alert.alert(
                          'Conflict',
                          `${dayLabel} is already assigned to ${assignedName}. Reassign anyway?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Reassign',
                              style: 'destructive',
                              onPress: async () => {
                                // Group conflicts by routine name and clear them
                                const byName = new Map<string, number[]>();
                                conflicts.forEach(d => {
                                  const nm = sleepRoutineNameByWeekday[d];
                                  if (!nm) return;
                                  const arr = byName.get(nm) || [];
                                  arr.push(d);
                                  byName.set(nm, arr);
                                });
                                Array.from(byName.entries()).forEach(async ([nm, ds]) => {
                                  await clearRoutineFromDays('sleep', ds, nm);
                                });
                                const payload: SleepRoutine = { bedTime: newSleepBed, wakeTime: newSleepWake, sleepQuality: 0, sleepDuration: 0 } as any;
                                await applyRoutineToDays('sleep', payload, days, sleepRoutineName);
                                Alert.alert('Success', `Routine applied to ${formatDaysList(days)}`);
                                setCreatingSleep(false);
                                setShowSleepDaysStep(false);
                                setSleepDaysSelected([]);
                              }
                            }
                          ]
                        );
                        return;
                      }
                      const payload: SleepRoutine = { bedTime: newSleepBed, wakeTime: newSleepWake, sleepQuality: 0, sleepDuration: 0 } as any;
                      await applyRoutineToDays('sleep', payload, days, sleepRoutineName);
                      Alert.alert('Success', `Routine applied to ${formatDaysList(days)}`);
                  } catch {}
                  setCreatingSleep(false);
                    setShowSleepDaysStep(false);
                    setSleepDaysSelected([]);
                  }} 
                  style={{ 
                    flex: 1, 
                    backgroundColor: (showSleepDaysStep && sleepDaysSelected.length === 0) ? '#9ca3af' : '#111827', 
                    paddingVertical: 12, 
                    borderRadius: 12, 
                    alignItems: 'center' 
                  }}
                  disabled={showSleepDaysStep && sleepDaysSelected.length === 0}
                >
                  <Text style={{ color: 'white', fontWeight: '800' }}>
                    {showSleepDaysStep ? 'Next: Set Schedule' : 'Create & Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Time picker inside Sleep routine modal */}
          {timePickerOpen && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <View style={[trackingStyles.modalCard, { maxWidth: 340, backgroundColor: '#ffffff' }]}> 
                <Text style={[trackingStyles.modalTitle, { color: '#111827' }]}>Select time</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <ScrollView 
                      style={{ maxHeight: 160 }} 
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {HOURS.map(h => (
                        <TouchableOpacity key={h} onPress={() => setTempHour(h)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: tempHour===h?'#eef2ff':'#ffffff', borderRadius: 8, marginBottom: 4, borderWidth: tempHour===h ? 2 : 1, borderColor: tempHour===h ? '#7c3aed' : '#e5e7eb' }}>
                          <Text style={{ color: '#111827', fontWeight: tempHour===h?'700':'500', textAlign: 'center' }}>{pad2(h)}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={{ color: '#111827', fontWeight: '800' }}>:</Text>
                  <View style={{ flex: 1 }}>
                    <ScrollView 
                      style={{ maxHeight: 160 }} 
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                      contentContainerStyle={{ paddingVertical: 4 }}
                    >
                      {MINUTES.map(m => (
                        <TouchableOpacity key={m} onPress={() => setTempMinute(m)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: tempMinute===m?'#eef2ff':'#ffffff', borderRadius: 8, marginBottom: 4, borderWidth: tempMinute===m ? 2 : 1, borderColor: tempMinute===m ? '#7c3aed' : '#e5e7eb' }}>
                          <Text style={{ color: '#111827', fontWeight: tempMinute===m?'700':'500', textAlign: 'center' }}>{pad2(m)}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
                <View style={trackingStyles.navigationContainer}>
                  <TouchableOpacity onPress={() => { setTimePickerOpen(false); setTimePickerForNewRoutine(false); }} style={[trackingStyles.navButton, trackingStyles.navButtonDisabled]}>
                    <Text style={trackingStyles.navButtonTextDisabled}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    const hh = pad2(tempHour); const mm = pad2(tempMinute); const v = `${hh}:${mm}`;
                    if (timePickerForNewRoutine) {
                      if (timePickerTarget === 'bed') { setNewSleepBed(v); } else { setNewSleepWake(v); }
                    } else {
                      if (timePickerTarget === 'bed') { setSleepData(prev => ({ ...prev, bedTime: v })); } else { setSleepData(prev => ({ ...prev, wakeTime: v })); }
                    }
                    setTimePickerOpen(false);
                    setTimePickerForNewRoutine(false);
                  }} style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}>
                    <Text style={trackingStyles.navButtonTextPrimary}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* Sport Routine Manager */}
    <Modal visible={sportRoutineModalOpen} transparent animationType="fade" onRequestClose={() => setSportRoutineModalOpen(false)}>
      <View style={trackingStyles.modalOverlay} pointerEvents="auto">
        <View style={[trackingStyles.modalCard, { maxWidth: 420 }]} pointerEvents="auto"> 
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[trackingStyles.modalTitle, { color: '#111827' }]}>Sport Routines</Text>
            <TouchableOpacity onPress={() => setSportRoutineModalOpen(false)}><Ionicons name="close" size={20} color="#111827" /></TouchableOpacity>
          </View>

          {sportRoutines.length === 0 && !creatingSport && (
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <Text style={{ color: '#6b7280', fontWeight: '700', fontSize: 16 }}>No routines yet</Text>
              <Text style={{ color: '#6b7280', marginTop: 4 }}>Create your first routine below</Text>
            </View>
          )}

          {!creatingSport && sportRoutines.map((r) => {
            const assigned = Object.keys(sportRoutineNameByWeekday)
              .map(n => Number(n))
              .filter(d => sportRoutineNameByWeekday[d] === r.name);
            const totalMinutes = Object.values(r.durations || {}).reduce((a, b) => a + (Number(b) || 0), 0);
            const hours = Math.round((totalMinutes / 60) * 10) / 10;
            
            return (
              <View key={r.id} style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, marginTop: 12, backgroundColor: '#fafafa' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: '#111827', fontWeight: '700', fontSize: 16 }}>{r.name}</Text>
                <TouchableOpacity onPress={async () => {
                    Alert.alert(
                      'Delete Routine',
                      `Are you sure you want to delete "${r.name}"? This will remove it from all assigned days.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: async () => {
                            // Remove routine from ALL days (not just calculated assigned days)
                            // Search all days that have this routine name and clear them
                            const allDaysWithThisRoutine = Object.keys(sportRoutineNameByWeekday)
                              .map(n => Number(n))
                              .filter(d => sportRoutineNameByWeekday[d] === r.name);
                            
                            if (allDaysWithThisRoutine.length > 0) {
                              await clearRoutineFromDays('sport', allDaysWithThisRoutine, r.name);
                            }
                            // Remove routine from saved routines
                            const filtered = sportRoutines.filter(x => x.id !== r.id);
                            // Rename remaining routines sequentially (Routine 1, Routine 2, etc.)
                            const renumbered = filtered.map((routine, index) => ({
                              ...routine,
                              name: `Routine ${index + 1}`
                            }));
                            setSportRoutines(renumbered);
                            if (user) await AsyncStorage.setItem(`sportRoutines:${user.id}`, JSON.stringify(renumbered));
                            
                            // Update routine names in day assignments
                            const updatedNameMap = { ...sportRoutineNameByWeekday };
                            Object.keys(updatedNameMap).forEach(dayKey => {
                              const day = parseInt(dayKey);
                              const oldName = updatedNameMap[day];
                              const matchingRoutine = renumbered.find(routine => {
                                const original = sportRoutines.find(orig => orig.name === oldName);
                                return original && routine.id === original.id;
                              });
                              if (matchingRoutine) {
                                updatedNameMap[day] = matchingRoutine.name;
                              }
                            });
                            setSportRoutineNameByWeekday(updatedNameMap);
                            if (user) await AsyncStorage.setItem(`sportRoutineNames:${user.id}`, JSON.stringify(updatedNameMap));
                          }
                        }
                      ]
                    );
                }}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
                <Text style={{ color: '#6b7280', fontSize: 14, marginBottom: 4 }}>
                  {(r.activities || []).join(', ') || 'No activities'} ({hours}h)
                </Text>
                {assigned.length > 0 ? (
                  <Text style={{ color: '#059669', fontSize: 14, fontWeight: '600' }}>
                    Assigned to: {formatDaysList(assigned)}
                  </Text>
                ) : (
                  <Text style={{ color: '#6b7280', fontSize: 14, fontStyle: 'italic' }}>
                    Not assigned to any days
                  </Text>
                )}
              </View>
            );
          })}



          {/* Days selection for applying routines - Only when creating AND selecting days */}
          {showSportDaysStep && creatingSport && (
            <>
              <Text style={{ color: '#111827', fontWeight: '800', marginTop: 18, marginBottom: 8 }}>
                1) Select days to assign routine:
              </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[0,1,2,3,4,5,6].map((d) => {
              const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const active = sportDaysSelected.includes(d);
              const hasRoutine = !!sportRoutineByWeekday[d];
              const routineName = sportRoutineNameByWeekday[d];
              
              return (
                <TouchableOpacity 
                  key={d} 
                  onPress={() => setSportDaysSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} 
                  style={{ 
                    paddingHorizontal: 16, 
                    paddingVertical: 10, 
                    borderRadius: 12, 
                    backgroundColor: active ? '#111827' : (hasRoutine ? '#eef2ff' : '#eef2f7'),
                    borderWidth: hasRoutine ? 2 : 1,
                    borderColor: hasRoutine ? '#10b981' : '#e5e7eb'
                  }}
                >
                  <Text style={{ 
                    color: active ? '#ffffff' : (hasRoutine ? '#10b981' : '#6b7280'), 
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    {labels[d]}
                  </Text>
                  {hasRoutine && !active && (
                    <Text style={{ 
                      color: '#10b981', 
                      fontSize: 10, 
                      textAlign: 'center', 
                      marginTop: 2 
                    }}>
                      {routineName}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Validation error */}
          {(sportDaysSelected.length === 0 || newSportActivities.length === 0) && (
            <View style={{ marginTop: 8 }}>
              {sportDaysSelected.length === 0 && (
                <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '600' }}>
                  * Please select days
                </Text>
              )}
              {newSportActivities.length === 0 && (
                <Text style={{ color: '#dc2626', fontSize: 14, fontWeight: '600' }}>
                  * Please select activities
                </Text>
              )}
            </View>
          )}
          
          {/* Instructions */}
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
            Days with green borders already have routines assigned. Select days to assign a new routine.
          </Text>
            </>
          )}

          {!creatingSport ? (
            <TouchableOpacity onPress={() => { 
              // Check if all days are already covered by routines
              const allDays = [0, 1, 2, 3, 4, 5, 6];
              const coveredDays = allDays.filter(d => !!sportRoutineNameByWeekday[d]);
              
              if (coveredDays.length === 7) {
                Alert.alert(
                  'All Days Managed',
                  'You already have routines for all days of the week. You can edit existing routines or delete some to create new ones.',
                  [{ text: 'OK', style: 'default' }]
                );
                return;
              }

              setCreatingSport(true);
              setShowSportDaysStep(true); // Start with days selection first
              setShowSportActivitiesStep(false);
              setShowSportDurationsStep(false);
              setSportDaysSelected([]);
              setNewSportActivities([]);
              setNewSportDurations({});
            }} style={{ marginTop: 18, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>+ Create New Routine</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 16 }}>
              {/* Step 2: Show activities selection */}
              {showSportActivitiesStep && (
                <>
                  <Text style={{ color: '#111827', fontWeight: '800', marginBottom: 12 }}>2) Select Activities</Text>
                  <MultiSelect label="Activities" options={sportActivities} value={newSportActivities} onChange={(vals) => { setNewSportActivities(vals); const map: Record<string, number> = {}; vals.forEach(v => { map[v] = newSportDurations[v] || 30; }); setNewSportDurations(map);} } allowOther category="sports" />
                </>
              )}

              {/* Step 3: Show durations selection */}
              {showSportDurationsStep && newSportActivities.length > 0 && (
                <>
                  <Text style={{ color: '#111827', fontWeight: '800', marginBottom: 12 }}>3) Select Duration for Each Activity</Text>
                  <View style={{ marginTop: 8 }}>
                    {newSportActivities.map(a => (
                      <View key={a} style={trackingStyles.sportActivityRow}>
                        <View style={[trackingStyles.sportActivityLabel, { minWidth: 140 }]}>
                          <Text style={trackingStyles.sportActivityLabelText}>{a}:</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flex: 1 }}>
                          <TouchableOpacity 
                            onPress={() => {
                              // Logic to show duration picker for this activity
                              // For now, cycle through common durations
                              const durations = [15, 30, 45, 60, 75, 90, 120];
                              const current = newSportDurations[a] || 30;
                              const currentIndex = durations.indexOf(current);
                              const nextIndex = (currentIndex + 1) % durations.length;
                              setNewSportDurations(prev => ({ ...prev, [a]: durations[nextIndex] }));
                            }}
                            style={[trackingStyles.sportActivityInput, { justifyContent: 'center' }]}
                          >
                            <Text style={{ color: '#111827', fontSize: 16 }}>{newSportDurations[a] || 30} min</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 14 }}>
                <TouchableOpacity onPress={() => { 
                  setCreatingSport(false); 
                  setShowSportDaysStep(true); // Reset to first step
                  setShowSportActivitiesStep(false);
                  setShowSportDurationsStep(false);
                  setSportDaysSelected([]);
                  setNewSportActivities([]); 
                  setNewSportDurations({}); 
                }} style={{ flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#111827', fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={async () => {
                    if (showSportDaysStep) {
                      // Step 1: Days selected, now go to activities selection
                      setShowSportDaysStep(false);
                      setShowSportActivitiesStep(true);
                      return;
                    }
                    
                    if (showSportActivitiesStep) {
                      // Step 2: Activities selected, now go to durations selection
                      setShowSportActivitiesStep(false);
                      setShowSportDurationsStep(true);
                      return;
                    }
                    
                    // Step 3: Apply routine to selected days
                    if (sportDaysSelected.length === 0 || newSportActivities.length === 0) {
                      return; // Errors already shown in UI
                    }

                    const days = Array.from(new Set(sportDaysSelected)).sort();

                    // Smart routine detection: check if a routine with same activities and durations already exists
                    const existingRoutine = sportRoutines.find(r => {
                      // Check if activities match
                      const activitiesMatch = JSON.stringify(r.activities.sort()) === JSON.stringify(newSportActivities.sort());
                      // Check if durations match
                      const durationsMatch = JSON.stringify(r.durations) === JSON.stringify(newSportDurations);
                      return activitiesMatch && durationsMatch;
                    });
                    
                    if (existingRoutine) {
                      // Automatically add days to existing routine
                      const payload: SportRoutine = { activities: newSportActivities, durations: newSportDurations } as any;
                      await applyRoutineToDays('sport', payload, days, existingRoutine.name);
                      const activitiesList = newSportActivities.join(', ');
                      Alert.alert('Success', `Days added to ${existingRoutine.name} (${activitiesList}): ${formatDaysList(days)}`);
                      setCreatingSport(false);
                      setShowSportDaysStep(true);
                      setSportDaysSelected([]);
                      setNewSportActivities([]);
                      setNewSportDurations({});
                      return;
                    }

                    // Create new routine if no similar one exists
                    const id = String(Date.now());
                    const sportRoutineName = generateNextRoutineName(sportRoutines.map(r => r.name));
                    const next = [...sportRoutines, { id, name: sportRoutineName, activities: newSportActivities, durations: newSportDurations }];
                    setSportRoutines(next);
                    if (user) await AsyncStorage.setItem(`sportRoutines:${user.id}`, JSON.stringify(next));
                    
                  try {
                      const payload: SportRoutine = { activities: newSportActivities, durations: newSportDurations } as any;
                      await applyRoutineToDays('sport', payload, days, sportRoutineName);
                      Alert.alert('Success', `Routine applied to ${formatDaysList(days)}`);
                  } catch {}
                    setCreatingSport(false); 
                    setShowSportDaysStep(true); // Reset to first step
                    setShowSportActivitiesStep(false);
                    setShowSportDurationsStep(false);
                    setSportDaysSelected([]);
                    setNewSportActivities([]); 
                    setNewSportDurations({});
                  }} 
                  style={{ 
                    flex: 1, 
                    backgroundColor: (
                      (showSportDaysStep && sportDaysSelected.length === 0) ||
                      (showSportActivitiesStep && newSportActivities.length === 0) ||
                      (showSportDurationsStep && newSportActivities.length === 0)
                    ) ? '#9ca3af' : '#111827', 
                    paddingVertical: 12, 
                    borderRadius: 12, 
                    alignItems: 'center' 
                  }}
                  disabled={
                    (showSportDaysStep && sportDaysSelected.length === 0) ||
                    (showSportActivitiesStep && newSportActivities.length === 0) ||
                    (showSportDurationsStep && newSportActivities.length === 0)
                  }
                >
                  <Text style={{ color: 'white', fontWeight: '800' }}>
                    {showSportDaysStep ? 'Next: Set Activities' : 
                     showSportActivitiesStep ? 'Next: Set Duration' : 
                     'Create & Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>

    {/* Time picker for normal Sleep Tracking (not routines) */}
    <Modal visible={timePickerOpen && !timePickerForNewRoutine} transparent animationType="fade" onRequestClose={() => setTimePickerOpen(false)}>
      <View style={trackingStyles.modalOverlay} pointerEvents="auto">
        <View style={[trackingStyles.modalCard, { maxWidth: 340 }]} pointerEvents="auto"> 
          <Text style={[trackingStyles.modalTitle, { color: '#111827' }]}>Select time</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <ScrollView 
                style={{ maxHeight: 160 }} 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                {HOURS.map(h => (
                  <TouchableOpacity key={h} onPress={() => setTempHour(h)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: tempHour===h?'#eef2ff':'#ffffff', borderRadius: 8, marginBottom: 4, borderWidth: tempHour===h ? 2 : 1, borderColor: tempHour===h ? '#7c3aed' : '#e5e7eb' }}>
                    <Text style={{ color: '#111827', fontWeight: tempHour===h?'700':'500', textAlign: 'center' }}>{pad2(h)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={{ color: '#111827', fontWeight: '800' }}>:</Text>
            <View style={{ flex: 1 }}>
              <ScrollView 
                style={{ maxHeight: 160 }} 
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                contentContainerStyle={{ paddingVertical: 4 }}
              >
                {MINUTES.map(m => (
                  <TouchableOpacity key={m} onPress={() => setTempMinute(m)} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: tempMinute===m?'#eef2ff':'#ffffff', borderRadius: 8, marginBottom: 4, borderWidth: tempMinute===m ? 2 : 1, borderColor: tempMinute===m ? '#7c3aed' : '#e5e7eb' }}>
                    <Text style={{ color: '#111827', fontWeight: tempMinute===m?'700':'500', textAlign: 'center' }}>{pad2(m)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <View style={trackingStyles.navigationContainer}>
            <TouchableOpacity onPress={() => { setTimePickerOpen(false); setTimePickerForNewRoutine(false); }} style={[trackingStyles.navButton, trackingStyles.navButtonDisabled]}>
              <Text style={trackingStyles.navButtonTextDisabled}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              const hh = pad2(tempHour); const mm = pad2(tempMinute); const v = `${hh}:${mm}`;
              if (timePickerTarget === 'bed') { setSleepData(prev => ({ ...prev, bedTime: v })); } else { setSleepData(prev => ({ ...prev, wakeTime: v })); }
              setTimePickerOpen(false);
              setTimePickerForNewRoutine(false);
            }} style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}>
              <Text style={trackingStyles.navButtonTextPrimary}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Sleep quality picker */}
    <Modal visible={sleepQualityPickerOpen} transparent animationType="fade" onRequestClose={() => setSleepQualityPickerOpen(false)}>
      <View style={trackingStyles.modalOverlay} pointerEvents="auto">
        <View style={[trackingStyles.modalCard, { maxWidth: 320 }]} pointerEvents="auto">
          <Text style={[trackingStyles.modalTitle, { color: '#111827' }]}>Select sleep quality</Text>
          <ScrollView 
            style={{ maxHeight: 240, marginTop: 12 }} 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {[1,2,3,4,5,6,7,8,9,10].map(q => {
              const active = sleepData.sleepQuality === q;
              return (
                <TouchableOpacity key={q} onPress={() => setSleepData(prev => ({ ...prev, sleepQuality: q }))} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 6, backgroundColor: active ? '#111827' : '#ffffff', borderWidth: 1, borderColor: active ? '#111827' : '#e5e7eb' }}>
                  <Text style={{ color: active ? '#ffffff' : '#111827', fontWeight: '700', textAlign: 'center' }}>{q}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={trackingStyles.navigationContainer}>
            <TouchableOpacity onPress={() => setSleepQualityPickerOpen(false)} style={[trackingStyles.navButton, trackingStyles.navButtonPrimary]}>
              <Text style={trackingStyles.navButtonTextPrimary}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
} 