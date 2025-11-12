import React, { useState, useEffect, useCallback } from 'react';
import FloatingNav from './components/FloatingNav';
import TerritoryListPage from './pages/TerritoryListPage';
import PublisherListPage from './pages/PublisherListPage';
import DashboardPage from './pages/DashboardPage';
import LoginScreen from './components/LoginScreen';
import { Page, Territory, Publisher, Assignment } from './types';
import { supabase } from './lib/supabaseClient';
import { LoaderIcon } from './components/icons/LoaderIcon';
import BottomActionBar from './components/BottomActionBar';
import TerritoryFormModal from './components/TerritoryFormModal';
import PublisherFormModal from './components/PublisherFormModal';
import ConfirmationModal from './components/ConfirmationModal';

const PULL_THRESHOLD = 80; // Pixels to pull down to trigger refresh

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Centralized data state
  const [loading, setLoading] = useState(true);
  const [allTerritories, setAllTerritories] = useState<Territory[]>([]);
  const [allPublishers, setAllPublishers] = useState<Publisher[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  
  // Pull to refresh state
  const [pullStart, setPullStart] = useState<number | null>(null);
  const [pullPosition, setPullPosition] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Centralized UI state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isTerritoryFormModalOpen, setIsTerritoryFormModalOpen] = useState(false);
  const [territoryToEdit, setTerritoryToEdit] = useState<Territory | null>(null);
  const [isPublisherFormModalOpen, setIsPublisherFormModalOpen] = useState(false);
  const [publisherToEdit, setPublisherToEdit] = useState<Publisher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'territory' | 'publisher', data: Territory | Publisher } | null>(null);


  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data: territoriesData, error: territoriesError } = await supabase.from('territories').select('*');
      if (territoriesError) throw territoriesError;

      const { data: publishersData, error: publishersError } = await supabase.from('publishers').select('*');
      if (publishersError) throw publishersError;

      const { data: assignmentsData, error: assignmentsError } = await supabase.from('assignments').select('*');
      if (assignmentsError) throw assignmentsError;

      setAllTerritories(territoriesData || []);
      setAllPublishers(publishersData || []);
      setAllAssignments(assignmentsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error.message || error);
    } finally {
      if (isRefresh) {
        setTimeout(() => { // small delay for animation
          setIsRefreshing(false);
          setPullPosition(0);
        }, 500);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);
  
  // Reset search on page change
  useEffect(() => {
    setSearchQuery('');
  }, [activePage]);

  // Pull to refresh handlers wrapped in useCallback
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY);
    } else {
      setPullStart(null);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!pullStart || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    let distance = currentY - pullStart;
    
    if (distance > 0) {
      e.preventDefault(); // This will now work correctly
      const newPosition = Math.min(distance / 2, PULL_THRESHOLD + 20);
      setPullPosition(newPosition);
    }
  }, [pullStart, isRefreshing]);
  
  const handleTouchEnd = useCallback(() => {
    if (pullStart === null) return;

    if (pullPosition > PULL_THRESHOLD) {
      fetchData(true);
    } else {
      setPullPosition(0);
    }
    setPullStart(null);
  }, [pullStart, pullPosition, fetchData]);

  // Effect to add/remove event listeners manually
  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false }); // Explicitly set passive to false
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  // --- Modal Handlers ---
  const handleAddClick = () => {
    if (activePage === 'territories') {
      setTerritoryToEdit(null);
      setIsTerritoryFormModalOpen(true);
    } else if (activePage === 'publishers') {
      setPublisherToEdit(null);
      setIsPublisherFormModalOpen(true);
    }
  };

  const handleOpenEditTerritory = (territory: Territory) => {
    setTerritoryToEdit(territory);
    setIsTerritoryFormModalOpen(true);
  };

  const handleOpenEditPublisher = (publisher: Publisher) => {
    setPublisherToEdit(publisher);
    setIsPublisherFormModalOpen(true);
  };

  const handleSaveTerritory = async (territoryData: Pick<Territory, 'name' | 'kdl' | 'gmaps_link'>) => {
    const dataToSave = {
      name: territoryData.name,
      kdl: territoryData.kdl,
      gmaps_link: territoryData.gmaps_link,
    };

    const { error } = territoryToEdit
      ? await supabase.from('territories').update(dataToSave).eq('id', territoryToEdit.id)
      : await supabase.from('territories').insert(dataToSave);

    if (error) console.error("Error saving territory:", error.message || error);
    else await fetchData(true);
    setIsTerritoryFormModalOpen(false);
    setTerritoryToEdit(null);
  };

  const handleSavePublisher = async (publisherData: Omit<Publisher, 'id'>) => {
    const dataToSave = { name: publisherData.name, group: publisherData.group };

    const { error } = publisherToEdit
      ? await supabase.from('publishers').update(dataToSave).eq('id', publisherToEdit.id)
      : await supabase.from('publishers').insert(dataToSave);

    if (error) console.error("Error saving publisher:", error.message || error);
    else await fetchData(true);

    setIsPublisherFormModalOpen(false);
    setPublisherToEdit(null);
  };

  const handleDeleteRequest = (item: { type: 'territory' | 'publisher', data: Territory | Publisher }) => {
    setItemToDelete(item);
    setIsTerritoryFormModalOpen(false);
    setIsPublisherFormModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    const { type, data } = itemToDelete;
    const fromTable = type === 'territory' ? 'territories' : 'publishers';

    const { error } = await supabase.from(fromTable).delete().eq('id', data.id);

    if (error) console.error(`Error deleting ${type}:`, error.message || error);
    else await fetchData(true);

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };


  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    const pageProps = {
      territories: allTerritories,
      publishers: allPublishers,
      assignments: allAssignments,
      loading: loading,
      refreshData: () => fetchData(true),
    };

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage {...pageProps} />;
      case 'territories':
        return <TerritoryListPage 
          {...pageProps} 
          searchQuery={searchQuery}
          onEditTerritory={handleOpenEditTerritory}
        />;
      case 'publishers':
        return <PublisherListPage 
          {...pageProps}
          searchQuery={searchQuery}
          onEditPublisher={handleOpenEditPublisher}
          onDeletePublisher={(publisher) => handleDeleteRequest({ type: 'publisher', data: publisher })}
        />;
      default:
        return <DashboardPage {...pageProps} />;
    }
  };

  const transitionClass = pullStart === null ? 'transition-transform duration-300' : '';

  return (
    <div className="min-h-screen font-sans text-zinc-200">
      <div 
        className="fixed top-0 left-0 right-0 z-0 flex justify-center pt-4 transition-opacity duration-300"
        style={{ opacity: isRefreshing || pullPosition > 0 ? 1 : 0 }}
      >
        <LoaderIcon className={`w-6 h-6 text-lime-400 ${isRefreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullPosition * 2}deg)` }} />
      </div>
      <main 
        className={`pb-36 ${transitionClass}`}
        style={{ transform: `translateY(${pullPosition}px)`}}
      >
        {renderPage()}
      </main>
      
      {(activePage === 'territories' || activePage === 'publishers') && (
        <BottomActionBar
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onAddClick={handleAddClick}
          placeholder={activePage === 'territories' ? 'Cari daerah atau KDL...' : 'Cari nama penyiar...'}
        />
      )}

      <FloatingNav activePage={activePage} setActivePage={setActivePage} />

      {/* Modals */}
      {isTerritoryFormModalOpen && (
        <TerritoryFormModal
          territoryToEdit={territoryToEdit}
          onClose={() => setIsTerritoryFormModalOpen(false)}
          onSave={handleSaveTerritory}
          onDelete={(territory) => handleDeleteRequest({ type: 'territory', data: territory })}
        />
      )}
      
      {isPublisherFormModalOpen && (
        <PublisherFormModal
          publisherToEdit={publisherToEdit}
          onClose={() => setIsPublisherFormModalOpen(false)}
          onSave={handleSavePublisher}
        />
      )}

      {isDeleteModalOpen && itemToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Hapus ${itemToDelete.type === 'territory' ? 'Daerah' : 'Penyiar'}`}
          message={`Apakah Anda yakin ingin menghapus "${itemToDelete.data.name}"? Aksi ini tidak dapat dibatalkan.`}
        />
      )}
    </div>
  );
};

export default App;