import React from 'react';

interface FilterSelectorProps {
  selectedFilter: 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months';
  setSelectedFilter: (filter: 'Last 3 Days' | 'Last Week' | 'Last Month' | 'Last 2 Months' | 'Last 6 Months') => void;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ selectedFilter, setSelectedFilter }) => {
  const filters = ['Last 3 Days', 'Last Week', 'Last Month', 'Last 2 Months', 'Last 6 Months'];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedFilter === filter
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
          }`}
          onClick={() => setSelectedFilter(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterSelector; 