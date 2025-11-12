import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isSubmitting?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, isSubmitting = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-sm p-6 animate-modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
            <p className="text-sm text-zinc-400 mt-2">{message}</p>
        </div>
        <div className="flex justify-center gap-4 mt-8">
            <button 
                type="button" 
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
                type="button" 
                onClick={onConfirm}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;