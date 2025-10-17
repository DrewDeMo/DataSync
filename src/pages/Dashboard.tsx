import { useState, useEffect } from 'react';
import { Play, Clock, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { getSyncJobs, getSites } from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { seedDemoData } from '../lib/seed';

type SyncJob = {
  id: string;
  status: 'queued' | 'running' | 'success' | 'partial' | 'failed';
  trigger: 'manual' | 'cron';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export default function Dashboard({ onNavigate, onRunSync }: { onNavigate: (page: string) => void; onRunSync: () => void }) {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [hasData, setHasData] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadJobs();
    checkForData();
  }, []);

  const checkForData = async () => {
    try {
      const sites = await getSites();
      setHasData(sites.length > 0);
    } catch (error) {
      console.error('Error checking data:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await getSyncJobs(5);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSync = async () => {
    if (!profile) return;
    setSyncing(true);

    try {
      const { data: job, error } = await supabase
        .from('sync_jobs')
        .insert({
          organization_id: profile.organization_id,
          status: 'queued',
          trigger: 'manual',
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      onRunSync();
      await loadJobs();
    } catch (error) {
      console.error('Error creating sync job:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSeedData = async () => {
    if (!profile) return;
    setSeeding(true);

    try {
      await seedDemoData(profile.id, profile.organization_id);
      setHasData(true);
      window.location.reload();
    } catch (error) {
      console.error('Error seeding data:', error);
    } finally {
      setSeeding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      success: 'bg-green-100 text-green-800',
      partial: 'bg-amber-100 text-amber-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      queued: 'bg-slate-100 text-slate-800',
    }[status] || 'bg-slate-100 text-slate-800';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
        {status}
      </span>
    );
  };

  const formatDuration = (started: string | null, completed: string | null) => {
    if (!started || !completed) return null;
    const ms = new Date(completed).getTime() - new Date(started).getTime();
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-8">
      {!hasData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Sparkles className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Get Started with Demo Data</h3>
              <p className="text-blue-800 mb-4">
                Load sample content, sites, and mappings to see DataSync in action. This creates an "Acme Holdings" demo with 3 sites, offer banners, and pre-configured mappings.
              </p>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {seeding ? 'Loading...' : 'Load Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage and monitor your content synchronization</p>
        </div>
        <button
          onClick={handleRunSync}
          disabled={syncing}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 mr-2" />
          {syncing ? 'Starting...' : 'Run Sync'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('content')}
          className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <span className="text-2xl group-hover:text-white">📝</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Content</h3>
          <p className="text-sm text-slate-600">Create and organize content types and items</p>
        </button>

        <button
          onClick={() => onNavigate('sites')}
          className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-green-500 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <span className="text-2xl group-hover:text-white">🌐</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Sites</h3>
          <p className="text-sm text-slate-600">Configure destination sites and credentials</p>
        </button>

        <button
          onClick={() => onNavigate('mappings')}
          className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-purple-500 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <span className="text-2xl group-hover:text-white">🔀</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Configure Mappings</h3>
          <p className="text-sm text-slate-600">Control which content goes to which sites</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Sync Jobs</h2>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-600">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No sync jobs yet</p>
              <p className="text-sm text-slate-500 mt-1">Click "Run Sync" to get started</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(job.status)}
                        {job.trigger === 'cron' && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            auto
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        {new Date(job.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {formatDuration(job.started_at, job.completed_at) && (
                    <div className="text-sm text-slate-500">
                      {formatDuration(job.started_at, job.completed_at)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
