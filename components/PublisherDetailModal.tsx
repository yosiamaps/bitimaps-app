import React, { useState } from 'react';
import { PublisherWithDetails, Publisher } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ShareIcon } from './icons/ShareIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

const PublisherDetailModal: React.FC<{
  publisher: PublisherWithDetails;
  onClose: () => void;
  onEdit: (publisher: Publisher) => void;
  onDelete: (publisher: Publisher) => void;
}> = ({ publisher, onClose, onEdit, onDelete }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    if (!publisher.currentAssignment?.gmaps_link) return;

    const shareData = {
      title: `Daerah Dinas: ${publisher.currentAssignment.territoryName}`,
      text: `Lokasi untuk daerah ${publisher.currentAssignment.territoryName} yang dikerjakan oleh ${publisher.name}.`,
      url: publisher.currentAssignment.gmaps_link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(publisher.currentAssignment.gmaps_link);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-modal-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-2xl shadow-2xl shadow-black/40 w-full max-w-lg max-h-[90vh] flex flex-col animate-modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto">
          {/* Top Section */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-100">{publisher.name}</h3>
              <p className="text-sm text-zinc-400">KDL: {publisher.group}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 mt-1">
              <button 
                onClick={() => onEdit(publisher)} 
                className="p-2 text-zinc-500 hover:text-lime-400 hover:bg-lime-500/10 rounded-full transition-all duration-200"
                aria-label="Edit Penyiar"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDelete(publisher)}
                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-200"
                aria-label="Hapus Penyiar"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Current Assignment Section */}
          {publisher.currentAssignment ? (
            <div className="text-sm text-zinc-400 border-t border-zinc-800 pt-4 mt-4 space-y-2">
              <h4 className="font-semibold text-zinc-100 text-base">Sedang Dikerjakan</h4>
              <p>Daerah: <span className="font-medium text-zinc-200">{publisher.currentAssignment.territoryName}</span></p>
              <p>Mulai: <span className="font-medium text-zinc-200">{publisher.currentAssignment.startDate}</span></p>
              {publisher.currentAssignment.notes && (
                <p>Catatan: <span className="italic text-zinc-300">"{publisher.currentAssignment.notes}"</span></p>
              )}
            </div>
          ) : (
             <div className="text-sm text-zinc-500 border-t border-zinc-800 pt-4 mt-4">
                Tidak sedang mengerjakan daerah.
            </div>
          )}
          
          {/* History Toggle */}
          {publisher.history.length > 0 && (
            <div className="border-t border-zinc-800 pt-4 mt-4">
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-lime-400 font-semibold hover:text-lime-300 transition-colors">
                    <span>Lihat Riwayat ({publisher.history.length})</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>
            </div>
          )}

          {/* History Section (Collapsible) */}
          {showHistory && publisher.history.length > 0 && (
            <div className="bg-zinc-800/50 rounded-lg p-4 mt-4 animate-expand-fade-in">
              <h4 className="font-semibold text-zinc-100 text-sm mb-4">Riwayat Pengerjaan</h4>
              <div className="relative pl-6">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-zinc-700 rounded-full"></div>
                {publisher.history.map((record, index) => (
                  <div key={index} className="relative mb-6 last:mb-0">
                    <div className="absolute -left-[27px] top-1 w-4 h-4 bg-zinc-600 rounded-full border-4 border-zinc-800/50"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <p className="font-semibold text-zinc-200">{record.territoryName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <p className="text-xs text-zinc-400">Periode: {record.startDate} - {record.completionDate}</p>
                      </div>
                      {record.notes && (
                        <div className="flex items-start gap-2 pt-1">
                          <ClipboardIcon className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm italic text-zinc-300">"{record.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 mt-auto">
          {publisher.currentAssignment?.gmaps_link && (
            <div className="flex items-center gap-4">
              <button 
                  onClick={handleShare} 
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      copyStatus === 'copied' 
                      ? 'text-lime-400 bg-lime-500/10' 
                      : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700'
                  }`}
                  disabled={copyStatus === 'copied'}
              >
                  <ShareIcon className="w-4 h-4" />
                  {copyStatus === 'copied' ? 'Link Disalin!' : 'Bagikan'}
              </button>
              <a 
                href={publisher.currentAssignment.gmaps_link}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors"
              >
                <MapPinIcon className="w-5 h-5" />
                Buka Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherDetailModal;