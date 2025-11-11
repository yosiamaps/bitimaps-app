import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-zinc-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900 text-zinc-200 placeholder-zinc-500 rounded-full py-3 pl-11 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all duration-300"
      />
    </div>
  );
};

export default SearchInput;
