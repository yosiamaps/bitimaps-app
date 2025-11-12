import React, { useMemo } from 'react';
import { Publisher, Territory, Assignment } from '../types';
import EditableLinkCard from '../components/EditableLinkCard';
import { PlayCircleIcon } from '../components/icons/PlayCircleIcon';
import ListLoader from '../components/ListLoader';

interface ReportsPageProps {
  publishers: Publisher[];
  territories: Territory[];
  assignments: Assignment[];
  loading: boolean;
}

interface OngoingAssignment {
  id: number;
  publisherName: string;
  territoryName: string;
  startDate: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ publishers, territories, assignments, loading }) => {
  const ongoingAssignments = useMemo((): OngoingAssignment[] => {
    const publisherMap = new Map(publishers.map(p => [p.id, p.name]));
    const territoryMap = new Map(territories.map(t => [t.id, t.name]));

    return assignments
      .filter(a => !a.completion_date && a.publisher_id)
      .map(a => ({
        id: a.id,
        publisherName: publisherMap.get(a.publisher_id!) || 'Unknown',
        territoryName: territoryMap.get(a.territory_id) || 'Unknown',
        startDate: new Date(a.start_date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }))
      .sort((a, b) => a.publisherName.localeCompare(b.publisherName));
  }, [publishers, territories, assignments]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Laporan</h1>
        <p className="text-zinc-400 mt-1">Akses cepat dan pantau pengerjaan.</p>
      </div>

      <EditableLinkCard
        title="Formulir S-13"
        description="Buka atau edit tautan ke formulir Catatan Daerah Tugas (S-13)."
        storageKey="s13-form-link"
        defaultUrl="https://docs.google.com/document/d/1LNYERJPirBtYTydjdTPtjxkA5QhgMgktvkcrC1593cM/edit?usp=drive_link"
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">Pengerjaan Sedang Berlangsung</h2>
        {loading ? (
           <ListLoader />
        ) : ongoingAssignments.length > 0 ? (
          <div className="space-y-3">
            {ongoingAssignments.map(item => (
              <div key={item.id} className="bg-zinc-900 p-4 rounded-xl flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500/20">
                    <PlayCircleIcon className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{item.publisherName}</p>
                  <p className="text-sm text-zinc-400">
                    Mengerjakan <span className="font-medium text-zinc-300">{item.territoryName}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Mulai: {item.startDate}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-zinc-900 rounded-xl">
            <p className="text-zinc-500">Tidak ada pengerjaan yang sedang berlangsung.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;