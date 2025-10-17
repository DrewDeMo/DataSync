import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
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

  const getLevelBadge = (level: string) => {
    const classes = {
      info: 'bg-blue-100 text-blue-800',
      warn: 'bg-amber-100 text-amber-800',
      error: 'bg-red-100 text-red-800',
    }[level] || 'bg-slate-100 text-slate-800';

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sync Jobs</h1>
          <p className="mt-2 text-slate-600">View job history and execution logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Job History</h2>
          </div>
          <div className="divide-y divide-slate-200 max-h-[600px] overflow-auto">
            {loading ? (
              <div className="px-6 py-8 text-center text-slate-600">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No jobs yet</p>
              </div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`w-full px-6 py-4 hover:bg-slate-50 transition-colors text-left ${
                    selectedJob?.id === job.id ? 'bg-blue-50' : ''
                  }`}
                >
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
                    <div className="flex items-center space-x-2">
                      {formatDuration(job.started_at, job.completed_at) && (
                        <div className="text-sm text-slate-500">
                          {formatDuration(job.started_at, job.completed_at)}
                        </div>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Job Logs</h2>
          </div>
          <div className="p-4 max-h-[600px] overflow-auto bg-slate-900">
            {!selectedJob ? (
              <div className="text-center py-12 text-slate-400">
                Select a job to view logs
              </div>
            ) : logsLoading ? (
              <div className="text-center py-12 text-slate-400">Loading logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No logs for this job</div>
            ) : (
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div key={log.id} className="text-slate-100">
                    <div className="flex items-start space-x-2">
                      <span className="text-slate-500 shrink-0">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                      <span className={
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-amber-400' :
                        'text-blue-400'
                      }>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                    {log.sites && (
                      <div className="ml-24 text-slate-500">→ Site: {log.sites.name}</div>
                    )}
                    {log.payload && (
                      <details className="ml-24 mt-1">
                        <summary className="text-slate-500 cursor-pointer hover:text-slate-400">
                          View payload
                        </summary>
                        <pre className="mt-2 text-xs text-slate-400 overflow-auto">
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
