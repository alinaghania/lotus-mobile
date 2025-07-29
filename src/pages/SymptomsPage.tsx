import React from 'react';
import { Heart, Check } from 'lucide-react';
import { updateDailyRecord } from '../utils/storage';

interface SymptomsPageProps {
  selectedDate: Date;
  selectedSymptoms: string[];
  setSelectedSymptoms: (s: string[]) => void;
  setCurrentPage: (page: string) => void;
  streak: number;
  setStreak: (n: number) => void;
}

const SymptomsPage: React.FC<SymptomsPageProps> = ({ selectedDate, selectedSymptoms, setSelectedSymptoms, setCurrentPage, streak, setStreak }) => {
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    if (selectedSymptoms.length === 0) {
      setStreak(streak + 1);
    }
    updateDailyRecord(selectedDate, { symptoms: selectedSymptoms, symptomsSaved: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
  <div className="space-y-6">
    {saved && (
      <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
        Data saved successfully!
      </div>
    )}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
        Symptom Tracking
      </h2>
      <p className="text-gray-600 mb-4">How are you feeling today?</p>
      <div className="flex bg-gray-100 rounded-xl p-1 mb-2">
        <button onClick={()=>setCurrentPage('sleep')} className="flex-1 py-3 text-gray-600 hover:text-orange-600">Sleep</button>
        <button onClick={() => setCurrentPage('track')} className="flex-1 py-3 text-gray-600 hover:text-orange-600">Meals</button>
        <button onClick={()=>setCurrentPage('sport')} className="flex-1 py-3 text-gray-600 hover:text-orange-600">Sport</button>
        <button onClick={() => setCurrentPage('cycle')} className="flex-1 py-3 text-gray-600 hover:text-orange-600">Cycle</button>
        <button className="flex-1 py-3 bg-white rounded-lg font-medium text-gray-900 shadow-sm border-2 border-orange-500">Symptoms</button>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="text-red-500" size={24} />
          <h3 className="text-lg font-medium text-gray-900">Select any symptoms you're experiencing:</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            'Headache', 'Fatigue', 'Bloating', 'Nausea', 'Joint Pain', 'Skin Issues',
            'Mood Changes', 'Sleep Issues', 'Digestive Issues', 'Energy Levels',
            'Concentration', 'Stress'
          ].map((symptom) => (
            <label key={symptom} className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200 hover:border-orange-400 transition-colors">
              <input
                type="checkbox"
                checked={selectedSymptoms.includes(symptom)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSymptoms([...selectedSymptoms, symptom]);
                  } else {
                    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                  }
                }}
                className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300 focus:ring-orange-500"
              />
              <span className="text-gray-700 font-medium">{symptom}</span>
            </label>
          ))}
        </div>
      </div>
      <button 
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
      >
        <Check size={20} />
        Save Today's Data
      </button>
    </div>
  </div>
);
};

export default SymptomsPage; 