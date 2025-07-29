import React from 'react';

interface CalendarGridProps {
  selectedDate?: Date;
  onSelectDate?: (d: Date) => void;
  markedDates?: string[]; // YYYY-MM-DD keys that have data
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ selectedDate, onSelectDate, markedDates = [] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState<Date>(selectedDate ?? new Date());

  const year = viewDate.getFullYear();
  const monthIndex = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Build cells for 6 rows * 7 cols
  const cells: Array<{ day: number | null; highlight: boolean; today: boolean }> = [];

  // empty cells before 1st
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, highlight: false, today: false });

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const key = dateObj.toLocaleDateString('sv-SE');
    const marked = markedDates.includes(key);
    const isToday = d === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear();
    cells.push({ day: d, highlight: marked, today: isToday });
  }

  while (cells.length < 42) cells.push({ day: null, highlight: false, today: false });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button onClick={()=>setViewDate(new Date(year, monthIndex-1, 1))} className="p-1 rounded hover:bg-gray-100">
          &lt;
        </button>
        <div className="text-center font-semibold text-sm capitalize flex-1">
          {monthName} {year}
        </div>
        <button onClick={()=>setViewDate(new Date(year, monthIndex+1, 1))} className="p-1 rounded hover:bg-gray-100">
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-gray-500">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px] select-none">
        {cells.map((cell, idx) => {
          if (cell.day === null) return <div key={idx} />;
          const base = 'w-6 h-6 flex items-center justify-center rounded-md';
          const future = new Date(year, monthIndex, cell.day) > new Date(today.toDateString());
          const cursor = future ? 'cursor-default opacity-30' : 'cursor-pointer';
          const cls = 'bg-gray-100 text-gray-700';
          const isSelected = selectedDate && cell.day === selectedDate.getDate() && selectedDate.getMonth()===monthIndex && selectedDate.getFullYear()===year;
          const ring = isSelected
            ? 'ring-2 ring-red-500'
            : cell.today
            ? 'ring-2 ring-gray-900'
            : '';
          const completedStyle = cell.highlight ? 'bg-green-100 text-green-700 line-through' : '';
          return (
            <div
              key={idx}
              className={`${base} ${cls} ${ring} ${completedStyle} ${cursor}`}
              onClick={() => {
                if(cell.day && onSelectDate){
                  const newDate = new Date(year, monthIndex, cell.day);
                  if(newDate > new Date(today.toDateString())) return; // block future
                  onSelectDate(newDate);
                  setViewDate(newDate);
                }
              }}
            >
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid; 