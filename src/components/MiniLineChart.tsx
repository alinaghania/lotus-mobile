import React from 'react';

interface MiniLineChartProps {
  points: number[];            // y-values
  labels: string[];            // x-labels (same length)
  height?: number;             // chart height in px (default 60)
  color?: string;              // stroke / point color (default #ef4444)
}

const MiniLineChart: React.FC<MiniLineChartProps> = ({ points, labels, height = 60, color = '#ef4444' }) => {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  
  // Improve spacing for short periods
  const minWidth = 300; // Minimum chart width
  const baseStepX = 24;
  const calculatedWidth = (points.length - 1) * baseStepX + 40;
  const width = Math.max(minWidth, calculatedWidth);
  const stepX = points.length > 1 ? (width - 40) / (points.length - 1) : width / 2;

  const pathD = points
    .map((y, i) => {
      const x = i * stepX + 20;
      const yPos = height - (y / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${yPos}`;
    })
    .join(' ');

  // Adjust label frequency based on available space
  const labelEvery = points.length > 15 ? Math.ceil(points.length / 8) : 1;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height + 45} className="block mx-auto">
        {/* Grid lines for better readability */}
        <defs>
          <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="url(#grid)" />
        
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map(ratio => (
          <line 
            key={ratio}
            x1={20} 
            y1={height - ratio * height} 
            x2={width - 20} 
            y2={height - ratio * height}
            stroke="#f3f4f6" 
            strokeWidth="0.5"
          />
        ))}
        
        {/* Line chart */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Data points */}
        {points.map((y, i) => {
          const x = i * stepX + 20;
          const yPos = height - (y / max) * height;
          return (
            <g key={`p-${i}`}>
              <circle cx={x} cy={yPos} r={4} fill="white" stroke={color} strokeWidth="2" />
              <circle cx={x} cy={yPos} r={2} fill={color} />
              {/* Show value on hover */}
              <title>{`${labels[i]}: ${y === 1 ? 'Yes' : 'No'}`}</title>
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {labels.map((lab, i) => (
          i % labelEvery === 0 ? (
            <text
              key={`l-${i}`}
              x={i * stepX + 20}
              y={height + 15}
              fontSize="10"
              textAnchor="middle"
              fill="#6B7280"
              className="font-medium"
            >
              {lab.slice(-5)}
            </text>
          ) : null
        ))}
        
        {/* Y-axis labels */}
        <text x={5} y={12} fontSize="10" fill="#6B7280" className="font-medium">Yes</text>
        <text x={5} y={height - 2} fontSize="10" fill="#6B7280" className="font-medium">No</text>
        
        {/* Axis titles */}
        <text 
          x={width / 2} 
          y={height + 35} 
          fontSize="12" 
          textAnchor="middle" 
          fill="#374151" 
          className="font-bold"
        >
          Date
        </text>
        <text 
          x={12} 
          y={height / 2} 
          fontSize="12" 
          textAnchor="middle" 
          fill="#374151" 
          className="font-bold"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          Digestive Issues
        </text>
      </svg>
    </div>
  );
};

export default MiniLineChart; 