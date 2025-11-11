import React, { useState } from 'react';
import { TerritoryWithDetails, TerritoryStatus } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ShareIcon } from './icons/ShareIcon';
import { UserIcon } from './icons/UserIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

const StatusBadge: React.FC<{ status: TerritoryStatus }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full inline-block';
  let specificClasses = '';

  switch (status) {
    case TerritoryStatus.Available:
      specificClasses = 'bg-zinc-800 text-zinc-300';
      break;
    case TerritoryStatus.InProgress:
      specificClasses = 'bg-yellow-500/20 text-yellow-400';
      break;
    case TerritoryStatus.Completed:
      specificClasses = 'bg-lime-500/20 text-lime-400';
      break;
  }
  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

interface TerritoryDetailModalProps {
  territory: TerritoryWithDetails;
  onClose: () => void;
  onEdit: (territory: TerritoryWithDetails) => void;
  onAssign: (territory: TerritoryWithDetails) => void;
  onComplete: (territory: TerritoryWithDetails) => void;
}

const TerritoryDetailModal: React.FC<TerritoryDetailModalProps> = ({ territory, onClose, onEdit, onAssign, onComplete }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const latestHistory = territory.history.length > 0 ? territory.history[0] : null;

  const handleShare = async () => {
    if (!territory.gmaps_link) return;

    const shareData = {
      title: `Daerah Dinas: ${territory.name}`,
      text: `Lokasi untuk daerah ${territory.name} (${territory.kdl}).`,
      url: territory.gmaps_link,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(territory.gmaps_link);
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
              <h3 className="text-xl font-bold text-zinc-100">{territory.name}</h3>
              <p className="text-sm text-zinc-400">{territory.kdl}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 mt-1">
              {territory.gmaps_link && (
                <a href={territory.gmaps_link} target="_blank" rel="noopener noreferrer" aria-label="Buka di Google Maps" className="p-2 text-zinc-500 hover:text-lime-400 hover:bg-lime-500/10 rounded-full transition-colors">
                  <MapPinIcon className="w-5 h-5" />
                </a>
              )}
              <StatusBadge status={territory.status} />
              <button 
                onClick={() => onEdit(territory)} 
                className="p-2 text-zinc-500 hover:text-lime-400 hover:bg-lime-500/10 rounded-full transition-all duration-200"
                aria-label="Edit Daerah"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Details Section */}
          {((territory.status === TerritoryStatus.InProgress && territory.currentAssignment) || (territory.status === TerritoryStatus.Completed && latestHistory)) && (
            <div className="text-sm text-zinc-400 border-t border-zinc-800 pt-4 mt-4 space-y-2">
              {territory.status === TerritoryStatus.InProgress && territory.currentAssignment && (
                <>
                  <p>Dikerjakan oleh: <span className="font-medium text-zinc-200">{territory.currentAssignment.publisherName}</span></p>
                  <p>Mulai: <span className="font-medium text-zinc-200">{territory.currentAssignment.startDate}</span></p>
                  {territory.currentAssignment.notes && (
                    <p>Catatan: <span className="italic text-zinc-300">"{territory.currentAssignment.notes}"</span></p>
                  )}
                </>
              )}

              {territory.status === TerritoryStatus.Completed && latestHistory && (
                <>
                  <p>Terakhir selesai: <span className="font-medium text-zinc-200">{latestHistory.completionDate}</span> oleh <span className="font-medium text-zinc-200">{latestHistory.publisherName}</span></p>
                  {territory.history.length > 0 && (
                    <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-lime-400 font-semibold hover:text-lime-300 transition-colors mt-2">
                      <span>Lihat Riwayat ({territory.history.length})</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* History Section (Collapsible) */}
          {showHistory && territory.status === TerritoryStatus.Completed && (
            <div className="bg-zinc-800/50 rounded-lg p-4 mt-4 animate-expand-fade-in">
              <h4 className="font-semibold text-zinc-100 text-sm mb-4">Riwayat Pengerjaan</h4>
              <div className="relative pl-6">
                 {/* The timeline line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-zinc-700 rounded-full"></div>
                {territory.history.map((record, index) => (
                  <div key={index} className="relative mb-6 last:mb-0">
                     {/* The timeline circle */}
                    <div className="absolute -left-[27px] top-1 w-4 h-4 bg-zinc-600 rounded-full border-4 border-zinc-800/50"></div>
                    <div className="space-y-2">
                       {/* Publisher Name */}
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <p className="font-semibold text-zinc-200">{record.publisherName}</p>
                      </div>
                       {/* Date Period */}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <p className="text-xs text-zinc-400">Periode: {record.startDate} - {record.completionDate}</p>
                      </div>
                       {/* Notes */}
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

          {/* Actions Section */}
          <div className="mt-6 border-t border-zinc-800 pt-6">
            {territory.status === TerritoryStatus.Completed ? (
              <div className="flex flex-col space-y-3">
                {territory.gmaps_link && (
                   <button 
                      onClick={handleShare} 
                      className={`w-full text-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                          copyStatus === 'copied' 
                          ? 'text-lime-400 bg-lime-500/10' 
                          : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700'
                      }`}
                      disabled={copyStatus === 'copied'}
                   >
                      {copyStatus === 'copied' ? 'Link Disalin!' : 'Bagikan Link'}
                   </button>
                )}
                <button onClick={() => onAssign(territory)} className="w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors">
                  Tugaskan Lagi
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                  {territory.gmaps_link && (
                     <button 
                        onClick={handleShare} 
                        className={`flex-1 text-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                            copyStatus === 'copied' 
                            ? 'text-lime-400 bg-lime-500/10' 
                            : 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        disabled={copyStatus === 'copied'}
                     >
                        {copyStatus === 'copied' ? 'Link Disalin!' : 'Bagikan Link'}
                     </button>
                  )}
                  {territory.status === TerritoryStatus.Available && (
                    <button onClick={() => onAssign(territory)} className="flex-1 text-center px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors">
                      Tugaskan Penyiar
                    </button>
                  )}
                   {territory.status === TerritoryStatus.InProgress && (
                    <button onClick={() => onComplete(territory)} className="flex-1 text-center px-4 py-3 rounded-lg text-sm font-semibold text-zinc-900 bg-lime-400 hover:bg-lime-300 transition-colors">
                      Selesaikan
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerritoryDetailModal;