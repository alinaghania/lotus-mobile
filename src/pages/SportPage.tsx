import React, { useState } from 'react';
import { Dumbbell, Check } from 'lucide-react';
import { sportActivities } from '../constants/meals';
import MultiSelect from '../components/MultiSelect';
import TabNav from '../components/TabNav';
import { updateDailyRecord } from '../utils/storage';

interface SportData {
  activities: string[];
  durations: Record<string, number>; // minutes per activity
}

interface SportPageProps {
  selectedDate: Date;
  sportData: SportData | null;
  setSportData: (d: SportData | null) => void;
  setCurrentPage: (p: string) => void;
  sameSportRoutine: boolean;
  setSameSportRoutine: (b: boolean) => void;
}

const SportPage: React.FC<SportPageProps> = ({ selectedDate, sportData, setSportData, setCurrentPage, sameSportRoutine, setSameSportRoutine }) => {
  const sameRoutine = sameSportRoutine;
  const [activities, setActivities] = useState<string[]>(sportData?.activities ?? []);
  const [durations, setDurations] = useState<Record<string, number>>(sportData?.durations ?? {});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (sameRoutine) {
      setSportData(null);
    } else {
      setSportData({ activities, durations });
    }
    updateDailyRecord(selectedDate, { sportData: sameRoutine ? null : { activities, durations }, sameSportRoutine: sameRoutine, sportSaved: true });
    setTimeout(()=>setSaved(false),3000);
  };

  return (
    <div className="space-y-6">
      {saved && (<div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">Data saved successfully!</div>)}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Did you exercise today?</h2>
        <p className="text-gray-600 mb-4">Log your physical activity</p>
        <TabNav current="sport" setPage={setCurrentPage} />
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2"><Dumbbell size={20}/> Is today the same routine?</h3>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="samert" value="no" checked={!sameRoutine} onChange={()=> setSameSportRoutine(false)} className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300" />
            No, I’ll log activity
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="samert" value="yes" checked={sameRoutine} onChange={()=> setSameSportRoutine(true)} className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300" />
            Yes, same routine
          </label>
        </div>
        {!sameRoutine ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center gap-2"><Dumbbell size={20}/> Activities</h3>
            <MultiSelect
              label="activities"
              options={sportActivities}
              value={activities}
              onChange={(vals)=>{
                const unique=Array.from(new Set(vals));
                setActivities(unique);
                setDurations(prev=>{
                  const copy={...prev};
                  Object.keys(copy).forEach(k=>{if(!unique.includes(k)) delete copy[k];});
                  unique.forEach(a=>{if(!(a in copy)) copy[a]=0;});
                  return copy;
                });
              }}
              allowOther
            />
            <div className="mt-4 space-y-2">
              {activities.map(act=> (
                <div key={act} className="flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{act}</span>
                  <input type="number" min={0} className="w-20 border border-orange-200 rounded px-1 text-xs" value={durations[act]??0} onChange={(e)=>{
                    const val=+e.target.value;
                    setDurations(prev=>({...prev,[act]:val}));
                  }} />
                  <select value="min" className="border border-orange-200 rounded text-xs px-1">
                    <option value="min">min</option>
                    <option value="h">h</option>
                  </select>
                  <button onClick={()=>{
                    setActivities(prev=>prev.filter(a=>a!==act));
                    setDurations(prev=>{const c={...prev};delete c[act];return c;});
                  }}>&times;</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          activities.length ? (
            <div className="space-y-2 mb-4">
              {activities.map(a=> (
                <span key={a} className="inline-block bg-orange-50 border border-orange-200 text-orange-700 text-xs px-2 py-1 rounded-full mr-2">{a} — {durations[a]??0} min</span>
              ))}
            </div>
          ) : <div className="text-sm text-gray-500 mb-4">Same routine selected.</div>
        )}
        <button onClick={handleSave} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg mt-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><Check size={20}/> Save Today's Data</button>
      </div>
    </div>
  );
};

export default SportPage; 