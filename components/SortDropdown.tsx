import React, { useState } from 'react';
import { ArrowUpDownIcon } from './icons/ArrowUpDownIcon';

export interface SortOption {
  key: string;
  label: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface SortDropdownProps {
  options: SortOption[];
  sortConfig: SortConfig;
  onSortChange: (newConfig: SortConfig) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ options, sortConfig, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (key: string) => {
    let newDirection: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key) {
      newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    onSortChange({ key, direction: newDirection });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full text-zinc-300 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-lime-500"
        aria-label={`Urutkan berdasarkan ${sortConfig.key}, ${sortConfig.direction === 'asc' ? 'naik' : 'turun'}`}
      >
        <ArrowUpDownIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 p-2">
           <div className="px-2 py-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">Urutkan Berdasarkan</h4>
            {options.map(option => (
              <button 
                key={option.key} 
                onClick={() => handleSelect(option.key)}
                className="w-full text-left flex items-center justify-between space-x-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer"
              >
                <span className={`text-zinc-200 text-sm ${sortConfig.key === option.key ? 'font-bold' : ''}`}>{option.label}</span>
                {sortConfig.key === option.key && (
                  <span className="text-xs text-zinc-400">{sortConfig.direction === 'asc' ? '↑ A-Z' : '↓ Z-A'}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;