import React from 'react';
import TodoPostIt, { Task } from '../components/TodoPostIt';
import DetailedCharacter from '../components/DetailedCharacter';
import { Character } from '../types/character';
import { Activity, Moon, Utensils, TrendingUp, Camera } from 'lucide-react';
import CalendarGrid from '../components/CalendarGrid';
import { loadRecords } from '../utils/storage';

interface HomePageProps {
  character: Character;
  streak: number;
  setCurrentPage: (page: string) => void;
  setCustomizationStep: (step: number) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  tasks: Task[];
  onQuickSleep?: ()=>void;
  onQuickSport?: ()=>void;
  sameSleepRoutine?: boolean;
  sameSportRoutine?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ 
  character, 
  streak, 
  setCurrentPage, 
  setCustomizationStep, 
  selectedDate, 
  setSelectedDate, 
  tasks,
  onQuickSleep,
  onQuickSport,
  sameSleepRoutine,
  sameSportRoutine
}) => {
  const records = loadRecords();
  const completeKeys = Object.entries(records)
    .filter(([, rec]) => rec.progress === 100)
    .map(([key]) => key);

  return (
  <div className="space-y-6">
    {/* Title */}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100/50">
      <h1 className="text-4xl font-lotus text-gray-900 mb-2 tracking-wide">
        Welcome to Lotus
      </h1>
      <p className="text-gray-600">Your modern health tracking companion</p>
    </div>

    {/* Quick Actions */}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100/50">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="text-orange-500" size={20} />
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setCurrentPage('track')}
          className="bg-green-100 hover:bg-green-200 text-green-700 p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
        >
          <Utensils size={24} />
          <span className="font-medium text-sm">Log Meals</span>
        </button>
        <button 
          onClick={() => setCurrentPage('sleep')}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
        >
          <Moon size={24} />
          <span className="font-medium text-sm">Log Sleep</span>
        </button>
        <button 
          onClick={() => setCurrentPage('digestion')}
          className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
        >
          <Camera size={24} />
          <span className="font-medium text-sm">Body Photos</span>
        </button>
        <button 
          onClick={() => setCurrentPage('analytics')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2"
        >
          <TrendingUp size={24} />
          <span className="font-medium text-sm">View Analytics</span>
        </button>
      </div>
    </div>

    {/* Calendar + Post-it */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100/50">
        <CalendarGrid selectedDate={selectedDate} onSelectDate={setSelectedDate} markedDates={completeKeys} />
        <div className="text-sm font-semibold text-center mt-2 text-red-600">
          Selected: {selectedDate.toLocaleDateString()}
        </div>
      </div>
      
      {/* Todo Post-it + Endolots */}
      <div className="space-y-4">
        <TodoPostIt tasks={tasks} key={selectedDate.toLocaleDateString('sv-SE')} />
        
        {/* Endolots Display */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Your Endolots</h4>
              <p className="text-xs text-gray-600">Earn more by tracking daily!</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-2xl font-bold text-yellow-700">{character.endolots || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Character Section */}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100/50 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <DetailedCharacter character={character} size={400} />
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Your Lotus Companion</h3>
            <p className="text-gray-600 text-sm">Customize and grow together!</p>
          </div>
          <button 
            onClick={() => {
              setCurrentPage('customize');
              setCustomizationStep(0);
            }}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all"
          >
            Customize Your Lotus
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 