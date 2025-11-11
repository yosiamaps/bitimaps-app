import React, { useState } from 'react';
import { Territory } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface TerritoryFormModalProps {
  territoryToEdit?: Territory | null;
  onClose: () => void;
  onSave: (territory: Pick<Territory, 'name' | 'kdl' | 'gmaps_link'>) => void;
  onDelete?: (territory: Territory) => void;
}

const TerritoryFormModal: React.FC<TerritoryFormModalProps> = ({ territoryToEdit, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(territoryToEdit?.name || '');
  const [kdl, setKdl] = useState(territoryToEdit?.kdl || '');
  const [gmapsLink, setGmapsLink] = useState(territoryToEdit?.gmaps_link || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, kdl, gmaps_link: gmapsLink });
  };

  const title = territoryToEdit ? 'Edit Daerah' : 'Tambah Daerah Baru';

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
            {territoryToEdit && onDelete && (
              <button 
                type="button" 
                onClick={() => onDelete(territoryToEdit)}
                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-200"
                aria-label={`Hapus daerah ${territoryToEdit.name}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">Nama Daerah</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              required
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="kdl" className="block text-sm font-medium text-zinc-400 mb-2">KDL</label>
            <input
              id="kdl"
              type="text"
              value={kdl}
              onChange={(e) => setKdl(e.target.value)}
              placeholder=""
              required
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="gmapsLink" className="block text-sm font-medium text-zinc-400 mb-2">Link Google Maps</label>
            <input
              id="gmapsLink"
              type="url"
              value={gmapsLink}
              onChange={(e) => setGmapsLink(e.target.value)}
              placeholder=""
              required
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerritoryFormModal;