import { useState, useEffect } from 'react';
import { Plus, Globe, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sites</h1>
          <p className="mt-2 text-slate-600">Manage destination sites and credentials</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-600">Loading...</div>
        ) : sites.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No sites yet</p>
          </div>
        ) : (
          sites.map((site) => (
            <div key={site.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{site.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{site.slug}</p>
                </div>
                {site.last_sync_status && getStatusIcon(site.last_sync_status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="text-xs text-slate-500 uppercase tracking-wide">Destination URL</div>
                <div className="text-sm text-slate-700 font-mono bg-slate-50 px-3 py-2 rounded break-all">
                  {site.destination_url}
                </div>
              </div>

              {site.last_sync_at && (
                <div className="text-xs text-slate-500 mb-4">
                  Last sync: {new Date(site.last_sync_at).toLocaleString()}
                </div>
              )}

              <button
                onClick={() => handleViewDestination(site)}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Destination
              </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Create Site</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="North"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Destination URL <span className="text-slate-500">(optional, auto-generated)</span>
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Leave empty for mock endpoint"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Secret</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={generateNewSecret}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Destination: {site.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{site.slug}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>

        <div className="border-b border-slate-200">
          <div className="flex space-x-4 px-6">
            <button
              onClick={() => setTab('preview')}
              className={`py-3 border-b-2 transition-colors ${
                tab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setTab('json')}
              className={`py-3 border-b-2 transition-colors ${
                tab === 'json'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(80vh-160px)]">
          {!snapshot ? (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No data received yet</p>
              <p className="text-sm text-slate-500 mt-1">Run a sync to see results</p>
            </div>
          ) : tab === 'preview' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-900">
                  <strong>Received:</strong> {new Date(snapshot.received_at).toLocaleString()}
                </div>
                <div className="text-sm text-blue-900 mt-1">
                  <strong>Items:</strong> {snapshot.item_count}
                </div>
              </div>

              {snapshot.payload.items?.map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">{item.title || `Item ${idx + 1}`}</h4>
                  <div className="space-y-1">
                    {Object.entries(item.data || {}).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-slate-600">{key}:</span>{' '}
                        <span className="text-slate-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(snapshot.payload, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
