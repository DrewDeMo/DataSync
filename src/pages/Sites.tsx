import { useState, useEffect } from 'react';
import {
  Plus,
  Globe,
  Eye,
  CheckCircle,
  XCircle,
  Warning,
  ArrowsClockwise,
  X,
  Link,
  Shield
} from '@phosphor-icons/react';
import { getSites, createSite, getDestinationSnapshot, generateSecret } from '../lib/api';

type Site = {
  id: string;
  name: string;
  slug: string;
  destination_url: string;
  destination_secret: string;
  last_sync_status: 'success' | 'partial' | 'failed' | null;
  last_sync_at: string | null;
};

type Snapshot = {
  id: string;
  site_id: string;
  payload: any;
  received_at: string;
  item_count: number;
};

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const data = await getSites();
      setSites(data);
    } catch (error) {
      console.error('Error loading sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDestination = async (site: Site) => {
    setSelectedSite(site);
    try {
      const data = await getDestinationSnapshot(site.id);
      setSnapshot(data);
    } catch (error) {
      console.error('Error loading snapshot:', error);
      setSnapshot(null);
    }
  };

  const getStatusIcon = (status: string | null) => {
    if (!status) return null;
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" weight="bold" />;
      case 'partial':
        return <Warning className="w-5 h-5 text-amber-600" weight="bold" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" weight="bold" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const classes = {
      success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      partial: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    }[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${classes}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">Sites</h1>
          <p className="text-slate-600 text-lg">Manage destination sites and credentials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary group"
        >
          <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" weight="bold" />
          New Site
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-slate-400" weight="bold" />
            </div>
            <p className="text-slate-900 font-semibold mb-1">No sites yet</p>
            <p className="text-sm text-slate-500">Create your first site to get started</p>
          </div>
        ) : (
          sites.map((site, index) => (
            <div
              key={site.id}
              className="group card-hover bg-gradient-to-br from-white to-slate-50 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 text-white" weight="bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{site.name}</h3>
                      <p className="text-sm text-slate-600 font-mono">{site.slug}</p>
                    </div>
                  </div>
                  {site.last_sync_status && (
                    <div className="flex-shrink-0">
                      {getStatusIcon(site.last_sync_status)}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {site.last_sync_status && (
                  <div className="mb-4">
                    {getStatusBadge(site.last_sync_status)}
                  </div>
                )}

                {/* Destination URL */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    <Link className="w-3 h-3" weight="bold" />
                    <span>Destination URL</span>
                  </div>
                  <div className="text-sm text-slate-700 font-mono bg-slate-100 px-3 py-2 rounded-lg break-all border border-slate-200">
                    {site.destination_url}
                  </div>
                </div>

                {/* Last Sync */}
                {site.last_sync_at && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
                    <ArrowsClockwise className="w-3 h-3" weight="bold" />
                    <span>Last sync: {new Date(site.last_sync_at).toLocaleString()}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleViewDestination(site)}
                    className="btn-ghost w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" weight="bold" />
                    View Destination
                  </button>
                  <a
                    href={`/landing-pages/${site.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full inline-flex items-center justify-center"
                  >
                    <Globe className="w-4 h-4 mr-2" weight="bold" />
                    View Landing Page
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && <CreateSiteModal onClose={() => setShowModal(false)} onSuccess={loadSites} />}

      {selectedSite && (
        <DestinationViewer
          site={selectedSite}
          snapshot={snapshot}
          onClose={() => {
            setSelectedSite(null);
            setSnapshot(null);
          }}
        />
      )}
    </div>
  );
}

function CreateSiteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateNewSecret();
  }, []);

  const generateNewSecret = async () => {
    const newSecret = await generateSecret();
    setSecret(newSecret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const destinationUrl = baseUrl || `${window.location.origin}/api/destination/${slug}`;
      await createSite(name, destinationUrl, secret);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating site:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-md w-full shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Create Site</h3>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Site Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., North Region, Europe Site"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Destination URL <span className="text-slate-500 font-normal">(optional, auto-generated)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Leave empty for mock endpoint"
              className="input"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-2">
              <Shield className="w-4 h-4" weight="bold" />
              <span>Secret Key</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                className="input flex-1 font-mono text-sm"
              />
              <button
                type="button"
                onClick={generateNewSecret}
                className="btn-secondary"
              >
                <ArrowsClockwise className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DestinationViewer({ site, snapshot, onClose }: { site: Site; snapshot: Snapshot | null; onClose: () => void }) {
  const [tab, setTab] = useState<'preview' | 'json'>('preview');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 text-white" weight="bold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Destination: {site.name}</h3>
              <p className="text-sm text-slate-600 font-mono">{site.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex space-x-1 px-6">
            <button
              onClick={() => setTab('preview')}
              className={`relative px-4 py-3 font-semibold text-sm transition-all ${tab === 'preview'
                ? 'text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Preview
              {tab === 'preview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
            <button
              onClick={() => setTab('json')}
              className={`relative px-4 py-3 font-semibold text-sm transition-all ${tab === 'json'
                ? 'text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              JSON
              {tab === 'json' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(80vh-160px)] scrollbar-thin">
          {!snapshot ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-slate-400" weight="bold" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">No data received yet</p>
              <p className="text-sm text-slate-500">Run a sync to see results</p>
            </div>
          ) : tab === 'preview' ? (
            <div className="space-y-4">
              {/* Info Card */}
              <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-indigo-900">
                      Received: {new Date(snapshot.received_at).toLocaleString()}
                    </div>
                    <div className="text-sm font-semibold text-indigo-900">
                      Items: {snapshot.item_count}
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-indigo-600" weight="bold" />
                </div>
              </div>

              {/* Items */}
              {snapshot.payload.items?.map((item: any, idx: number) => (
                <div key={idx} className="card-hover p-4">
                  <h4 className="font-bold text-slate-900 text-lg mb-3">{item.title || `Item ${idx + 1}`}</h4>
                  <div className="space-y-2">
                    {Object.entries(item.data || {}).map(([key, value]) => (
                      <div key={key} className="flex items-start space-x-3 text-sm">
                        <span className="font-semibold text-slate-600 min-w-[100px]">{key}:</span>
                        <span className="text-slate-900 flex-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl text-sm overflow-auto font-mono shadow-inner">
              {JSON.stringify(snapshot.payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
