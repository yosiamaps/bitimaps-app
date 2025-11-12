import React, { useState, useMemo } from 'react';
import { Publisher, Territory, Assignment, PublisherWithDetails, PublisherHistoryEntry } from '../types';
import { FilterIcon } from '../components/icons/FilterIcon';
import PublisherListItemSkeleton from '../components/PublisherListItemSkeleton';
import SortDropdown, { SortConfig, SortOption } from '../components/SortDropdown';
import PublisherDetailModal from '../components/PublisherDetailModal';
import SearchInput from '../components/SearchInput';

interface PublisherListPageProps {
  publishers: Publisher[];
  territories: Territory[];
  assignments: Assignment[];
  loading: boolean;
  refreshData: () => Promise<void>;
  onEditPublisher: (publisher: Publisher) => void;
  onDeletePublisher: (publisher: Publisher) => void;
}

// Helper to combine data for publisher details
const combinePublisherData = (
  publishers: Publisher[],
  territories: Territory[],
  assignments: Assignment[]
): PublisherWithDetails[] => {
  const territoryMap = new Map(territories.map(t => [t.id, t]));

  return publishers.map(p => {
    const publisherAssignments = assignments.filter(a => a.publisher_id === p.id);
    
    const currentAssignmentRaw = publisherAssignments.find(a => !a.completion_date);
    const historyRaw = publisherAssignments
      .filter(a => a.completion_date)
      .sort((a,b) => new Date(b.completion_date!).getTime() - new Date(a.completion_date!).getTime());

    const currentAssignment = (() => {
      if (currentAssignmentRaw?.territory_id) {
        const territory = territoryMap.get(currentAssignmentRaw.territory_id);
        if (territory) {
          return {
            territoryName: territory.name,
            startDate: new Date(currentAssignmentRaw.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            notes: currentAssignmentRaw.notes || undefined,
            gmaps_link: territory.gmaps_link || undefined,
          };
        }
      }
      return undefined;
    })();

    const history = historyRaw
      .map(h => {
        if (h.territory_id) {
          const territory = territoryMap.get(h.territory_id);
          if (territory) {
            return {
                territoryName: territory.name,
                startDate: new Date(h.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                completionDate: h.completion_date ? new Date(h.completion_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
                notes: h.notes || undefined,
            };
          }
        }
        return null;
      })
      .filter(Boolean) as PublisherHistoryEntry[];

    return {
      ...p,
      currentAssignment,
      history,
    };
  });
};


const PublisherListItem: React.FC<{ publisher: PublisherWithDetails; onClick: () => void; }> = ({ publisher, onClick }) => {
  return (
    <li 
      onClick={onClick}
      className="bg-zinc-900 p-5 rounded-2xl shadow-sm flex justify-between items-center transition-transform duration-200 hover:scale-[1.02] cursor-pointer group"
    >
      <div>
        <h3 className="font-semibold text-zinc-100">{publisher.name}</h3>
        <p className="text-sm text-zinc-400">KDL: {publisher.group}</p>
      </div>
      <div className="flex items-center gap-4">
        {publisher.currentAssignment ? (
          <span className="text-sm font-medium text-lime-400">{publisher.currentAssignment.territoryName}</span>
        ) : (
          <span className="text-sm text-zinc-500 italic">Tidak ada daerah</span>
        )}
      </div>
    </li>
  );
};


interface FilterDropdownProps {
  activeKdlFilters: string[];
  setActiveKdlFilters: React.Dispatch<React.SetStateAction<string[]>>;
  kdlOptions: string[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ activeKdlFilters, setActiveKdlFilters, kdlOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalFilters = activeKdlFilters.length;

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
        </div>
      )}
    </div>
  );
}

const PublisherListPage: React.FC<PublisherListPageProps> = ({ publishers, territories, assignments, loading, refreshData, onEditPublisher, onDeletePublisher }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKdlFilters, setActiveKdlFilters] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherWithDetails | null>(null);
  
  const publishersWithDetails = useMemo(() => {
    return combinePublisherData(publishers, territories, assignments);
  }, [publishers, territories, assignments]);

  const kdlOptions = useMemo(() => [...new Set(publishers.map(p => p.group).filter(Boolean).sort())], [publishers]);

  const filteredPublishers = useMemo(() => publishersWithDetails.filter(publisher => {
    const searchMatch = publisher.name.toLowerCase().includes(searchQuery.toLowerCase());
    const kdlFilterMatch = activeKdlFilters.length === 0 || activeKdlFilters.includes(publisher.group);
    return searchMatch && kdlFilterMatch;
  }), [publishersWithDetails, searchQuery, activeKdlFilters]);
  
  const sortedPublishers = useMemo(() => {
    return [...filteredPublishers].sort((a, b) => {
        const key = sortConfig.key as keyof Publisher;
        const valA = a[key] ?? '';
        const valB = b[key] ?? '';

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'asc' ? valA.localeCompare(valB, 'id-ID') : valB.localeCompare(valA, 'id-ID');
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredPublishers, sortConfig]);
  
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Nama' },
    { key: 'group', label: 'KDL' },
  ];
  
  const handleOpenEditModal = (publisher: Publisher) => {
    setSelectedPublisher(null);
    onEditPublisher(publisher);
  };
  
  const handleOpenDeleteModal = (publisher: Publisher) => {
    setSelectedPublisher(null);
    onDeletePublisher(publisher);
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between gap-2 mb-8">
          <div className="flex-grow">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama penyiar..."
            />
          </div>
          <SortDropdown options={sortOptions} sortConfig={sortConfig} onSortChange={setSortConfig} />
          <FilterDropdown 
                activeKdlFilters={activeKdlFilters}
                setActiveKdlFilters={setActiveKdlFilters}
                kdlOptions={kdlOptions}
            />
        </div>
        {loading ? (
          <ul className="space-y-4">
            {[...Array(5)].map((_, i) => <PublisherListItemSkeleton key={i} />)}
          </ul>
        ) : sortedPublishers.length > 0 ? (
          <ul className="space-y-4">
            {sortedPublishers.map((publisher) => (
              <PublisherListItem 
                key={publisher.id} 
                publisher={publisher}
                onClick={() => setSelectedPublisher(publisher)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-500">Tidak ada penyiar yang cocok dengan kriteria Anda.</p>
          </div>
        )}
      </div>

      {selectedPublisher && (
        <PublisherDetailModal
          publisher={selectedPublisher}
          onClose={() => setSelectedPublisher(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      )}
    </>
  );
};

export default PublisherListPage;