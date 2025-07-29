import React from 'react';

interface ViewSelectorProps {
  mode: 'single' | 'grid';
  setMode: (m: 'single' | 'grid') => void;
  gridRange: 7 | 30 | 'all';
  setGridRange: (r: 7 | 30 | 'all') => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ mode, setMode, gridRange, setGridRange }) => (
  <div className="flex items-center gap-3">
    <select
      value={mode}
      onChange={(e) => setMode(e.target.value as 'single' | 'grid')}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="single">Single View</option>
      <option value="grid">Grid View</option>
    </select>
    {mode === 'grid' && (
      <select
        value={gridRange}
        onChange={(e) => setGridRange(e.target.value === 'all' ? 'all' : (parseInt(e.target.value) as 7 | 30))}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value="all">All</option>
      </select>
    )}
  </div>
);

export default ViewSelector; 