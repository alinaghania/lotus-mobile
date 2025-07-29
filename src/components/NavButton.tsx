import React from 'react';

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  page: string;
  activePages?: string[];
  count?: string;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, page, activePages, count, currentPage, setCurrentPage }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all ${
      (activePages ? activePages.includes(currentPage) : currentPage===page)
        ? 'bg-gray-900 text-white shadow-lg' 
        : 'text-gray-700 hover:bg-orange-50'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {count && (
      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        {count}
      </span>
    )}
  </button>
);

export default NavButton; 