import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Warning,
  CaretRight,
  CircleNotch,
  Lightning,
  Terminal
} from '@phosphor-icons/react';
import { getSyncJobs, getSyncJob, getJobLogs } from '../lib/api';

type SyncJob = {
  id: string;
  status: 'queued' | 'running' | 'success' | 'partial' | 'failed';
  trigger: 'manual' | 'cron';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type JobLog = {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  site_id: string | null;
  sites?: { name: string };
  content_item_id: string | null;
  content_items?: { title: string };
  payload: any | null;
  created_at: string;
};

export default function Jobs() {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await getSyncJobs(20);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = async (job: SyncJob) => {
    setSelectedJob(job);
    setLogsLoading(true);
    try {
      const logsData = await getJobLogs(job.id);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLogsLoading(false);
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

  const getLevelBadge = (level: string) => {
    const classes = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warn: 'bg-amber-100 text-amber-800 border-amber-200',
      error: 'bg-red-100 text-red-800 border-red-200',
    }[level] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${classes}`}>
        {level}
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
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gradient-primary">Sync Jobs</h1>
        <p className="text-slate-600 text-lg">View job history and execution logs</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job History */}
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" weight="bold" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Job History</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto scrollbar-thin">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-400" weight="bold" />
                </div>
                <p className="text-slate-900 font-semibold mb-1">No jobs yet</p>
                <p className="text-sm text-slate-500">Run a sync to see job history</p>
              </div>
            ) : (
              jobs.map((job, index) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`w-full px-6 py-4 hover:bg-slate-50 transition-all text-left group animate-slide-up ${selectedJob?.id === job.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(job.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(job.status)}
                          {job.trigger === 'cron' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <Clock className="w-3 h-3 mr-1" weight="bold" />
                              auto
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
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
                    <div className="flex items-center space-x-3">
                      {formatDuration(job.started_at, job.completed_at) && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Lightning className="w-4 h-4 text-slate-400" weight="bold" />
                          <span className="font-semibold text-slate-700">
                            {formatDuration(job.started_at, job.completed_at)}
                          </span>
                        </div>
                      )}
                      <CaretRight className={`w-5 h-5 text-slate-400 transition-transform ${selectedJob?.id === job.id ? 'rotate-90' : ''
                        }`} weight="bold" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Job Logs */}
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Terminal className="w-5 h-5 text-white" weight="bold" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Job Logs</h2>
            </div>
          </div>
          <div className="p-4 max-h-[600px] overflow-auto bg-slate-900 scrollbar-thin">
            {!selectedJob ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Terminal className="w-8 h-8 text-slate-600" weight="bold" />
                </div>
                <p className="text-slate-400 font-semibold mb-1">No job selected</p>
                <p className="text-sm text-slate-500">Select a job to view logs</p>
              </div>
            ) : logsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-slate-400 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Terminal className="w-8 h-8 text-slate-600" weight="bold" />
                </div>
                <p className="text-slate-400 font-semibold mb-1">No logs available</p>
                <p className="text-sm text-slate-500">This job has no execution logs</p>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-sm">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                      <span className="text-slate-500 shrink-0 text-xs">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                      <span className={`shrink-0 font-bold text-xs ${log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-amber-400' :
                          'text-blue-400'
                        }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="flex-1 text-slate-100">{log.message}</span>
                    </div>
                    {log.sites && (
                      <div className="ml-6 mt-1 text-slate-500 text-xs flex items-center space-x-2">
                        <CaretRight className="w-3 h-3" weight="bold" />
                        <span>Site: <span className="text-slate-400 font-semibold">{log.sites.name}</span></span>
                      </div>
                    )}
                    {log.payload && (
                      <details className="ml-6 mt-2">
                        <summary className="text-slate-500 text-xs cursor-pointer hover:text-slate-400 transition-colors">
                          View payload →
                        </summary>
                        <pre className="mt-2 p-3 bg-slate-950 rounded-lg text-xs text-slate-400 overflow-auto border border-slate-800">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
