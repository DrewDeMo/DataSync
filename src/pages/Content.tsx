import { useState, useEffect } from 'react';
import { Plus, FileText, Eye } from 'lucide-react';
import { getContentTypes, getContentItems, createContentType, createContentItem, updateContentItem } from '../lib/api';

type ContentType = {
  id: string;
  name: string;
  slug: string;
  schema: any[];
};

type ContentItem = {
  id: string;
  content_type_id: string;
  title: string;
  data: any;
  status: 'draft' | 'published' | 'archived';
  content_types?: { name: string };
};

export default function Content() {
  const [types, setTypes] = useState<ContentType[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesData, itemsData] = await Promise.all([
        getContentTypes(),
        getContentItems(),
      ]);
      setTypes(typesData);
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-amber-100 text-amber-800',
      archived: 'bg-slate-100 text-slate-800',
    }[status] || 'bg-slate-100 text-slate-800';

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
        {status}
      </span>
    );
  };

  const handleViewItem = (item: ContentItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content</h1>
          <p className="mt-2 text-slate-600">Manage content types and items</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTypeModal(true)}
            className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Type
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Content Types</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {types.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No content types yet</p>
            </div>
          ) : (
            types.map((type) => (
              <div key={type.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{type.name}</h3>
                    <p className="text-sm text-slate-600">{type.schema.length} fields</p>
                  </div>
                  <span className="text-sm text-slate-500">{type.slug}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Content Items</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="px-6 py-8 text-center text-slate-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No content items yet</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-slate-900">{item.title}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {item.content_types?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewItem(item)}
                    className="inline-flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedItem && (
        <ItemViewer item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {showTypeModal && (
        <CreateTypeModal onClose={() => setShowTypeModal(false)} onSuccess={loadData} />
      )}

      {showItemModal && (
        <CreateItemModal types={types} onClose={() => setShowItemModal(false)} onSuccess={loadData} />
      )}
    </div>
  );
}

function ItemViewer({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            ✕
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
          <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(item.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function CreateTypeModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [fields, setFields] = useState<any[]>([{ name: '', type: 'text' }]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createContentType(name, fields);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating type:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Create Content Type</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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

function CreateItemModal({ types, onClose, onSuccess }: { types: ContentType[]; onClose: () => void; onSuccess: () => void }) {
  const [typeId, setTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [data, setData] = useState('{}');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedData = JSON.parse(data);
      await createContentItem(typeId, title, parsedData, status);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Invalid JSON or error creating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Create Content Item</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content Type</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data (JSON)</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
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
