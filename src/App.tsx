import React, { useState, useMemo, useEffect } from 'react';
import { Home, Calendar, BarChart3, Trophy, FileText, Camera } from 'lucide-react';
import NavButton from './components/NavButton';
import HomePage from './pages/HomePage';
import CharacterCustomization from './pages/CharacterCustomization';
import TrackingPage from './pages/TrackingPage';
import SymptomsPage from './pages/SymptomsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RewardsPage from './pages/RewardsPage';
import ReportsPage from './pages/ReportsPage';
import CyclePage from './pages/CyclePage';
import SleepPage from './pages/SleepPage';
import SportPage from './pages/SportPage';
import DigestionPage from './pages/DigestionPage';
import { Character, MealData, GlobalState } from './types/character';
import ProgressBar from './components/ProgressBar';
import DateSticker from './components/DateSticker';
import { Task } from './components/TodoPostIt';
import { getDailyRecord, updateDailyRecord, getDateKey, loadCharacter, saveCharacter } from './utils/storage';

type SportData = {
  activities: string[];
  durations: Record<string, number>;
};

const defaultCharacter: Character = {
  skinTone: '#F4C2A1',
  hairColor: '#8B4513',
  hairStyle: 'long',
  eyeColor: '#4A4A4A',
  topColor: '#FF8C42',
  bottomColor: '#B084CC',
  shoeColor: '#333333',
  eyebrowColor: '#000000',
  accessory: 'none',
  expression: 'happy',
  level: 3,
  endolots: 6, // Initial endolots from tracking streak
};

const defaultMealData: MealData = {
  morning: '',
  afternoon: '',
  evening: '',
  snack: '',
  drinkType: '',
  drinkQuantities: {},
};

const defaultGlobalState: GlobalState = {
  currentPage: 'home',
  customizationStep: 0,
  character: defaultCharacter,
  dailyProgress: 0,
  streak: 7,
  selectedSymptoms: [],
  mealData: defaultMealData,
  selectedDate: new Date(),
  bellyPhotos: {},
  sleepHours: null,
  sportData: null,
  sameSleepRoutine: false,
  sameSportRoutine: false,
  hasPeriod: '',
  sleepSaved: false,
  mealsSaved: false,
  sportSaved: false,
  cycleSaved: false,
  symptomsSaved: false,
  selectedFilter: 'Last 3 Days', // default filter
};

const App = () => {
  const [globalState, setGlobalState] = useState<GlobalState>(defaultGlobalState);

  // Method to update the selected filter
  const setSelectedFilter = (filter: GlobalState['selectedFilter']) => {
    setGlobalState((prevState) => ({ ...prevState, selectedFilter: filter }));
  };

  useEffect(() => {
    let done = 0;
    if (!!globalState.sleepSaved && (globalState.sleepHours !== null || globalState.sameSleepRoutine)) done++;
    const hasLunch = !!globalState.mealData.afternoon;
    const hasDinner = !!globalState.mealData.evening;
    if (!!globalState.mealsSaved && hasLunch && hasDinner) done++;
    if (!!globalState.sportSaved && ((globalState.sportData?.activities?.length ?? 0) > 0 || globalState.sameSportRoutine)) done++;
    if (!!globalState.cycleSaved && globalState.hasPeriod) done++;
    if (!!globalState.symptomsSaved && globalState.selectedSymptoms.length) done++;
    const newProgress = done * 20;
    if (newProgress !== globalState.dailyProgress) {
      setGlobalState((prevState) => ({ ...prevState, dailyProgress: newProgress }));
      updateDailyRecord(globalState.selectedDate, { progress: newProgress });
    }
  }, [
    globalState.sleepSaved, globalState.sleepHours, globalState.sameSleepRoutine,
    globalState.mealsSaved, globalState.mealData,
    globalState.sportSaved, globalState.sportData, globalState.sameSportRoutine,
    globalState.cycleSaved, globalState.hasPeriod,
    globalState.symptomsSaved, globalState.selectedSymptoms
  ]);

  useEffect(() => {
    const rec = getDailyRecord(globalState.selectedDate);
    setGlobalState(prev => ({
      ...prev,
      mealData: rec.meals,
      selectedSymptoms: rec.symptoms,
      sleepHours: rec.sleepHours,
      sameSleepRoutine: rec.sameSleepRoutine,
      sportData: rec.sportData,
      sameSportRoutine: rec.sameSportRoutine,
      hasPeriod: rec.hasPeriod,
      sleepSaved: rec.sleepSaved,
      mealsSaved: rec.mealsSaved,
      sportSaved: rec.sportSaved,
      cycleSaved: rec.cycleSaved,
      symptomsSaved: rec.symptomsSaved,
    }));
    // dailyProgress will recalc via other effect
  }, [globalState.selectedDate]);

  // Load character from localStorage on app startup
  useEffect(() => {
    const savedCharacter = loadCharacter();
    if (savedCharacter) {
      setGlobalState(prev => ({
        ...prev,
        character: { ...defaultCharacter, ...savedCharacter }
      }));
    }
  }, []); // Run only once on startup

  // Listen to record updates from pages to refresh flags/state immediately
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.date === getDateKey(globalState.selectedDate)) {
        const rec = getDailyRecord(globalState.selectedDate);
        setGlobalState(prev => ({
          ...prev,
          mealData: rec.meals,
          selectedSymptoms: rec.symptoms,
          sleepHours: rec.sleepHours,
          sameSleepRoutine: rec.sameSleepRoutine,
          sportData: rec.sportData,
          sameSportRoutine: rec.sameSportRoutine,
          hasPeriod: rec.hasPeriod,
          sleepSaved: rec.sleepSaved,
          mealsSaved: rec.mealsSaved,
          sportSaved: rec.sportSaved,
          cycleSaved: rec.cycleSaved,
          symptomsSaved: rec.symptomsSaved,
        }));
      }
    };
    window.addEventListener('recordUpdated', handler);
    return () => window.removeEventListener('recordUpdated', handler);
  }, [globalState.selectedDate]);

  const renderPage = () => {
    const tasks: Task[] = [
      { key: 'sleep', label: 'Sleep', completed: !!globalState.sleepSaved && (globalState.sleepHours !== null || globalState.sameSleepRoutine) },
      { key: 'meals', label: 'Meals', completed: !!globalState.mealsSaved && Boolean(globalState.mealData.afternoon && globalState.mealData.evening) },
      { key: 'sport', label: 'Sport', completed: !!globalState.sportSaved && ((globalState.sportData?.activities?.length ?? 0) > 0 || globalState.sameSportRoutine) },
      { key: 'cycle', label: 'Cycle', completed: !!globalState.cycleSaved && globalState.hasPeriod !== '' },
      { key: 'symptoms', label: 'Symptoms', completed: !!globalState.symptomsSaved && globalState.selectedSymptoms.length > 0 },
    ];

    switch (globalState.currentPage) {
      case 'home':
        return (
          <HomePage
            character={globalState.character}
            streak={globalState.streak}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            setCustomizationStep={(step) => setGlobalState((prevState) => ({ ...prevState, customizationStep: step }))}
            selectedDate={globalState.selectedDate}
            setSelectedDate={(date) => setGlobalState((prevState) => ({ ...prevState, selectedDate: date }))}
            tasks={tasks}
          />
        );
      case 'customize':
        return (
          <CharacterCustomization
            character={globalState.character}
            setCharacter={(character) => setGlobalState((prevState) => ({ ...prevState, character }))}
            currentStep={globalState.customizationStep}
            setCurrentStep={(step) => setGlobalState((prevState) => ({ ...prevState, customizationStep: step }))}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
          />
        );
      case 'track':
        return (
          <TrackingPage
            dailyProgress={globalState.dailyProgress}
            setDailyProgress={(progress) => setGlobalState((prevState) => ({ ...prevState, dailyProgress: progress }))}
            mealData={globalState.mealData}
            setMealData={(update) => setGlobalState(prevState => {
              const newMealData =
                typeof update === 'function'
                  ? update(prevState.mealData)
                  : { ...prevState.mealData, ...update };
              return { ...prevState, mealData: newMealData };
            })}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            selectedDate={globalState.selectedDate}
            hideTabs={[]}
          />
        );
      case 'symptoms':
        return (
          <SymptomsPage
            selectedSymptoms={globalState.selectedSymptoms}
            setSelectedSymptoms={(symptoms) => setGlobalState((prevState) => ({ ...prevState, selectedSymptoms: symptoms }))}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            streak={globalState.streak}
            setStreak={(streak) => setGlobalState((prevState) => ({ ...prevState, streak }))}
            selectedDate={globalState.selectedDate}
          />
        );
      case 'cycle':
        return (
          <CyclePage
            selectedDate={globalState.selectedDate}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            hasPeriod={globalState.hasPeriod}
            setHasPeriod={(period) => setGlobalState((prevState) => ({ ...prevState, hasPeriod: period }))}
          />
        );
      case 'analytics':
        return <AnalyticsPage streak={globalState.streak} selectedFilter={globalState.selectedFilter} setSelectedFilter={setSelectedFilter} />;
      case 'rewards':
        return <RewardsPage character={globalState.character} streak={globalState.streak} setCharacter={(character) => setGlobalState((prevState) => ({ ...prevState, character }))} />;
      case 'reports':
        return <ReportsPage />;
      case 'sleep':
        return (
          <SleepPage
            selectedDate={globalState.selectedDate}
            sleepHours={globalState.sleepHours}
            setSleepHours={(hours) => setGlobalState((prevState) => ({ ...prevState, sleepHours: hours }))}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            sameSleepRoutine={globalState.sameSleepRoutine}
            setSameSleepRoutine={(routine) => setGlobalState((prevState) => ({ ...prevState, sameSleepRoutine: routine }))}
          />
        );
      case 'sport':
        return (
          <SportPage
            selectedDate={globalState.selectedDate}
            sportData={globalState.sportData}
            setSportData={(data) => setGlobalState((prevState) => ({ ...prevState, sportData: data }))}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            sameSportRoutine={globalState.sameSportRoutine}
            setSameSportRoutine={(routine) => setGlobalState((prevState) => ({ ...prevState, sameSportRoutine: routine }))}
          />
        );
      case 'digestion':
        return <DigestionPage selectedDate={globalState.selectedDate} setSelectedDate={(date) => setGlobalState((prevState) => ({ ...prevState, selectedDate: date }))} photos={globalState.bellyPhotos} setPhotos={(update) => setGlobalState(prevState => {
  const newBellyPhotos = typeof update === 'function' ? update(prevState.bellyPhotos) : update;
  return { ...prevState, bellyPhotos: newBellyPhotos };
})} />;
      default:
        return (
          <HomePage
            character={globalState.character}
            streak={globalState.streak}
            setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))}
            setCustomizationStep={(step) => setGlobalState((prevState) => ({ ...prevState, customizationStep: step }))}
            selectedDate={globalState.selectedDate}
            setSelectedDate={(date) => setGlobalState((prevState) => ({ ...prevState, selectedDate: date }))}
            tasks={tasks}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl p-6 border-r border-orange-100">
        <div className="mb-8">
          <span className="ml-2 text-5xl font-lotus text-gray-900">Lotus</span>
        </div>
        <nav className="space-y-2">
          <NavButton icon={Home} label="Home" page="home" currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} />
          <NavButton icon={Calendar} label="Track" page="track" activePages={['track','sleep','sport','cycle','symptoms']} currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} />
          <NavButton icon={Camera} label="Digestion" page="digestion" currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} />
          <NavButton icon={BarChart3} label="Analytics" page="analytics" currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} />
          <NavButton icon={Trophy} label="Rewards" page="rewards" currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} count="3" />
          <NavButton icon={FileText} label="Reports" page="reports" currentPage={globalState.currentPage} setCurrentPage={(page) => setGlobalState((prevState) => ({ ...prevState, currentPage: page }))} />
        </nav>
        {/* streak card */}
        <div className="mt-8 bg-gray-100 rounded-2xl p-4 border border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="text-white" size={32} />
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900 text-lg">Streak: {globalState.streak} days</div>
            <div className="text-gray-600 text-sm">Keep it up!</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Global progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="sr-only">Daily Progress</h2>
              <span className={`text-sm font-semibold ${globalState.dailyProgress === 0 ? 'text-red-500' : 'text-green-600'}`}>{globalState.dailyProgress}% complete</span>
            </div>
            <ProgressBar value={globalState.dailyProgress} />
          </div>

          {/* Date sticker for tracking tabs */}
          {['track', 'sleep', 'sport', 'cycle', 'symptoms'].includes(globalState.currentPage) && (
            <div className="flex justify-end mb-4">
              <DateSticker
                date={globalState.selectedDate}
                onPrev={() => setGlobalState(prev => ({ ...prev, selectedDate: new Date(prev.selectedDate.getTime() - 86400000) }))}
                onNext={() => {
                  const today = new Date(new Date().toDateString());
                  if (globalState.selectedDate < today) {
                    setGlobalState(prev => ({ ...prev, selectedDate: new Date(prev.selectedDate.getTime() + 86400000) }));
                  }
                }}
                disableNext={globalState.selectedDate >= new Date(new Date().toDateString())}
              />
            </div>
          )}

          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;
