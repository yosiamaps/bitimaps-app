// This component is no longer used.
// Its functionality has been integrated into the new BottomActionBar component.
// It can be safely removed from the project.
import React from 'react';
import { PlusIcon } from './icons/PlusIcon';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 z-40 w-14 h-14 bg-lime-400 rounded-full flex items-center justify-center text-zinc-900 shadow-2xl shadow-lime-400/30 transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-500/50"
      aria-label="Tambah item baru"
    >
      <PlusIcon className="w-7 h-7" />
    </button>
  );
};

export default FloatingActionButton;
