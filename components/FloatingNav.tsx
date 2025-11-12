import React from 'react';
import { Page } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { PlusIcon } from './icons/PlusIcon';

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
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
      <div className="flex items-stretch justify-center gap-2 w-full">
        {/* Nav buttons container */}
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 p-1.5 flex items-center justify-center space-x-1 flex-grow">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as Page)}
                className={`flex flex-col items-center justify-center gap-1 w-full h-12 rounded-xl text-xs font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500 ${
                  isActive
                    ? 'bg-lime-400 text-zinc-900 shadow-lg shadow-lime-400/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Add button */}
        {(activePage === 'territories' || activePage === 'publishers') && (
          <button
            onClick={onAddClick}
            className="flex-shrink-0 w-14 bg-lime-400 rounded-2xl flex items-center justify-center text-zinc-900 shadow-2xl shadow-lime-400/30 transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-500/50"
            aria-label="Tambah item baru"
          >
            <PlusIcon className="w-7 h-7" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default FloatingNav;