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
import { Sparkle } from '@phosphor-icons/react';

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
      <div className="min-h-screen bg-slate-50 gradient-mesh flex items-center justify-center">
        <div className="text-center animate-scale-in">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-50 animate-pulse-glow"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto animate-float">
              <Sparkle className="w-12 h-12 text-white" weight="bold" />
            </div>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-gradient-primary mb-3">DataSync</h2>
          <p className="text-slate-600 mb-6">Loading your workspace...</p>

          {/* Loading Spinner */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
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
