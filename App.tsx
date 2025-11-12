import React, { useState, useEffect, useCallback } from 'react';
import FloatingNav from './components/FloatingNav';
import TerritoryListPage from './pages/TerritoryListPage';
import PublisherListPage from './pages/PublisherListPage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import LoginScreen from './components/LoginScreen';
import { Page, Territory, Publisher, Assignment } from './types';
import { supabase } from './lib/supabaseClient';
import { LoaderIcon } from './components/icons/LoaderIcon';
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
  
  // Modal States
  const [isTerritoryFormModalOpen, setIsTerritoryFormModalOpen] = useState(false);
  const [territoryToEdit, setTerritoryToEdit] = useState<Territory | null>(null);
  const [isPublisherFormModalOpen, setIsPublisherFormModalOpen] = useState(false);
  const [publisherToEdit, setPublisherToEdit] = useState<Publisher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'territory' | 'publisher', data: Territory | Publisher } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);


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
    setIsActionLoading(true);
    try {
      const dataToSave = {
        name: territoryData.name,
        kdl: territoryData.kdl,
        gmaps_link: territoryData.gmaps_link,
      };

      const { error } = territoryToEdit
        ? await supabase.from('territories').update(dataToSave).eq('id', territoryToEdit.id)
        : await supabase.from('territories').insert(dataToSave);

      if (error) throw error;
      
      await fetchData(true);
    } catch (error: any) {
      console.error("Error saving territory:", error.message || error);
    } finally {
      setIsTerritoryFormModalOpen(false);
      setTerritoryToEdit(null);
      setIsActionLoading(false);
    }
  };

  const handleSavePublisher = async (publisherData: Omit<Publisher, 'id'>) => {
    setIsActionLoading(true);
    try {
      const dataToSave = { name: publisherData.name, group: publisherData.group };

      const { error } = publisherToEdit
        ? await supabase.from('publishers').update(dataToSave).eq('id', publisherToEdit.id)
        : await supabase.from('publishers').insert(dataToSave);
      
      if (error) throw error;

      await fetchData(true);
    } catch (error: any) {
      console.error("Error saving publisher:", error.message || error);
    } finally {
      setIsPublisherFormModalOpen(false);
      setPublisherToEdit(null);
      setIsActionLoading(false);
    }
  };

  const handleDeleteRequest = (item: { type: 'territory' | 'publisher', data: Territory | Publisher }) => {
    setItemToDelete(item);
    setIsTerritoryFormModalOpen(false);
    setIsPublisherFormModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsActionLoading(true);

    try {
      const { type, data } = itemToDelete;
      const fromTable = type === 'territory' ? 'territories' : 'publishers';
      const { error } = await supabase.from(fromTable).delete().eq('id', data.id);
      if (error) throw error;

      await fetchData(true);
    } catch (error: any) {
      console.error(`Error deleting ${itemToDelete.type}:`, error.message || error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      setIsActionLoading(false);
    }
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

    // This switch statement correctly routes to the appropriate page component
    // based on the activePage state. The 'reports' case ensures the ReportsPage
    // is rendered when selected. The issue on the live site is likely an older
    // version of this file where this case was missing.
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage {...pageProps} />;
      case 'territories':
        return <TerritoryListPage 
          {...pageProps} 
          onEditTerritory={handleOpenEditTerritory}
        />;
      case 'publishers':
        return <PublisherListPage 
          {...pageProps}
          onEditPublisher={handleOpenEditPublisher}
          onDeletePublisher={(publisher) => handleDeleteRequest({ type: 'publisher', data: publisher })}
        />;
      case 'reports':
        return <ReportsPage {...pageProps} />;
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
      
      <FloatingNav 
        activePage={activePage} 
        setActivePage={setActivePage}
        onAddClick={handleAddClick} 
      />

      {/* Modals */}
      {isTerritoryFormModalOpen && (
        <TerritoryFormModal
          isSubmitting={isActionLoading}
          territoryToEdit={territoryToEdit}
          onClose={() => setIsTerritoryFormModalOpen(false)}
          onSave={handleSaveTerritory}
          onDelete={(territory) => handleDeleteRequest({ type: 'territory', data: territory })}
        />
      )}
      
      {isPublisherFormModalOpen && (
        <PublisherFormModal
          isSubmitting={isActionLoading}
          publisherToEdit={publisherToEdit}
          onClose={() => setIsPublisherFormModalOpen(false)}
          onSave={handleSavePublisher}
        />
      )}

      {isDeleteModalOpen && itemToDelete && (
        <ConfirmationModal
          isSubmitting={isActionLoading}
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