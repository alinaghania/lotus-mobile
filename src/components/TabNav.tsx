import React from 'react';

interface TabNavProps {
  current: string;
  setPage: (p: string) => void;
  hide?: string[];
}

const tabs: {key: string; label: string}[] = [
  {key:'sleep',label:'Sleep'},
  {key:'track',label:'Meals'},
  {key:'sport',label:'Sport'},
  {key:'cycle',label:'Cycle'},
  {key:'symptoms',label:'Symptoms'},
];

const TabNav: React.FC<TabNavProps> = ({current,setPage, hide=[]}) => (
  <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
    {tabs.filter(t => !hide.includes(t.key) || t.key===current).map(t=> (
      <button
        key={t.key}
        onClick={()=> setPage(t.key)}
        className={`flex-1 py-3 rounded-lg transition-colors ${current===t.key? 'bg-white font-medium text-gray-900 shadow-sm border-2 border-orange-500':'text-gray-600 hover:text-orange-600'}`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default TabNav; 