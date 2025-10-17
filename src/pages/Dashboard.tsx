import { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  Sparkle,
  FileText,
  Globe,
  GitBranch,
  TrendUp,
  CircleNotch,
  Lightning
} from '@phosphor-icons/react';
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
        return <CheckCircle className="w-5 h-5 text-emerald-600" weight="bold" />;
      case 'partial':
        return <Warning className="w-5 h-5 text-amber-600" weight="bold" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" weight="bold" />;
      case 'running':
        return <CircleNotch className="w-5 h-5 text-indigo-600 animate-spin" weight="bold" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" weight="bold" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      partial: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      running: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      queued: 'bg-slate-100 text-slate-800 border-slate-200',
    }[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${classes}`}>
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
      {/* Demo Data Banner */}
      {!hasData && (
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center">
                <Sparkle className="w-6 h-6 text-white" weight="bold" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Get Started with Demo Data</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Load sample content, sites, and mappings to see DataSync in action. This creates an "Acme Holdings" demo with 3 sites, offer banners, and pre-configured mappings.
              </p>
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="btn-primary"
              >
                <Sparkle className="w-4 h-4 mr-2" weight="bold" />
                {seeding ? 'Loading Demo Data...' : 'Load Demo Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm font-normal">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <span className="text-sm font-medium">Import Data</span>
          </button>
          <button
            onClick={handleRunSync}
            disabled={syncing}
            className="btn-primary"
          >
            {syncing ? (
              <>
                <CircleNotch className="w-4 h-4 mr-2 animate-spin" weight="bold" />
                <span className="text-sm font-medium">Starting Sync...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" weight="fill" />
                <span className="text-sm font-medium">Run Sync</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Content Card */}
        <button
          onClick={() => onNavigate('content')}
          className="card hover:shadow-md transition-all text-left p-6 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <FileText className="w-6 h-6 text-white" weight="bold" />
            </div>
            <TrendUp className="w-5 h-5 text-gray-400" weight="bold" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1 tracking-tight">Manage Content</h3>
          <p className="text-sm text-gray-500 font-normal leading-relaxed">Create and organize content types and items</p>
        </button>

        {/* Sites Card */}
        <button
          onClick={() => onNavigate('sites')}
          className="card hover:shadow-md transition-all text-left p-6 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Globe className="w-6 h-6 text-white" weight="bold" />
            </div>
            <Lightning className="w-5 h-5 text-gray-400" weight="bold" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1 tracking-tight">Manage Sites</h3>
          <p className="text-sm text-gray-500 font-normal leading-relaxed">Configure destination sites and credentials</p>
        </button>

        {/* Mappings Card */}
        <button
          onClick={() => onNavigate('mappings')}
          className="card hover:shadow-md transition-all text-left p-6 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <GitBranch className="w-6 h-6 text-white" weight="bold" />
            </div>
            <CircleNotch className="w-5 h-5 text-gray-400" weight="bold" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1 tracking-tight">Configure Mappings</h3>
          <p className="text-sm text-gray-500 font-normal leading-relaxed">Control which content goes to which sites</p>
        </button>
      </div>

      {/* Recent Sync Jobs */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Recent Sync Jobs</h2>
            <button
              onClick={() => onNavigate('jobs')}
              className="text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-sm">Loading sync jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" weight="bold" />
              </div>
              <p className="text-gray-900 font-semibold mb-1 text-sm">No sync jobs yet</p>
              <p className="text-sm text-gray-500 font-normal">Click "Run Sync" to get started</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(job.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(job.status)}
                        {job.trigger === 'cron' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <Clock className="w-3 h-3 mr-1" weight="bold" />
                            auto
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 font-normal">
                        {new Date(job.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  {formatDuration(job.started_at, job.completed_at) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Lightning className="w-4 h-4 text-gray-400" weight="bold" />
                      <span className="font-semibold text-gray-700">
                        {formatDuration(job.started_at, job.completed_at)}
                      </span>
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
