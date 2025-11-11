import React, { useState } from 'react';
import { TerritoryWithDetails } from '../types';

interface CompleteAssignmentModalProps {
  territory: TerritoryWithDetails;
  onClose: () => void;
  onComplete: (completion: { completionDate: string; notes?: string }) => void;
}

const CompleteAssignmentModal: React.FC<CompleteAssignmentModalProps> = ({ territory, onClose, onComplete }) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(territory.currentAssignment?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      completionDate,
      notes,
    });
  };

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
            <div>
              <h2 className="text-xl font-bold text-zinc-100">Selesaikan Pengerjaan</h2>
              <p className="text-sm text-zinc-400">Daerah: {territory.name}</p>
            </div>
          </div>

          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-zinc-400 mb-2">Tanggal Selesai</label>
            <input
              id="completionDate"
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              required
              className="w-full bg-zinc-800 text-zinc-200 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div>
            <label htmlFor="finalNotes" className="block text-sm font-medium text-zinc-400 mb-2">Catatan Akhir</label>
            <textarea
              id="finalNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Tambahkan rangkuman atau catatan akhir di sini..."
              className="w-full bg-zinc-800 text-zinc-200 placeholder-zinc-500 rounded-lg py-2 px-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors">
              Selesaikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteAssignmentModal;