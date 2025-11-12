import React from 'react';
import { Page } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BarChartIcon } from './icons/BarChartIcon';

interface FloatingNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  onAddClick: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ activePage, setActivePage, onAddClick }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'territories', label: 'Daerah', icon: MapPinIcon },
    { id: 'publishers', label: 'Penyiar', icon: UsersIcon },
    { id: 'reports', label: 'Laporan', icon: BarChartIcon },
  ];

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);
  
  const isAddButtonActive = activePage === 'territories' || activePage === 'publishers';

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
      <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 p-2 flex items-center justify-around w-full">
        {leftItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              aria-label={item.label}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500 ${
                isActive
                  ? 'bg-lime-400 text-zinc-900 shadow-lg shadow-lime-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}

        <button
          onClick={onAddClick}
          disabled={!isAddButtonActive}
          aria-label="Tambah item baru"
          className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500 ${
            isAddButtonActive
              ? 'bg-zinc-800 text-lime-400 shadow-lg shadow-lime-500/15 hover:scale-105 hover:bg-zinc-700'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          <PlusIcon className="w-7 h-7" />
        </button>
        
        {rightItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              aria-label={item.label}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500 ${
                isActive
                  ? 'bg-lime-400 text-zinc-900 shadow-lg shadow-lime-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingNav;