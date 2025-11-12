import React, { useState } from 'react';
import { Publisher } from '../types';

interface PublisherFormModalProps {
  publisherToEdit?: Publisher | null;
  onClose: () => void;
  onSave: (publisher: Omit<Publisher, 'id'>) => void;
  isSubmitting?: boolean;
}

const PublisherFormModal: React.FC<PublisherFormModalProps> = ({ publisherToEdit, onClose, onSave, isSubmitting = false }) => {
  const [name, setName] = useState(publisherToEdit?.name || '');
  const [group, setGroup] = useState(publisherToEdit?.group || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    onSave({ name, group });
  };

  const title = publisherToEdit ? 'Edit Penyiar' : 'Tambah Penyiar Baru';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-md p-6 animate-modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">Nama Penyiar</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              required
              disabled={isSubmitting}
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-70"
            />
          </div>

          <div>
            <label htmlFor="group" className="block text-sm font-medium text-zinc-400 mb-2">KDL</label>
            <input
              id="group"
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder=""
              required
              disabled={isSubmitting}
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-70"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublisherFormModal;