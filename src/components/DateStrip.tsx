import React from 'react';

interface DateStripProps {
  selected: Date;
  onSelect: (d: Date) => void;
  hasPhoto?: (d: Date) => boolean;
  range?: number; // days before/after
}

const DateStrip: React.FC<DateStripProps> = ({ selected, onSelect, hasPhoto, range = 7 }) => {
  // Get Monday of current week
  const weekStart = new Date(selected);
  const day = weekStart.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // adjust when Sunday
  weekStart.setDate(weekStart.getDate() + diff);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  const fmt = (d: Date) => d.getDate();

  return (
    <div className="flex overflow-x-auto gap-2 py-2 px-1 scrollbar-hide select-none">
      {days.map((d) => {
        const key = d.toISOString().split('T')[0];
        const isSelected = key === selected.toISOString().split('T')[0];
        const indicator = hasPhoto && hasPhoto(d);
        return (
          <button
            key={key}
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center w-10 p-1 rounded-md border transition-colors ${isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
          >
            <span className="text-[10px] font-medium">{"SMTWTFS"[d.getDay()]}</span>
            <span className="text-xs">{fmt(d)}</span>
            {indicator && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />}
          </button>
        );
      })}
    </div>
  );
};

export default DateStrip; 