import React from 'react';

interface MiniBarProps {
  values: number[];
  labels: string[];
  height?: number;
  color?: string; // tailwind or hex
}

const MiniBar: React.FC<MiniBarProps> = ({ values, labels, height = 60, color = '#38bdf8' }) => {
  if (!values.length) return null;
  const max = Math.max(...values, 1);
  
  // Calculate responsive bar width based on number of items
  const getBarWidth = () => {
    if (values.length <= 3) return 'w-8';
    if (values.length <= 6) return 'w-6';
    if (values.length <= 12) return 'w-5';
    return 'w-4';
  };
  
  const barWidth = getBarWidth();
  
  return (
    <div className="w-full bg-gray-50 rounded-lg p-4">
      <div className="flex items-end justify-center gap-2 w-full overflow-x-auto pb-2">
        {values.map((v, idx) => {
          const hRaw = (v / max) * height;
          const h = Math.max(hRaw, v > 0 ? 4 : 2); // Minimum height for visibility
          return (
            <div key={labels[idx]} className="flex flex-col items-center text-[10px] text-gray-600 min-w-[28px]">
              <div className="relative flex flex-col items-center">
                {/* Value label above bar */}
                {v > 0 && (
                  <span className="text-[11px] font-semibold text-gray-700 mb-1">{v}</span>
                )}
                
                {/* Bar */}
                <div
                  style={{ 
                    height: `${h}px`, 
                    background: v > 0 ? color : '#E5E7EB',
                    boxShadow: v > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                  className={`${barWidth} rounded-t-sm transition-all duration-200 hover:opacity-80`}
                />
                
                {/* Base line */}
                <div className={`${barWidth} h-0.5 bg-gray-300`} />
              </div>
              
              {/* Month label */}
              <span className="mt-2 text-center font-medium text-gray-600">
                {labels[idx].slice(-2)}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center items-center mt-3 gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ background: color }}></div>
          <span>Occurrences</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-300"></div>
          <span>No data</span>
        </div>
      </div>
    </div>
  );
};

export default MiniBar; 