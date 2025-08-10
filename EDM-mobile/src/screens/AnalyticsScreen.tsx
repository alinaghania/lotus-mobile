import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useDate } from '../contexts/DateContext';
import { profileService } from '../services/profileService';
import { trackingService } from '../services/trackingService';
import { analyticsService } from '../services/analyticsService';
import { DailyRecord, TrackingProgress } from '../types/tracking';
import { analyticsStyles } from '../styles/analyticsStyles';
import { generateHealthReportPdf } from '../services/pdfService';
import Svg, { Polyline, Text as SvgText, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const SYMPTOMS = [
  'Headache', 'Fatigue', 'Bloating', 'Nausea', 'Joint Pain', 'Skin Issues',
  'Mood Changes', 'Sleep Issues', 'Digestive Issues', 'Energy Levels',
  'Concentration', 'Stress'
];

type FilterType = 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Custom';
type Granularity = 'Daily' | 'Weekly' | 'Monthly';

function getRange(selected: FilterType, anchorDate: Date) {
  const end = anchorDate.toISOString().split('T')[0];
  const d = new Date(anchorDate);
  if (selected === 'Last 3 Days') d.setDate(d.getDate() - 2);
  else if (selected === 'Last Week') d.setDate(d.getDate() - 6);
  else if (selected === 'Last Month') d.setDate(d.getDate() - 29);
  const start = d.toISOString().split('T')[0];
  return { start, end };
}

function fmt(d: Date) { return d.toISOString().split('T')[0]; }

function buildMonthMatrix(currentMonth: Date): Date[] {
  const first = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startIdx = first.getDay(); // 0-6
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const days: Date[] = [];
  for (let i = 0; i < startIdx; i++) days.push(new Date(NaN));
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
  while (days.length % 7 !== 0) days.push(new Date(NaN));
  return days;
}

// Hoisted helpers used by useMemo below
const weekKey = (dateStr: string) => {
  const d = new Date(dateStr);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

const monthKey = (dateStr: string) => {
  const d = new Date(dateStr);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
};

const groupCalories = (dates: string[], values: number[], g: Granularity) => {
  if (g === 'Daily') return { labels: dates.map(d => d.slice(5)), values };
  const map = new Map<string, { sum: number; count: number }>();
  dates.forEach((d, i) => {
    const key = g === 'Weekly' ? weekKey(d) : monthKey(d);
    const entry = map.get(key) || { sum: 0, count: 0 };
    entry.sum += values[i] || 0;
    entry.count += 1;
    map.set(key, entry);
  });
  const entries = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  return { labels: entries.map(e => e[0]), values: entries.map(e => Math.round((e[1].sum / (e[1].count || 1)) * 10) / 10) };
};

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const { selectedDate } = useDate();
  const [, forceUpdate] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Last Week');
  const [granularity, setGranularity] = useState<Granularity>('Daily');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [info, setInfo] = useState<Record<string, boolean>>({});
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [trackingProgress, setTrackingProgress] = useState<TrackingProgress>({
    meals: 0,
    symptoms: 0,
    digestive: 0,
    optional: { sleep: 0, sport: 0, cycle: 0, drinks: 0, snacks: 0 }
  });
  const [symptomStats, setSymptomStats] = useState<{ name: string; count: number }[]>([]);
  const [caloriesSeries, setCaloriesSeries] = useState<{ labels: string[]; values: number[]; average: number }>({ labels: [], values: [], average: 0 });
  const [caloriesDates, setCaloriesDates] = useState<string[]>([]);
  const [foodsTop, setFoodsTop] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [foodSymptomMatrix, setFoodSymptomMatrix] = useState<{ foods: string[]; symptoms: string[]; cooccurrence: number[][] }>({ foods: [], symptoms: [], cooccurrence: [] });
  const [foodDigestiveCorrelation, setFoodDigestiveCorrelation] = useState<Array<{ name: string; correlationPct: number }>>([]);
  const [symptomsOverTime, setSymptomsOverTime] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [digestiveTrend, setDigestiveTrend] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [periodSeries, setPeriodSeries] = useState<{ labels: string[]; withPeriod: number[]; withoutPeriod: number[] }>({ labels: [], withPeriod: [], withoutPeriod: [] });
  const [cyclePrediction, setCyclePrediction] = useState<{ lastPeriodDate?: string; nextPeriodDate: string; nextOvulationDate: string; cycleLengthDays: number; latenessDays?: number } | null>(null);
  const [bloatingStats, setBloatingStats] = useState<{ daysWith: number; totalDays: number }>({ daysWith: 0, totalDays: 0 });
  const bellyScale = React.useRef(new Animated.Value(1)).current;
  const [weightSeries, setWeightSeries] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [kpis, setKpis] = useState<{ sleepAvgH: number; sportAvgH: number; totalDays: number; symptomsAvg: number; caloriesAvg: number }>({ sleepAvgH: 0, sportAvgH: 0, totalDays: 0, symptomsAvg: 0, caloriesAvg: 0 });
  const BLOATED_IMG = require('../../assets/images/bloat_pic.png');
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      const date = selectedDate.toISOString().split('T')[0];
      const rec = await trackingService.getTrackingByDate(user.id, date);
      setDailyRecord(rec);
      setTrackingProgress(calculateTrackingProgress(rec));

      const { start, end } = selectedFilter === 'Custom' && customStart && customEnd
        ? { start: customStart, end: customEnd }
        : getRange(selectedFilter, new Date());
      const ana = await analyticsService.getAnalytics(user.id, start, end);
      setSymptomStats(ana.symptomsData);
      const cal = ana.caloriesData || { average: 0, perDay: [] };
      setCaloriesDates(cal.perDay.map(d => d.date));
      setCaloriesSeries({ labels: cal.perDay.map(d => d.date.slice(5)), values: cal.perDay.map(d => d.calories || 0), average: cal.average || 0 });
      const foods = ana.foodsData || [];
      setFoodsTop({ labels: foods.slice(0, 5).map(f => f.name), values: foods.slice(0, 5).map(f => f.count) });
      if (ana.foodSymptomMatrix) setFoodSymptomMatrix(ana.foodSymptomMatrix);
      if ((ana as any).foodDigestiveCorrelation) setFoodDigestiveCorrelation((ana as any).foodDigestiveCorrelation);
      if ((ana as any).foodSymptomDetails) (AnalyticsScreen as any)._foodSymptomDetails = (ana as any).foodSymptomDetails;
      if (ana.symptomsOverTime) setSymptomsOverTime({ labels: ana.symptomsOverTime.map(s => s.date.slice(5)), values: ana.symptomsOverTime.map(s => s.count) });
      if (ana.digestiveIssuesTrend) setDigestiveTrend({ labels: ana.digestiveIssuesTrend.map(s => s.date.slice(5)), values: ana.digestiveIssuesTrend.map(s => s.count) });
      if (ana.periodSymptomsSeries) setPeriodSeries({ labels: ana.periodSymptomsSeries.dates.map(d => d.slice(5)), withPeriod: ana.periodSymptomsSeries.withPeriod, withoutPeriod: ana.periodSymptomsSeries.withoutPeriod });
      if (ana.cyclePrediction) setCyclePrediction(ana.cyclePrediction as any);

      // Compute bloating stats (days with "Bloating" within range)
      try {
        const all = await trackingService.getTrackingByUser(user.id);
        const inRange = all.filter(r => r.date >= start && r.date <= end);
        const bloatingRegex = /bloat/i;
        const byDate = new Map<string, boolean>();
        inRange.forEach(r => {
          const has = (r.symptoms || []).some(s => bloatingRegex.test(String(s)));
          byDate.set(r.date, has);
        });
        // total days is calendar day count in range
        const sd = new Date(start);
        const ed = new Date(end);
        const diffDays = Math.round((ed.getTime() - sd.getTime()) / 86400000) + 1;
        const daysWith = Array.from(byDate.values()).filter(Boolean).length;
        setBloatingStats({ daysWith, totalDays: Math.max(diffDays, 0) });

        // KPIs
        const sleepDurations = inRange.map(r => r.sleep?.sleepDuration || 0).filter(v => v > 0);
        const sleepAvgH = sleepDurations.length > 0 ? Math.round((sleepDurations.reduce((a,b)=>a+b,0) / sleepDurations.length) * 10) / 10 : 0;
        const sportTotals = inRange.map(r => (r.activityMinutes && r.activityMinutes > 0) ? r.activityMinutes : 0);
        const activeDays = sportTotals.filter(m => m > 0).length;
        const sportAvgH = activeDays > 0 ? Math.round(((sportTotals.reduce((a,b)=>a+b,0) / activeDays) / 60) * 10) / 10 : 0;
        const symptomsAvg = ana.symptomsOverTime && ana.symptomsOverTime.length > 0 ? Math.round((ana.symptomsOverTime.reduce((a,b)=>a+(b.count||0),0) / ana.symptomsOverTime.length) * 10) / 10 : 0;
        const caloriesAvg = ana.caloriesData?.average || 0;
        setKpis({ sleepAvgH, sportAvgH, totalDays: Math.max(diffDays, 0), symptomsAvg, caloriesAvg });
      } catch {}

      // Load weight history from profile for the selected range
      try {
        const profile = await profileService.getProfile(user.id);
        const weights = (profile?.weights || [])
          .filter(w => w.date >= start && w.date <= end)
          .sort((a, b) => a.date.localeCompare(b.date));
        setWeightSeries({ labels: weights.map(w => w.date.slice(5)), values: weights.map(w => w.kg) });
      } catch {}
    };
    load();
  }, [user, selectedDate, selectedFilter, customStart, customEnd]);

  // Start belly animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bellyScale, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bellyScale, { toValue: 1.0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [bellyScale]);

  const realKpis = useMemo(() => {
    const totalProgress = trackingProgress.meals + trackingProgress.symptoms + trackingProgress.optional.sleep + trackingProgress.optional.sport + trackingProgress.optional.cycle;
    return {
      sleepProgress: trackingProgress.optional.sleep,
      mealsProgress: trackingProgress.meals,
      sportProgress: trackingProgress.optional.sport,
      symptomsProgress: trackingProgress.symptoms,
      totalProgress: totalProgress,
      dataCompleteness: totalProgress
    };
  }, [trackingProgress]);

  const caloriesGrouped = useMemo(() => groupCalories(caloriesDates, caloriesSeries.values, granularity), [caloriesDates, caloriesSeries.values, granularity]);
  const topSymptoms = useMemo(() => symptomStats.slice(0, 5), [symptomStats]);

  const insights = useMemo(() => {
    const items: Array<{ title: string; text: string }> = [];
    // Helper: count of distinct days available across graphs
    const daysCandidates = [
      new Set(caloriesGrouped.labels).size,
      new Set(digestiveTrend.labels).size,
      new Set(periodSeries.labels || []).size || 0,
    ];
    const dataDays = Math.max(0, ...daysCandidates);

    // Food correlation (only if we have at least 2 foods and a meaningful top correlation)
    const topCorr = foodDigestiveCorrelation[0]?.correlationPct || 0;
    const reduceFoods = foodDigestiveCorrelation.slice(0, 3).map(f => f.name);
    if (reduceFoods.length >= 2 && topCorr >= 40) {
      items.push({
        title: 'Reduce foods linked to digestive issues',
        text: `Consider reducing: ${reduceFoods.join(', ')} (based on co-logged digestive symptoms).`
      });
    }

    // Calories trend (require >=5 points)
    if (caloriesGrouped.values.length >= 5) {
      const first = caloriesGrouped.values[0] || 0;
      const last = caloriesGrouped.values[caloriesGrouped.values.length - 1] || 0;
      const delta = Math.round((last - first));
      const dir = Math.abs(delta) < 20 ? 'stable' : (delta > 0 ? 'trending up' : 'trending down');
      items.push({ title: 'Calories trend', text: `Your calories are ${dir}${dir !== 'stable' ? ` (${delta >= 0 ? '+' : ''}${delta})` : ''}.` });
    }

    // Digestive issues baseline (require >=5 days)
    if (digestiveTrend.values.length >= 5) {
      const avg = Math.round((digestiveTrend.values.reduce((a, b) => a + (b || 0), 0) / digestiveTrend.values.length) * 10) / 10;
      items.push({ title: 'Digestive issues frequency', text: `Average ${avg} symptom(s) per day in this period.` });
    }

    // Symptoms vs period (require at least 3 total symptoms across the period)
    const sumWith = (periodSeries.withPeriod || []).reduce((a,b)=>a+(b||0),0);
    const sumWithout = (periodSeries.withoutPeriod || []).reduce((a,b)=>a+(b||0),0);
    if (sumWith + sumWithout >= 3) {
      const more = sumWith > sumWithout ? 'during period days' : sumWith < sumWithout ? 'outside period days' : 'equally on both';
      items.push({ title: 'Symptoms vs period', text: `You log more symptoms ${more}.` });
    }

    // Cycle prediction (only show if we have at least some tracked days)
    if (cyclePrediction && dataDays >= 3) {
      items.push({ title: 'Next important dates', text: `Next period: ${cyclePrediction.nextPeriodDate}; next ovulation: ${cyclePrediction.nextOvulationDate}.` });
    }
    return items;
  }, [foodDigestiveCorrelation, caloriesGrouped, digestiveTrend, periodSeries, cyclePrediction]);

  const toggleInfo = (id: string) => setInfo(prev => ({ ...prev, [id]: !prev[id] }));

  const calculateTrackingProgress = (record: DailyRecord | null): TrackingProgress => {
    const progress: TrackingProgress = { meals: 0, symptoms: 0, digestive: 0, optional: { sport: 0, cycle: 0, drinks: 0, snacks: 0, sleep: 0 } };
    if (!record) return progress;
    const hasSleep = record.sleep && (record.sleep.bedTime || record.sleep.wakeTime);
    progress.optional.sleep = hasSleep ? 20 : 0;
    if (record.meals) {
      const hasMeals = record.meals.morning || record.meals.afternoon || record.meals.evening;
      progress.meals = hasMeals ? 20 : 0;
    }
    progress.optional.sport = (record.activity && record.activity.length > 0) ? 20 : 0;
    progress.optional.cycle = record.period ? 20 : 0;
    progress.symptoms = (record.symptoms && record.symptoms.length > 0) ? 20 : 0;
    return progress;
  };

  /* helpers moved above for hoisting */

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const date = selectedDate.toISOString().split('T')[0];
      const rec = await trackingService.getTrackingByDate(user.id, date);
      setDailyRecord(rec);
      setTrackingProgress(calculateTrackingProgress(rec));

      const { start, end } = selectedFilter === 'Custom' && customStart && customEnd
        ? { start: customStart, end: customEnd }
        : getRange(selectedFilter, new Date());
      const ana = await analyticsService.getAnalytics(user.id, start, end);
      setSymptomStats(ana.symptomsData);
      const cal = ana.caloriesData || { average: 0, perDay: [] };
      setCaloriesDates(cal.perDay.map(d => d.date));
      setCaloriesSeries({ labels: cal.perDay.map(d => d.date.slice(5)), values: cal.perDay.map(d => d.calories || 0), average: cal.average || 0 });
      const foods = ana.foodsData || [];
      setFoodsTop({ labels: foods.slice(0, 5).map(f => f.name), values: foods.slice(0, 5).map(f => f.count) });
      if (ana.foodSymptomMatrix) setFoodSymptomMatrix(ana.foodSymptomMatrix);
      if ((ana as any).foodDigestiveCorrelation) setFoodDigestiveCorrelation((ana as any).foodDigestiveCorrelation);
      if ((ana as any).foodSymptomDetails) (AnalyticsScreen as any)._foodSymptomDetails = (ana as any).foodSymptomDetails;
      if (ana.symptomsOverTime) setSymptomsOverTime({ labels: ana.symptomsOverTime.map(s => s.date.slice(5)), values: ana.symptomsOverTime.map(s => s.count) });
      if (ana.digestiveIssuesTrend) setDigestiveTrend({ labels: ana.digestiveIssuesTrend.map(s => s.date.slice(5)), values: ana.digestiveIssuesTrend.map(s => s.count) });
      if (ana.periodSymptomsSeries) setPeriodSeries({ labels: ana.periodSymptomsSeries.dates.map(d => d.slice(5)), withPeriod: ana.periodSymptomsSeries.withPeriod, withoutPeriod: ana.periodSymptomsSeries.withoutPeriod });
      if (ana.cyclePrediction) setCyclePrediction(ana.cyclePrediction as any);

      // Compute bloating stats (days with "Bloating" within range)
      try {
        const all = await trackingService.getTrackingByUser(user.id);
        const inRange = all.filter(r => r.date >= start && r.date <= end);
        const bloatingRegex = /bloat/i;
        const byDate = new Map<string, boolean>();
        inRange.forEach(r => {
          const has = (r.symptoms || []).some(s => bloatingRegex.test(String(s)));
          byDate.set(r.date, has);
        });
        // total days is calendar day count in range
        const sd = new Date(start);
        const ed = new Date(end);
        const diffDays = Math.round((ed.getTime() - sd.getTime()) / 86400000) + 1;
        const daysWith = Array.from(byDate.values()).filter(Boolean).length;
        setBloatingStats({ daysWith, totalDays: Math.max(diffDays, 0) });

        // KPIs
        const sleepDurations = inRange.map(r => r.sleep?.sleepDuration || 0).filter(v => v > 0);
        const sleepAvgH = sleepDurations.length > 0 ? Math.round((sleepDurations.reduce((a,b)=>a+b,0) / sleepDurations.length) * 10) / 10 : 0;
        const sportTotals = inRange.map(r => (r.activityMinutes && r.activityMinutes > 0) ? r.activityMinutes : 0);
        const activeDays = sportTotals.filter(m => m > 0).length;
        const sportAvgH = activeDays > 0 ? Math.round(((sportTotals.reduce((a,b)=>a+b,0) / activeDays) / 60) * 10) / 10 : 0;
        const symptomsAvg = ana.symptomsOverTime && ana.symptomsOverTime.length > 0 ? Math.round((ana.symptomsOverTime.reduce((a,b)=>a+(b.count||0),0) / ana.symptomsOverTime.length) * 10) / 10 : 0;
        const caloriesAvg = ana.caloriesData?.average || 0;
        setKpis({ sleepAvgH, sportAvgH, totalDays: Math.max(diffDays, 0), symptomsAvg, caloriesAvg });
      } catch {}

      // Load weight history from profile for the selected range
      try {
        const profile = await profileService.getProfile(user.id);
        const weights = (profile?.weights || [])
          .filter(w => w.date >= start && w.date <= end)
          .sort((a, b) => a.date.localeCompare(b.date));
        setWeightSeries({ labels: weights.map(w => w.date.slice(5)), values: weights.map(w => w.kg) });
      } catch {}
    };
    load();
  }, [user, selectedDate, selectedFilter, customStart, customEnd]);

  const InfoBubble = ({ id, title, description }: { id: string; title: string; description: string }) => (
    info[id] ? (
      <View style={[analyticsStyles.infoBubble, { top: 0, right: 0 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={[analyticsStyles.infoBubbleText, { fontWeight: '700' }]}>{title}</Text>
          <TouchableOpacity onPress={() => toggleInfo(id)}>
            <Ionicons name="close" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <Text style={analyticsStyles.infoBubbleText}>{description}</Text>
      </View>
    ) : null
  );

  const renderBarListPanel = (sectionTitle: string, innerTitle: string, labels: string[], values: number[], color: any, infoId?: string, infoText?: string) => (
    <View style={analyticsStyles.sectionCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={analyticsStyles.sectionTitleLarge}>{sectionTitle}</Text>
        {infoId && (
          <TouchableOpacity onPress={() => toggleInfo(infoId)}>
            <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      {infoId && infoText ? <InfoBubble id={infoId} title={sectionTitle} description={infoText} /> : null}
      <View style={analyticsStyles.innerPanel}>
        {innerTitle ? <Text style={analyticsStyles.innerPanelTitle}>{innerTitle}</Text> : null}
        {labels.map((lab, i) => (
          <View key={`${sectionTitle}-${lab}-${i}`} style={analyticsStyles.barListRow}>
            <Text style={analyticsStyles.barListLabel}>{lab}</Text>
            <View style={analyticsStyles.barListTrack}>
              <View style={[analyticsStyles.barListFill, color, { width: `${Math.round((values[i] || 0) / Math.max(...values, 1) * 100)}%` }]} />
            </View>
            <Text style={analyticsStyles.barListValue}>{values[i] || 0}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTwoLines = (labels: string[], a: number[], b: number[]) => (
    <View style={analyticsStyles.sectionCard}>
      <View style={analyticsStyles.sectionHeaderRow}>
        <Text style={analyticsStyles.sectionTitleLarge}>Symptoms Over Time by Period Status</Text>
        <TouchableOpacity onPress={() => toggleInfo('svs')}>
          <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
        </TouchableOpacity>
        <View style={{ position: 'absolute', top: 0, right: 0 }}>
          <InfoBubble id={'svs'} title={'Symptoms vs Period'} description={'Daily counts of symptoms split by status: red = with period, green = without period.'} />
        </View>
      </View>
      <View style={[analyticsStyles.innerPanel, { paddingTop: 16 }]}>        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 18, height: 3, backgroundColor: '#dc2626' }} />
            <Text style={{ fontWeight: '700', color: '#374151' }}>With period</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 24, height: 0, borderTopWidth: 3, borderStyle: 'dashed', borderColor: '#10b981' }} />
            <Text style={{ fontWeight: '700', color: '#374151' }}>Without period</Text>
          </View>
        </View>
        <View style={{ height: 280, width: '100%', marginBottom: 8 }}>
          <Svg height="280" width="100%">
            {(() => {
              const paddingLeft = 40;
              const paddingTop = 8;
              const chartWidth = 320;
              const chartHeight = 220;
              const maxY = Math.max(1, ...a, ...b);
              const stepX = chartWidth / Math.max(1, labels.length - 1);
              const axisY = `${paddingLeft},${paddingTop} ${paddingLeft},${paddingTop + chartHeight}`;
              const axisX = `${paddingLeft},${paddingTop + chartHeight} ${paddingLeft + chartWidth},${paddingTop + chartHeight}`;
              const tickStep = Math.max(1, Math.ceil(maxY / 4));
              const ticks = Array.from({ length: 4 }, (_, i) => (i + 1) * tickStep);
              const labelEvery = Math.max(1, Math.ceil(labels.length / 6));
              const toPoint = (val: number, idx: number) => `${paddingLeft + idx * stepX},${paddingTop + (chartHeight - (val / maxY) * (chartHeight - 10))}`;
              const makePoints = (arr: number[]) => arr.map((v, i) => toPoint(v || 0, i)).join(' ');
              const makeArea = (arr: number[]) => {
                if (labels.length === 0) return '';
                const pts = arr.map((v, i) => toPoint(v || 0, i)).join(' ');
                const lastX = paddingLeft + (labels.length - 1) * stepX;
                const baseline = `${lastX},${paddingTop + chartHeight} ${paddingLeft},${paddingTop + chartHeight}`;
                return `${pts} ${baseline}`;
              };
              const topIndices = (arr: number[], n: number) => (
                arr.map((v, i) => ({ v: v || 0, i })).sort((x, y) => y.v - x.v).slice(0, n).map(p => p.i)
              );
              const peaksA = topIndices(a, 3);
              const peaksB = topIndices(b, 3);
              return (
                <>
                  {/* axes */}
                  <Polyline points={axisY} fill="none" stroke="#9ca3af" strokeWidth="1" />
                  <Polyline points={axisX} fill="none" stroke="#9ca3af" strokeWidth="1" />
                  {/* Y ticks */}
                  {ticks.map((val, idx) => {
                    const y = paddingTop + (chartHeight - (val / maxY) * (chartHeight - 10));
                    return (
                      <React.Fragment key={`svs-tick-${idx}`}>
                        <Polyline points={`${paddingLeft - 4},${y} ${paddingLeft},${y}`} fill="none" stroke="#9ca3af" strokeWidth="1" />
                        <SvgText x={paddingLeft - 8} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end">{String(val)}</SvgText>
                      </React.Fragment>
                    );
                  })}
                  {/* X labels rotated */}
                  {labels.map((lab, i) => {
                    if (i % labelEvery !== 0 && i !== labels.length - 1) return null;
                    const x = paddingLeft + i * stepX;
                    const y = paddingTop + chartHeight + 18;
                    return <SvgText key={`svs-x-${i}`} x={x} y={y} fill="#6b7280" fontSize="9" textAnchor="end" transform={`rotate(-45, ${x}, ${y})`}>{lab}</SvgText>;
                  })}
                  {/* Filled areas */}
                  <Polyline points={makeArea(a)} fill="#dc262622" stroke="none" />
                  <Polyline points={makeArea(b)} fill="#10b98122" stroke="none" />
                  {/* Lines */}
                  <Polyline points={makePoints(a)} fill="none" stroke="#dc2626" strokeWidth="2" />
                  <Polyline points={makePoints(b)} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6,4" />
                  {/* Peak labels */}
                  {peaksA.map((idx) => {
                    const [xStr, yStr] = toPoint(a[idx] || 0, idx).split(',');
                    const x = parseFloat(xStr), y = parseFloat(yStr);
                    return <SvgText key={`peak-a-${idx}`} x={x} y={y - 8} fill="#dc2626" fontSize="10" fontWeight="700" textAnchor="middle">{String(a[idx] || 0)}</SvgText>;
                  })}
                  {peaksB.map((idx) => {
                    const [xStr, yStr] = toPoint(b[idx] || 0, idx).split(',');
                    const x = parseFloat(xStr), y = parseFloat(yStr);
                    return <SvgText key={`peak-b-${idx}`} x={x} y={y - 8} fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">{String(b[idx] || 0)}</SvgText>;
                  })}
                </>
              );
            })()}
          </Svg>
        </View>
        <Text style={[analyticsStyles.chartFooter, { fontWeight: '700' }]}>X: Time; Y: Symptoms count</Text>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <View style={analyticsStyles.filterContainer}>
      {(['Last 3 Days', 'Last Week', 'Last Month', 'Custom'] as FilterType[]).map(filter => (
        <TouchableOpacity
          key={filter}
          onPress={() => {
            if (filter === 'Custom') setShowCustom(true);
            setSelectedFilter(filter);
          }}
          style={[analyticsStyles.filterButton, selectedFilter === filter && analyticsStyles.filterButtonActive]}
        >
          <Text style={[analyticsStyles.filterButtonText, selectedFilter === filter ? analyticsStyles.filterButtonTextActive : analyticsStyles.filterButtonTextInactive]}>
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleGeneratePdf = async () => {
    if (!user) return;
    const { start, end } = selectedFilter === 'Custom' && customStart && customEnd
      ? { start: customStart, end: customEnd }
      : getRange(selectedFilter, selectedDate);
    await generateHealthReportPdf(user.id, start, end);
  };

  const renderCalendar = () => {
    const days = buildMonthMatrix(calendarMonth);
    const monthName = calendarMonth.toLocaleString('default', { month: 'long' });
    const year = calendarMonth.getFullYear();
    const isSelected = (d: Date) => !isNaN(d.getTime()) && (fmt(d) === customStart || fmt(d) === customEnd);
    const isInRange = (d: Date) => {
      if (isNaN(d.getTime())) return false;
      if (!customStart || !customEnd) return false;
      const s = customStart <= customEnd ? customStart : customEnd;
      const e = customStart <= customEnd ? customEnd : customStart;
      const f = fmt(d);
      return f >= s && f <= e;
    };
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={{ color: '#111827', fontWeight: '700' }}>{monthName} {year}</Text>
          <TouchableOpacity onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {['S','M','T','W','T','F','S'].map(d => (
            <Text key={d} style={{ width: `${100/7}%`, textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>{d}</Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((d, idx) => {
            const empty = isNaN(d.getTime());
            const sel = !empty && isSelected(d);
            const inRange = !empty && isInRange(d);
            return (
              <TouchableOpacity key={`d-${idx}`} disabled={empty} onPress={() => {
                const dayStr = fmt(d);
                if (!customStart || (customStart && customEnd)) {
                  // start a new range
                  setCustomStart(dayStr);
                  setCustomEnd('');
                } else if (customStart && !customEnd) {
                  // finish range; swap if needed
                  if (dayStr < customStart) { setCustomEnd(customStart); setCustomStart(dayStr); }
                  else setCustomEnd(dayStr);
                }
              }} style={{ width: `${100/7}%`, paddingVertical: 10, alignItems: 'center', backgroundColor: inRange ? '#ffe4e6' : 'transparent', borderRadius: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? '#ec4899' : 'transparent' }}>
                  <Text style={{ color: empty ? 'transparent' : sel ? 'white' : '#111827' }}>{empty ? '' : String(d.getDate())}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={analyticsStyles.container}>
      <ScrollView style={analyticsStyles.scrollContainer}>
        <View style={analyticsStyles.headerCard}>
          <Text style={analyticsStyles.headerTitle}>Health Analytics</Text>
          <Text style={analyticsStyles.headerSubtitle}>Insights into your health patterns</Text>
          {renderFilterButtons()}
          {selectedFilter === 'Custom' && customStart && customEnd && (
            <View style={{ alignSelf: 'flex-start', backgroundColor: '#ffe4e6', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginTop: -12, marginBottom: 8 }}>
              <Text style={{ color: '#9d174d', fontWeight: '700' }}>Custom period: {customStart} → {customEnd}</Text>
            </View>
          )}
          {/* KPI Overview */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <View style={{ flexGrow: 1, flexBasis: '48%', backgroundColor: '#eef2ff', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Avg Sleep</Text>
              <Text style={{ color: '#111827', fontWeight: '700', fontSize: 18 }}>{kpis.sleepAvgH} h</Text>
            </View>
            <View style={{ flexGrow: 1, flexBasis: '48%', backgroundColor: '#ecfeff', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Avg Sport (h)</Text>
              <Text style={{ color: '#111827', fontWeight: '700', fontSize: 18 }}>{kpis.sportAvgH > 0 ? kpis.sportAvgH : '—'}</Text>
            </View>
            <View style={{ flexGrow: 1, flexBasis: '48%', backgroundColor: '#fef3c7', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Avg Symptoms</Text>
              <Text style={{ color: '#111827', fontWeight: '700', fontSize: 18 }}>{kpis.symptomsAvg}</Text>
            </View>
            <View style={{ flexGrow: 1, flexBasis: '48%', backgroundColor: '#dcfce7', borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>Avg Calories</Text>
              <Text style={{ color: '#111827', fontWeight: '700', fontSize: 18 }}>{Math.round(kpis.caloriesAvg)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleGeneratePdf} style={{ backgroundColor: '#111827', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignSelf: 'flex-start', marginTop: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Cycle Prediction moved up */}
        {cyclePrediction && (
          <View style={analyticsStyles.sectionCard}>
            <View style={analyticsStyles.sectionHeaderRow}>
              <Text style={analyticsStyles.sectionTitleLarge}>Cycle Prediction</Text>
              <TouchableOpacity onPress={() => toggleInfo('cycle')}>
                <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <InfoBubble id={'cycle'} title={'Cycle Prediction'} description={'Estimations use your recorded period days and profile cycle length (supports continuous pill). Lateness compares last actual vs expected.'} />
            <View style={analyticsStyles.innerPanel}>
              
              <View style={{ gap: 8 }}>
                <View style={{ backgroundColor: '#374151', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Last Period: {cyclePrediction.lastPeriodDate || '-'}</Text>
                </View>
                <View style={{ backgroundColor: '#1e40af', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Next Period: {cyclePrediction.nextPeriodDate}</Text>
                </View>
                <View style={{ backgroundColor: '#6d28d9', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Next Ovulation: {cyclePrediction.nextOvulationDate}</Text>
                </View>
                <View style={{ backgroundColor: '#065f46', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Cycle: {cyclePrediction.cycleLengthDays} days</Text>
                </View>
                {typeof (cyclePrediction as any).latenessDays !== 'undefined' && (
                  <View style={{ backgroundColor: '#334155', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>Lateness: {(cyclePrediction as any).latenessDays} days</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Bloating (standalone section) */}
        <View style={analyticsStyles.sectionCard}>
          <View style={analyticsStyles.sectionHeaderRow}>
            <Text style={analyticsStyles.sectionTitleLarge}>Bloating</Text>
          </View>
          <View style={analyticsStyles.innerPanel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View>
                <Animated.Image
                  source={BLOATED_IMG}
                  style={{ width: 180, height: 180, borderRadius: 12, transform: [{ scale: bellyScale }] }}
                  resizeMode="cover"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: 16 }}>Bloated days</Text>
                <Text style={{ color: '#374151', marginBottom: 6 }}>{bloatingStats.daysWith} / {bloatingStats.totalDays}</Text>
                <View style={{ height: 10, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round((bloatingStats.daysWith / Math.max(1, bloatingStats.totalDays)) * 100)}%`, height: '100%', backgroundColor: '#fb7185' }} />
                </View>
                {(() => {
                  try {
                    const inRangeAll = (AnalyticsScreen as any)._allRecords as Array<{ date: string; symptoms?: string[] }> | undefined;
                    if (!inRangeAll) return null;
                    const only = inRangeAll.filter(r => (r.symptoms || []).some(s => /bloat/i.test(String(s))));
                    if (only.length < 2) return null;
                    const months = only.map(r => r.date.slice(0,7));
                    const unique = Array.from(new Set(months)).sort();
                    if (unique.length < 2) return null;
                    const gaps: number[] = [];
                    for (let i=1;i<unique.length;i++) {
                      const [y1,m1] = unique[i-1].split('-').map(Number);
                      const [y2,m2] = unique[i].split('-').map(Number);
                      gaps.push((y2 - y1) * 12 + (m2 - m1));
                    }
                    const avgGap = Math.round((gaps.reduce((a,b)=>a+b,0) / gaps.length));
                    const periodic = avgGap > 0 && avgGap <= 3;
                    return (
                      <Text style={{ marginTop: 8, color: '#374151' }}>Periodic: {periodic ? 'Yes' : 'No'}{periodic ? ` — each ${avgGap} month(s)` : ''}</Text>
                    );
                  } catch { return null; }
                })()}
              </View>
            </View>
          </View>
        </View>

        {/* Digestive Issues Days Trend */}
        <View style={analyticsStyles.sectionCard}>
          <View style={analyticsStyles.sectionHeaderRow}>
            <Text style={analyticsStyles.sectionTitleLarge}>Digestive Issues Trend</Text>
            <TouchableOpacity onPress={() => toggleInfo('dig')}>
              <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
            </TouchableOpacity>
            <View style={{ position: 'absolute', top: 0, right: 0 }}>
              <InfoBubble id={'dig'} title={'Digestive Issues Trend'} description={'Counts of digestive-related symptoms: bloating, gas, stomach pain, constipation, diarrhea, cramps, reflux, heartburn.'} />
            </View>
          </View>
          <View style={analyticsStyles.innerPanel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, backgroundColor: '#8b5cf6', borderRadius: 2 }} />
                <Text style={{ fontWeight: '700', color: '#374151' }}>Digestive issues</Text>
              </View>
            </View>
            {(() => {
              const labels = digestiveTrend.labels;
              const values = digestiveTrend.values;
              const paddingLeft = 40;
              const paddingTop = 8;
              const chartWidth = 320;
              const chartHeight = 220;
              const maxY = Math.max(3, ...values, 1);
              const stepX = chartWidth / Math.max(1, labels.length);
              const axisY = `${paddingLeft},${paddingTop} ${paddingLeft},${paddingTop + chartHeight}`;
              const axisX = `${paddingLeft},${paddingTop + chartHeight} ${paddingLeft + chartWidth},${paddingTop + chartHeight}`;
              const maxTicks = Math.min(10, Math.max(3, Math.ceil(maxY)));
              const ticks = Array.from({ length: maxTicks }, (_, i) => i + 1);
              const labelEvery = Math.max(1, Math.ceil(labels.length / 6));
              const barGap = 4;
              const barWidth = Math.min(18, Math.max(4, stepX - barGap));
              return (
                <View style={{ height: 280, width: '100%' }}>
                  <Svg height="280" width="100%">
                    <Polyline points={axisY} fill="none" stroke="#9ca3af" strokeWidth="1" />
                    <Polyline points={axisX} fill="none" stroke="#9ca3af" strokeWidth="1" />
                    {ticks.map((val, idx) => {
                      const y = paddingTop + (chartHeight - (val / maxY) * (chartHeight - 10));
                      return (
                        <React.Fragment key={`dig-tick-${idx}`}>
                          <Polyline points={`${paddingLeft - 4},${y} ${paddingLeft},${y}`} fill="none" stroke="#9ca3af" strokeWidth="1" />
                          <SvgText x={paddingLeft - 8} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end">{String(val)}</SvgText>
                        </React.Fragment>
                      );
                    })}
                    {/* Bars in purple */}
                    {values.map((v, i) => {
                      const x = paddingLeft + i * stepX + barGap / 2;
                      const h = (v / maxY) * (chartHeight - 10);
                      const y = paddingTop + (chartHeight - h);
                      return <Rect key={`bar-${i}`} x={x} y={y} width={barWidth} height={Math.max(0.5, h)} fill="#8b5cf6" rx={2} />;
                    })}
                    {/* X labels rotated */}
                    {labels.map((lab, i) => {
                      if (i % labelEvery !== 0 && i !== labels.length - 1) return null;
                      const x = paddingLeft + i * stepX + barWidth / 2;
                      const y = paddingTop + chartHeight + 18;
                      return <SvgText key={`dig-x-${i}`} x={x} y={y} fill="#6b7280" fontSize="9" textAnchor="end" transform={`rotate(-45, ${x}, ${y})`}>{lab}</SvgText>;
                    })}
                  </Svg>
                </View>
              );
            })()}
            <Text style={[analyticsStyles.chartFooter, { fontWeight: '700' }]}>X: Time; Y: Number of symptoms</Text>
          </View>
        </View>

        {/* Food Correlation Analysis */}
        <View style={analyticsStyles.sectionCard}>
          <View style={analyticsStyles.sectionHeaderRow}>
            <Text style={analyticsStyles.sectionTitleLarge}>Food Correlation Analysis</Text>
            <TouchableOpacity onPress={() => toggleInfo('fdc')}>
              <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={analyticsStyles.tableContainer}>
            <View style={analyticsStyles.table}>
              <View style={analyticsStyles.tableHeader}>
                <Text style={analyticsStyles.tableHeaderText}>Food</Text>
                <Text style={analyticsStyles.tableHeaderText}>Correlation</Text>
              </View>
              {foodDigestiveCorrelation.slice(0, (AnalyticsScreen as any)._fdcExpanded ? 10 : 6).map((row, index) => (
                <View key={`fdc-${row.name}-${index}`} style={[analyticsStyles.tableRow, index % 2 === 0 ? analyticsStyles.tableRowEven : analyticsStyles.tableRowOdd]}>
                  <Text style={analyticsStyles.tableCell}>{row.name}</Text>
                  <Text style={analyticsStyles.tableCell}>{row.correlationPct}%</Text>
                </View>
              ))}
            </View>
            {foodDigestiveCorrelation.length > 6 && (
              <TouchableOpacity onPress={() => { (AnalyticsScreen as any)._fdcExpanded = !(AnalyticsScreen as any)._fdcExpanded; forceUpdate(x => x + 1); }} style={{ alignSelf: 'center', marginTop: 8, backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: '#374151', fontWeight: '700' }}>{(AnalyticsScreen as any)._fdcExpanded ? 'Show less' : 'Load more'}</Text>
              </TouchableOpacity>
            )}
            {(() => {
              const details = (AnalyticsScreen as any)._foodSymptomDetails as Record<string, Array<{ name: string; count: number }>> | undefined;
              if (!details) return null;
              const top = foodDigestiveCorrelation[0];
              if (!top) return null;
              const sym = (details[top.name] || []).slice(0, 2);
              const phr = sym.map(s => `${s.name} (${s.count})`).join(', ');
              return (
                <Text style={[analyticsStyles.chartFooter, { marginTop: 8 }]}>When you eat {top.name}, you often report: {phr}. Approx. {top.correlationPct}% chance of digestive issues.</Text>
              );
            })()}
          </View>
        </View>

        {/* Symptoms vs Period after Food Correlation */}
        {renderTwoLines(periodSeries.labels, periodSeries.withPeriod, periodSeries.withoutPeriod)}

        {/* Symptom Recurrence after Symptoms vs Period */}
        {renderBarListPanel('Most Frequent Symptoms', '', topSymptoms.map(s => s.name), topSymptoms.map(s => s.count), analyticsStyles.chartBarPink, 'sra', 'Top symptoms by number of days they were reported within the selected period.')}

        {/* Calories Over Time (placed before Bilan) */}
        <View style={analyticsStyles.sectionCard}>
          <View style={analyticsStyles.sectionHeaderRow}>
            <Text style={analyticsStyles.sectionTitleLarge}>Calories Over Time</Text>
            <TouchableOpacity onPress={() => toggleInfo('cal')}>
              <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={analyticsStyles.innerPanel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 18, height: 3, backgroundColor: '#f59e0b' }} />
                <Text style={{ fontWeight: '700', color: '#374151' }}>Calories</Text>
              </View>
            </View>
            {(() => {
              const labels = caloriesGrouped.labels;
              const values = caloriesGrouped.values;
              const paddingLeft = 40;
              const paddingTop = 8;
              const chartWidth = 320;
              const chartHeight = 220;
              const maxY = Math.max(1, ...values);
              const stepX = chartWidth / Math.max(1, labels.length - 1);
              const toPoint = (val: number, idx: number) => `${paddingLeft + idx * stepX},${paddingTop + (chartHeight - (val / maxY) * (chartHeight - 10))}`;
              const makePoints = (arr: number[]) => arr.map((v, i) => toPoint(v || 0, i)).join(' ');
              const makeArea = (arr: number[]) => {
                const pts = arr.map((v, i) => toPoint(v || 0, i)).join(' ');
                const lastX = paddingLeft + (arr.length - 1) * stepX;
                const baseline = `${lastX},${paddingTop + chartHeight} ${paddingLeft},${paddingTop + chartHeight}`;
                return `${pts} ${baseline}`;
              };
              const axisY = `${paddingLeft},${paddingTop} ${paddingLeft},${paddingTop + chartHeight}`;
              const axisX = `${paddingLeft},${paddingTop + chartHeight} ${paddingLeft + chartWidth},${paddingTop + chartHeight}`;
              const tickStep = Math.max(1, Math.ceil(maxY / 4));
              const ticks = Array.from({ length: 4 }, (_, i) => (i + 1) * tickStep);
              const labelEvery = Math.max(1, Math.ceil(labels.length / 6));
              const topIndices = values.map((v, i) => ({ v: v || 0, i })).sort((a, b) => b.v - a.v).slice(0, 3).map(p => p.i);
              return (
                <View style={{ height: 280, width: '100%' }}>
                  <Svg height="280" width="100%">
                    <Polyline points={axisY} fill="none" stroke="#9ca3af" strokeWidth="1" />
                    <Polyline points={axisX} fill="none" stroke="#9ca3af" strokeWidth="1" />
                    {ticks.map((val, idx) => {
                      const y = paddingTop + (chartHeight - (val / maxY) * (chartHeight - 10));
                      return (
                        <React.Fragment key={`cal2-tick-${idx}`}>
                          <Polyline points={`${paddingLeft - 4},${y} ${paddingLeft},${y}`} fill="none" stroke="#9ca3af" strokeWidth="1" />
                          <SvgText x={paddingLeft - 8} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end">{String(val)}</SvgText>
                        </React.Fragment>
                      );
                    })}
                    {labels.map((lab, i) => {
                      if (i % labelEvery !== 0 && i !== labels.length - 1) return null;
                      const x = paddingLeft + i * stepX;
                      const y = paddingTop + chartHeight + 18;
                      return <SvgText key={`cal2-x-${i}`} x={x} y={y} fill="#6b7280" fontSize="9" textAnchor="end" transform={`rotate(-45, ${x}, ${y})`}>{lab}</SvgText>;
                    })}
                    <Polyline points={makeArea(values)} fill="#f59e0b22" stroke="none" />
                    <Polyline points={makePoints(values)} fill="none" stroke="#f59e0b" strokeWidth="2" />
                    {topIndices.map((idx) => {
                      const [xStr, yStr] = toPoint(values[idx] || 0, idx).split(',');
                      const x = parseFloat(xStr), y = parseFloat(yStr);
                      return <SvgText key={`cal2-peak-${idx}`} x={x} y={y - 8} fill="#b45309" fontSize="10" fontWeight="700" textAnchor="middle">{String(values[idx] || 0)}</SvgText>;
                    })}
                    {/* annotate biggest rise and drop */}
                    {(() => {
                      if (values.length < 2) return null as any;
                      const deltas = values.slice(1).map((v,i)=>({i,i1:i,i2:i+1, d:(v - (values[i]||0))}));
                      const rise = deltas.reduce((a,b)=> b.d>a.d?b:a, {i:0,i1:0,i2:1,d:-Infinity});
                      const drop = deltas.reduce((a,b)=> b.d<a.d?b:a, {i:0,i1:0,i2:1,d:Infinity});
                      const [x1r,y1r]=toPoint(values[rise.i1]||0,rise.i1).split(',');
                      const [x2r,y2r]=toPoint(values[rise.i2]||0,rise.i2).split(',');
                      const [x1d,y1d]=toPoint(values[drop.i1]||0,drop.i1).split(',');
                      const [x2d,y2d]=toPoint(values[drop.i2]||0,drop.i2).split(',');
                      return (
                        <>
                          <Polyline points={`${x1r},${y1r} ${x2r},${y2r}`} fill="none" stroke="#065f46" strokeWidth="2" />
                          <SvgText x={(parseFloat(x2r)+4)} y={(parseFloat(y2r)-6)} fill="#065f46" fontSize="10" fontWeight="700">+{Math.round(rise.d)}</SvgText>
                          <Polyline points={`${x1d},${y1d} ${x2d},${y2d}`} fill="none" stroke="#991b1b" strokeWidth="2" />
                          <SvgText x={(parseFloat(x2d)+4)} y={(parseFloat(y2d)+12)} fill="#991b1b" fontSize="10" fontWeight="700">{Math.round(drop.d)}</SvgText>
                        </>
                      );
                    })()}
                  </Svg>
                </View>
              );
            })()}
            <Text style={[analyticsStyles.chartFooter, { fontWeight: '700' }]}>X: Time; Y: Calories</Text>
          </View>
        </View>

        {/* Weight Over Time (weekly entries) placed after Calories */}
        {weightSeries.values.length > 0 && (
          <View style={analyticsStyles.sectionCard}>
            <View style={analyticsStyles.sectionHeaderRow}>
              <Text style={analyticsStyles.sectionTitleLarge}>Weight Over Time</Text>
              <TouchableOpacity onPress={() => toggleInfo('wgt')}>
                <Ionicons name="information-circle-outline" size={22} color="#6b7280" />
              </TouchableOpacity>
              <View style={{ position: 'absolute', top: 0, right: 0 }}>
                <InfoBubble id={'wgt'} title={'Weight Over Time'} description={'Weekly weights you logged in Home.'} />
              </View>
            </View>
            <View style={analyticsStyles.innerPanel}>
              {(() => {
                const labels = weightSeries.labels;
                const values = weightSeries.values;
                const paddingLeft = 44;
                const paddingTop = 8;
                const chartWidth = 320;
                const chartHeight = 220;
                const minY = Math.min(...values);
                const maxY = Math.max(...values);
                const span = Math.max(1, maxY - minY);
                const topY = maxY + span * 0.1;
                const bottomY = Math.max(0, minY - span * 0.1);
                const stepX = chartWidth / Math.max(1, labels.length - 1);
                const toPoint = (val: number, idx: number) => {
                  const norm = (val - bottomY) / Math.max(1e-6, (topY - bottomY));
                  return `${paddingLeft + idx * stepX},${paddingTop + (chartHeight - norm * (chartHeight - 10))}`;
                };
                const makePoints = (arr: number[]) => arr.map((v, i) => toPoint(v || 0, i)).join(' ');
                const axisY = `${paddingLeft},${paddingTop} ${paddingLeft},${paddingTop + chartHeight}`;
                const axisX = `${paddingLeft},${paddingTop + chartHeight} ${paddingLeft + chartWidth},${paddingTop + chartHeight}`;
                const labelEvery = Math.max(1, Math.ceil(labels.length / 6));
                const peaks = values.map((v, i) => ({ v, i })).sort((a,b)=>b.v-a.v).slice(0,2).map(p=>p.i);
                return (
                  <View style={{ height: 280, width: '100%' }}>
                    <Svg height="280" width="100%">
                      <Polyline points={axisY} fill="none" stroke="#9ca3af" strokeWidth="1" />
                      <Polyline points={axisX} fill="none" stroke="#9ca3af" strokeWidth="1" />
                      {/* Y ticks every 2 kg */}
                      {(() => {
                        const start = Math.floor(bottomY / 2) * 2;
                        const end = Math.ceil(topY / 2) * 2;
                        const ticks: number[] = [];
                        for (let k = start; k <= end; k += 2) ticks.push(k);
                        return ticks.map((val, idx) => {
                          const norm = (val - bottomY) / Math.max(1e-6, (topY - bottomY));
                          const y = paddingTop + (chartHeight - norm * (chartHeight - 10));
                          return (
                            <React.Fragment key={`wgt-tick-${idx}`}>
                              <Polyline points={`${paddingLeft - 4},${y} ${paddingLeft},${y}`} fill="none" stroke="#9ca3af" strokeWidth="1" />
                              <SvgText x={paddingLeft - 8} y={y + 4} fill="#9ca3af" fontSize="10" textAnchor="end">{String(val)}</SvgText>
                            </React.Fragment>
                          );
                        });
                      })()}
                      {/* X labels */}
                      {labels.map((lab, i) => {
                        if (i % labelEvery !== 0 && i !== labels.length - 1) return null;
                        const x = paddingLeft + i * stepX;
                        const y = paddingTop + chartHeight + 18;
                        return <SvgText key={`w-x-${i}`} x={x} y={y} fill="#6b7280" fontSize="9" textAnchor="end" transform={`rotate(-45, ${x}, ${y})`}>{lab}</SvgText>;
                      })}
                      {/* Area + line */}
                      <Polyline points={`${makePoints(values)} ${paddingLeft + (labels.length - 1) * stepX},${paddingTop + chartHeight} ${paddingLeft},${paddingTop + chartHeight}`} fill="#60a5fa22" stroke="none" />
                      <Polyline points={makePoints(values)} fill="none" stroke="#3b82f6" strokeWidth="2" />
                      {/* Peak labels */}
                      {peaks.map((idx)=>{
                        const [xStr,yStr]=toPoint(values[idx]||0,idx).split(',');
                        const x=parseFloat(xStr), y=parseFloat(yStr);
                        return <SvgText key={`w-p-${idx}`} x={x} y={y-8} fill="#1d4ed8" fontSize="10" fontWeight="700" textAnchor="middle">{String(values[idx])} kg</SvgText>;
                      })}
                    </Svg>
                  </View>
                );
              })()}
              <Text style={[analyticsStyles.chartFooter, { fontWeight: '700' }]}>X: Time; Y: Weight (kg)</Text>
            </View>
          </View>
        )}

        {/* Bilan (post-it recap) */}
        <View style={[analyticsStyles.sectionCard, { borderColor: 'transparent' }]}> 
          <View style={{ alignItems: 'flex-start' }}>
            {(() => {
              const r = (selectedFilter === 'Custom' && customStart && customEnd)
                ? { start: customStart, end: customEnd }
                : getRange(selectedFilter, selectedDate);
              return (
                <View style={{ backgroundColor: '#ffe4e6', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 8, padding: 12, transform: [{ rotate: '-0.8deg'}], shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 3, maxWidth: '100%' }}>
                  <View style={{ backgroundColor: '#fecdd3', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 }}>
                    <Text style={{ color: '#9d174d', fontWeight: '700' }}>Bilan — {r.start} → {r.end}</Text>
                  </View>
                  {insights.map((it, idx) => (
                    <View key={`ins-${idx}`} style={{ marginBottom: 6 }}>
                      <Text style={{ fontWeight: '700', color: '#111827' }}>{it.title}</Text>
                      <Text style={{ color: '#111827' }}>{it.text}</Text>
                    </View>
                  ))}
                  {insights.length === 0 && (
                    <Text style={{ color: '#111827' }}>Insights will appear once you have enough data in the selected period.</Text>
                  )}
                </View>
              );
            })()}
          </View>
        </View>

      </ScrollView>
      <Modal visible={showCustom} transparent onRequestClose={() => setShowCustom(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, width: '100%', padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>Custom Range</Text>
            {renderCalendar()}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
              <TouchableOpacity onPress={() => setShowCustom(false)} style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#374151', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (customStart && customEnd) setShowCustom(false); }} style={{ flex: 1, backgroundColor: '#111827', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 