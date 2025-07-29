import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateStickerProps {
  date: Date;
  onPrev?: () => void;
  onNext?: () => void;
  disableNext?: boolean;
}

const DateSticker: React.FC<DateStickerProps> = ({ date, onPrev, onNext, disableNext }) => {
  const formatted = date.toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className="inline-flex items-center gap-2 bg-white border border-orange-100/50 rounded-lg px-3 py-1 shadow-sm select-none">
      {onPrev && (
        <button onClick={onPrev} className="p-1 hover:bg-gray-100 rounded" title="Previous day">
          <ChevronLeft size={14} />
        </button>
      )}
      <Calendar size={14} className="text-gray-900" />
      <span className="text-xs font-semibold text-gray-900 tracking-wide min-w-[84px] text-center">{formatted}</span>
      {onNext && (
        <button onClick={onNext} disabled={disableNext} className={`p-1 rounded ${disableNext ? 'text-gray-300' : 'hover:bg-gray-100'}`} title="Next day">
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default DateSticker; 