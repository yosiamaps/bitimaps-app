import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { TerritoryWithDetails, Publisher } from '../types';
import { InfoIcon } from './icons/InfoIcon';

interface AssignPublisherModalProps {
  territory: TerritoryWithDetails;
  availablePublishers: Publisher[];
  onClose: () => void;
  onAssign: (assignment: { publisherId: number; startDate: string; notes?: string }) => void;
  isSubmitting?: boolean;
}

const AssignPublisherModal: React.FC<AssignPublisherModalProps> = ({ territory, availablePublishers, onClose, onAssign, isSubmitting = false }) => {
  const [selectedPublisherId, setSelectedPublisherId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [notes, setNotes] = useState('');
  
  const latestHistory = territory.history.length > 0 ? territory.history[0] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!selectedPublisherId) {
        alert("Silakan pilih seorang penyiar.");
        return;
    }
    onAssign({
      publisherId: selectedPublisherId,
      startDate,
      notes,
    });
  };

  const modalContent = (
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
            <div>
                <h2 className="text-xl font-bold text-zinc-100">Tugaskan Penyiar</h2>
                <p className="text-sm text-zinc-400">untuk Daerah: {territory.name}</p>
            </div>
          </div>

          {latestHistory && (
            <div className="bg-zinc-800/50 p-4 rounded-lg flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-lime-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-zinc-200 text-sm">Review Catatan Terakhir</h4>
                <p className="text-xs text-zinc-400">Oleh {latestHistory.publisherName} pada {latestHistory.completionDate}</p>
                {latestHistory.notes && (
                  <p className="text-sm italic text-zinc-300 mt-1">"{latestHistory.notes}"</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-zinc-400 mb-2">Pilih Penyiar</label>
            <select
              id="publisher"
              value={selectedPublisherId ?? ''}
              onChange={(e) => setSelectedPublisherId(Number(e.target.value))}
              required
              disabled={availablePublishers.length === 0 || isSubmitting}
              className="w-full bg-zinc-800 text-zinc-200 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {availablePublishers.length > 0 ? '-- Pilih seorang penyiar --' : 'Tidak ada penyiar tersedia'}
              </option>
              {availablePublishers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-zinc-400 mb-2">Tanggal Mulai</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full bg-zinc-800 text-zinc-200 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500 disabled:opacity-70"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-zinc-400 mb-2">Catatan Awal (Opsional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan awal jika perlu..."
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
              disabled={isSubmitting || availablePublishers.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Menugaskan...' : 'Tugaskan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? createPortal(modalContent, modalRoot) : null;
};

export default AssignPublisherModal;