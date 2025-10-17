import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Content from './pages/Content';
import Sites from './pages/Sites';
import Mappings from './pages/Mappings';
import Jobs from './pages/Jobs';
import { executeSyncJob } from './lib/syncEngine';
import { handleDestinationRequest } from './lib/mockDestination';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const handleDestination = async (e: MessageEvent) => {
      if (e.data.type === 'DESTINATION_REQUEST') {
        const { siteSlug, payload, signature } = e.data;
        const result = await handleDestinationRequest(siteSlug, payload, signature);
        window.postMessage({ type: 'DESTINATION_RESPONSE', result }, '*');
      }
    };

    window.addEventListener('message', handleDestination);
    return () => window.removeEventListener('message', handleDestination);
  }, []);

  const handleRunSync = async () => {
    if (!profile) return;

    const jobs = await fetch('/api/sync-jobs').then(r => r.json());
    const latestJob = jobs[0];

    if (latestJob) {
      executeSyncJob(latestJob.id, profile.organization_id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggle={() => setAuthMode('signup')} />
    ) : (
      <Signup onToggle={() => setAuthMode('login')} />
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && (
        <Dashboard onNavigate={setCurrentPage} onRunSync={handleRunSync} />
      )}
      {currentPage === 'content' && <Content />}
      {currentPage === 'sites' && <Sites />}
      {currentPage === 'mappings' && <Mappings />}
      {currentPage === 'jobs' && <Jobs />}
    </Layout>
  );
}

export default App;
