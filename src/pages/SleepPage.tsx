import React, { useState } from 'react';
import { Moon, Check } from 'lucide-react';
import TabNav from '../components/TabNav';
import { updateDailyRecord } from '../utils/storage';

interface SleepPageProps {
  selectedDate: Date;
  sleepHours: number | null;
  setSleepHours: (n: number | null) => void;
  setCurrentPage: (p: string) => void;
  sameSleepRoutine: boolean;
  setSameSleepRoutine: (b: boolean) => void;
}

const SleepPage: React.FC<SleepPageProps> = ({ selectedDate, sleepHours, setSleepHours, setCurrentPage, sameSleepRoutine, setSameSleepRoutine }) => {
  const [hours, setHours] = useState<string>(sleepHours !== null ? String(sleepHours) : '');
  const sameRoutine = sameSleepRoutine;
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (sameRoutine) {
      setSleepHours(hours ? Number(hours) : null);
    }
    const h = hours ? Number(hours) : null;
    updateDailyRecord(selectedDate, { sleepHours: h, sameSleepRoutine: sameRoutine, sleepSaved: true });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How long did you sleep?</h2>
        <p className="text-gray-600 mb-4">Report your sleep duration for today</p>
        <TabNav current="sleep" setPage={setCurrentPage} />

        <h3 className="text-lg font-medium text-gray-900 mb-2">Select option</h3>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="sleeprt" value="no" checked={!sameRoutine} onChange={()=>setSameSleepRoutine(false)} className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300" />
            No, I’ll log hours
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="sleeprt" value="yes" checked={sameRoutine} onChange={()=>setSameSleepRoutine(true)} className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300" />
            Yes, same routine
          </label>
        </div>

        {!sameRoutine ? (
          <input
            type="number"
            min={0}
            step={0.5}
            className="w-full border-2 border-orange-200 rounded-xl p-3 text-sm focus:outline-none mb-4"
            placeholder="Hours slept..."
            value={hours}
            onChange={(e)=> setHours(e.target.value)}
          />
        ) : (
          <div className="mb-4 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-sm text-orange-700 shadow-sm">
            <Moon size={16}/>
            <span>Same routine — {hours || '0'} h</span>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg mt-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Check size={20} /> Save Today's Data
        </button>
      </div>
    </div>
  );
};

export default SleepPage; 