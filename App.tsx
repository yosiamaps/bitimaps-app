import React, { useState, useEffect, useCallback } from 'react';
import FloatingNav from './components/FloatingNav';
import TerritoryListPage from './pages/TerritoryListPage';
import PublisherListPage from './pages/PublisherListPage';
import DashboardPage from './pages/DashboardPage';
import LoginScreen from './components/LoginScreen';
import { Page, Territory, Publisher, Assignment } from './types';
import { supabase } from './lib/supabaseClient';
import { LoaderIcon } from './components/icons/LoaderIcon';

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
        return <TerritoryListPage {...pageProps} />;
      case 'publishers':
        return <PublisherListPage {...pageProps} />;
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
      <FloatingNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;