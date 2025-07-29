import React, { useState } from 'react';
import { Calendar, Check } from 'lucide-react';
import TabNav from '../components/TabNav';
import { updateDailyRecord } from '../utils/storage';

interface CyclePageProps {
  selectedDate: Date;
  setCurrentPage: (p: string) => void;
  hasPeriod: 'yes' | 'no' | 'none' | '';
  setHasPeriod: (v: 'yes' | 'no' | 'none' | '') => void;
}

const CyclePage: React.FC<CyclePageProps> = ({ selectedDate, setCurrentPage, hasPeriod, setHasPeriod }) => {
  const hasPeriodState = hasPeriod;
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateDailyRecord(selectedDate, { hasPeriod, cycleSaved: true });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cycle Tracking</h2>
        <p className="text-gray-600 mb-4">Log your current menstrual cycle status</p>
        <TabNav current="cycle" setPage={setCurrentPage} />

        {/* question */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-pink-500" size={24} />
            <h3 className="text-lg font-medium text-gray-900">Are you currently on your period?</h3>
          </div>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                value="yes"
                checked={hasPeriodState === 'yes'}
                onChange={() => setHasPeriod('yes')}
                className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300 focus:ring-orange-500"
              />
              Yes
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                value="no"
                checked={hasPeriodState === 'no'}
                onChange={() => setHasPeriod('no')}
                className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300 focus:ring-orange-500"
              />
              No (but expected later)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="period"
                value="none"
                checked={hasPeriodState === 'none'}
                onChange={() => setHasPeriod('none')}
                className="w-5 h-5 text-orange-500 rounded border-2 border-orange-300 focus:ring-orange-500"
              />
              I don&apos;t have periods due to treatment
            </label>
          </div>

          {hasPeriodState === 'yes' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border-2 border-orange-200 rounded-xl p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border-2 border-orange-200 rounded-xl p-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg mt-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Check size={20} />
          Save Today's Data
        </button>
      </div>
    </div>
  );
};

export default CyclePage; 