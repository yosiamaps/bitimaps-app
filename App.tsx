import React, { useState } from 'react';
import FloatingNav from './components/FloatingNav';
import TerritoryListPage from './pages/TerritoryListPage';
import PublisherListPage from './pages/PublisherListPage';
import DashboardPage from './pages/DashboardPage';
import LoginScreen from './components/LoginScreen';
import { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'territories':
        return <TerritoryListPage />;
      case 'publishers':
        return <PublisherListPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-zinc-200">
      <main className="pb-36">
        {renderPage()}
      </main>
      <FloatingNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;
