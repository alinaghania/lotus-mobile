import React from 'react';

interface SparklineProps {
  data: number[]; // assumed length <= 30
  max?: number;
  color?: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, max, color = 'bg-orange-500', height = 24 }) => {
  if (!data.length) return null;
  const maxVal = max ?? Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] w-full h-full">
      {data.map((v, idx) => (
        <div
          key={idx}
          className={`${color} w-full rounded-sm`}
          style={{ height: `${(v / maxVal) * height}px` }}
        />
      ))}
    </div>
  );
};

export default Sparkline; 