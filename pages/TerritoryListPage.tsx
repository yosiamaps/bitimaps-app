import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Territory, TerritoryStatus, Publisher, Assignment, TerritoryWithDetails } from '../types';
import TerritoryDetailModal from '../components/TerritoryDetailModal';
import AssignPublisherModal from '../components/AssignPublisherModal';
import CompleteAssignmentModal from '../components/CompleteAssignmentModal';
import { FilterIcon } from '../components/icons/FilterIcon';
import SortDropdown, { SortConfig, SortOption } from '../components/SortDropdown';
import TerritoryCardSkeleton from '../components/TerritoryCardSkeleton';

interface TerritoryListPageProps {
  territories: Territory[];
  publishers: Publisher[];
  assignments: Assignment[];
  loading: boolean;
  refreshData: () => Promise<void>;
  searchQuery: string;
  onEditTerritory: (territory: Territory) => void;
}

// Helper to combine data from separate tables into one detailed object
const combineData = (
  territories: Territory[],
  publishers: Publisher[],
  assignments: Assignment[]
): TerritoryWithDetails[] => {
  const publisherMap = new Map(publishers.map(p => [p.id, p.name]));

  return territories.map(t => {
    const territoryAssignments = assignments.filter(a => a.territory_id === t.id);
    
    const currentAssignmentRaw = territoryAssignments.find(a => !a.completion_date);
    const historyRaw = territoryAssignments.filter(a => a.completion_date);

    const currentAssignment = currentAssignmentRaw && currentAssignmentRaw.publisher_id
      ? {
          publisherName: publisherMap.get(currentAssignmentRaw.publisher_id) || 'Unknown',
          startDate: new Date(currentAssignmentRaw.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          notes: currentAssignmentRaw.notes || undefined,
        }
      : undefined;

    const history = historyRaw
      .map(h => h.publisher_id ? ({
          publisherName: publisherMap.get(h.publisher_id) || 'Unknown',
          startDate: new Date(h.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          completionDate: h.completion_date ? new Date(h.completion_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
          notes: h.notes || undefined,
      }) : null)
      .filter(Boolean) as TerritoryWithDetails['history'];

    return {
      ...t,
      currentAssignment,
      history,
    };
  });
};


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

const TerritoryCard: React.FC<{ territory: Territory; onClick: () => void }> = ({ territory, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-zinc-900 rounded-2xl p-6 text-left w-full transition-all duration-300 hover:bg-zinc-800/50 hover:shadow-lg hover:shadow-lime-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-lime-500"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-zinc-100">{territory.name}</h3>
          <p className="text-sm text-zinc-400 mt-1">{territory.kdl}</p>
        </div>
        <StatusBadge status={territory.status} />
      </div>
    </button>
  );
};

interface FilterDropdownProps {
  activeStatusFilters: TerritoryStatus[];
  setActiveStatusFilters: React.Dispatch<React.SetStateAction<TerritoryStatus[]>>;
  activeKdlFilters: string[];
  setActiveKdlFilters: React.Dispatch<React.SetStateAction<string[]>>;
  kdlOptions: string[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ activeStatusFilters, setActiveStatusFilters, activeKdlFilters, setActiveKdlFilters, kdlOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = Object.values(TerritoryStatus);
  const totalFilters = activeStatusFilters.length + activeKdlFilters.length;

  const toggleStatusFilter = (status: TerritoryStatus) => {
    setActiveStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  
  const toggleKdlFilter = (kdl: string) => {
    setActiveKdlFilters(prev => 
      prev.includes(kdl) ? prev.filter(s => s !== kdl) : [...prev, kdl]
    );
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full text-zinc-300 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-lime-500"
        aria-label="Filter"
      >
        <FilterIcon className="w-5 h-5" />
        {totalFilters > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime-500 text-xs font-bold text-zinc-900">
            {totalFilters}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10 p-2">
           <div className="px-2 pt-2">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">Status</h4>
            {statuses.map(status => (
              <label key={status} className="flex items-center space-x-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeStatusFilters.includes(status)}
                  onChange={() => toggleStatusFilter(status)}
                  className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-lime-500 focus:ring-lime-500"
                />
                <span className="text-zinc-200 text-sm">{status}</span>
              </label>
            ))}
          </div>

          {kdlOptions.length > 0 && (
            <>
              <div className="border-t border-zinc-800 my-2"></div>
              <div className="px-2 pb-2">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">KDL</h4>
                {kdlOptions.map(kdl => (
                  <label key={kdl} className="flex items-center space-x-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeKdlFilters.includes(kdl)}
                      onChange={() => toggleKdlFilter(kdl)}
                      className="h-4 w-4 rounded bg-zinc-700 border-zinc-600 text-lime-500 focus:ring-lime-500"
                    />
                    <span className="text-zinc-200 text-sm">{kdl}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const TerritoryListPage: React.FC<TerritoryListPageProps> = ({ territories, publishers, assignments, loading, refreshData, searchQuery, onEditTerritory }) => {
  const [activeStatusFilters, setActiveStatusFilters] = useState<TerritoryStatus[]>([]);
  const [activeKdlFilters, setActiveKdlFilters] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryWithDetails | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [territoryToAssign, setTerritoryToAssign] = useState<TerritoryWithDetails | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [territoryToComplete, setTerritoryToComplete] = useState<TerritoryWithDetails | null>(null);

  const territoriesWithDetails = useMemo(() => combineData(territories, publishers, assignments), [territories, publishers, assignments]);

  const filteredTerritories = useMemo(() => territoriesWithDetails.filter(territory => {
    const searchMatch = territory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      territory.kdl?.toLowerCase().includes(searchQuery.toLowerCase());
    const statusFilterMatch = activeStatusFilters.length === 0 || activeStatusFilters.includes(territory.status);
    const kdlFilterMatch = activeKdlFilters.length === 0 || activeKdlFilters.includes(territory.kdl);
    return searchMatch && statusFilterMatch && kdlFilterMatch;
  }), [territoriesWithDetails, searchQuery, activeStatusFilters, activeKdlFilters]);

  const sortedTerritories = useMemo(() => {
    return [...filteredTerritories].sort((a, b) => {
        const key = sortConfig.key as keyof Territory;
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'asc' ? valA.localeCompare(valB, 'id-ID') : valB.localeCompare(valA, 'id-ID');
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredTerritories, sortConfig]);

  const kdlOptions = useMemo(() => [...new Set(territories.map(t => t.kdl).filter(Boolean))], [territories]);

  const availablePublishers = useMemo(() => {
    const assignedPublisherIds = new Set(assignments.filter(a => !a.completion_date).map(a => a.publisher_id));
    return publishers.filter(p => !assignedPublisherIds.has(p.id));
  }, [publishers, assignments]);
  
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Nama' },
    { key: 'status', label: 'Status' },
    { key: 'kdl', label: 'KDL' },
  ];

  // --- Handlers ---
  const handleOpenEditModal = (territory: TerritoryWithDetails) => {
    setSelectedTerritory(null);
    onEditTerritory(territory);
  };

  const handleOpenAssignModal = (territory: TerritoryWithDetails) => {
    setSelectedTerritory(null);
    setTerritoryToAssign(territory);
    setIsAssignModalOpen(true);
  };
  
  const handleOpenCompleteModal = (territory: TerritoryWithDetails) => {
    setSelectedTerritory(null);
    setTerritoryToComplete(territory);
    setIsCompleteModalOpen(true);
  };

  const handleAssignPublisher = async (assignment: { publisherId: number; startDate: string; notes?: string }) => {
    if (!territoryToAssign) return;

    // 1. Create new assignment
    const { error: assignError } = await supabase.from('assignments').insert({
        territory_id: territoryToAssign.id,
        publisher_id: assignment.publisherId,
        start_date: assignment.startDate,
        notes: assignment.notes,
    });
    if (assignError) { console.error("Error creating assignment:", assignError.message || assignError); return; }

    // 2. Update territory status
    const { error: updateError } = await supabase.from('territories').update({ status: TerritoryStatus.InProgress }).eq('id', territoryToAssign.id);
    if (updateError) { console.error("Error updating territory status:", updateError.message || updateError); }
    
    await refreshData();
    setIsAssignModalOpen(false);
  };

  const handleCompleteAssignment = async (completion: { completionDate: string; notes?: string }) => {
    if (!territoryToComplete) return;

    // 1. Find the current open assignment
    const { data: currentAssignment, error: findError } = await supabase
        .from('assignments')
        .select('id')
        .eq('territory_id', territoryToComplete.id)
        .is('completion_date', null)
        .single();
    
    if (findError || !currentAssignment) { console.error("Could not find open assignment to complete", findError?.message || findError); return; }

    // 2. Update the assignment
    const { error: updateAssignError } = await supabase
        .from('assignments')
        .update({ completion_date: completion.completionDate, notes: completion.notes })
        .eq('id', currentAssignment.id);
    if (updateAssignError) { console.error("Error updating assignment:", updateAssignError.message || updateAssignError); return; }

    // 3. Update territory status
    const { error: updateTerritoryError } = await supabase
        .from('territories')
        .update({ status: TerritoryStatus.Completed })
        .eq('id', territoryToComplete.id);
    if (updateTerritoryError) { console.error("Error updating territory status:", updateTerritoryError.message || updateTerritoryError); }

    await refreshData();
    setIsCompleteModalOpen(false);
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-end gap-2 mb-8">
          <SortDropdown options={sortOptions} sortConfig={sortConfig} onSortChange={setSortConfig} />
          <FilterDropdown 
            activeStatusFilters={activeStatusFilters} 
            setActiveStatusFilters={setActiveStatusFilters}
            activeKdlFilters={activeKdlFilters}
            setActiveKdlFilters={setActiveKdlFilters} 
            kdlOptions={kdlOptions}
          />
        </div>
        {loading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[...Array(5)].map((_, i) => <TerritoryCardSkeleton key={i} />)}
          </div>
        ) : sortedTerritories.length > 0 ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {sortedTerritories.map((territory) => (
              <TerritoryCard key={territory.id} territory={territory} onClick={() => setSelectedTerritory(territory)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-500">Tidak ada daerah yang cocok dengan kriteria Anda.</p>
          </div>
        )}
      </div>
      
      {selectedTerritory && (
        <TerritoryDetailModal 
          territory={selectedTerritory} 
          onClose={() => setSelectedTerritory(null)} 
          onEdit={handleOpenEditModal}
          onAssign={handleOpenAssignModal}
          onComplete={handleOpenCompleteModal}
        />
      )}

      {isAssignModalOpen && territoryToAssign && (
        <AssignPublisherModal
          territory={territoryToAssign}
          availablePublishers={availablePublishers}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={handleAssignPublisher}
        />
      )}

      {isCompleteModalOpen && territoryToComplete && (
        <CompleteAssignmentModal
            territory={territoryToComplete}
            onClose={() => setIsCompleteModalOpen(false)}
            onComplete={handleCompleteAssignment}
        />
      )}
    </>
  );
};

export default TerritoryListPage;