import React from 'react';
import { Page } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { UsersIcon } from './icons/UsersIcon';
import { DashboardIcon } from './icons/DashboardIcon';

interface FloatingNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'territories', label: 'Daerah', icon: MapPinIcon },
    { id: 'publishers', label: 'Penyiar', icon: UsersIcon },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-sm mx-auto z-50">
      <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/30 p-1.5 flex items-center justify-center space-x-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`flex flex-col items-center justify-center gap-1 w-[72px] h-12 rounded-xl text-xs font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500 ${
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
    </nav>
  );
};

export default FloatingNav;