import React from 'react';
import { PlusIcon } from './icons/PlusIcon';
import SearchInput from './SearchInput';

interface BottomActionBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddClick: () => void;
  placeholder: string;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({ searchQuery, onSearchChange, onAddClick, placeholder }) => {
  return (
    <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
      <div className="flex items-center gap-2 w-full">
        <div className="flex-grow">
          <SearchInput 
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={placeholder}
          />
        </div>
        <button
          onClick={onAddClick}
          className="flex-shrink-0 w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center text-zinc-900 shadow-lg shadow-lime-400/20 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500"
          aria-label="Tambah item baru"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default BottomActionBar;
