import { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  Eye,
  X,
  Stack,
  Code
} from '@phosphor-icons/react';
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
      published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      draft: 'bg-amber-100 text-amber-800 border-amber-200',
      archived: 'bg-slate-100 text-slate-800 border-slate-200',
    }[status] || 'bg-slate-100 text-slate-800 border-slate-200';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${classes}`}>
        {status}
      </span>
    );
  };

  const handleViewItem = (item: ContentItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">Content</h1>
          <p className="text-slate-600 text-lg">Manage content types and items</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowTypeModal(true)}
            className="btn-secondary group"
          >
            <Stack className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" weight="bold" />
            New Type
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="btn-primary group"
          >
            <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" weight="bold" />
            New Item
          </button>
        </div>
      </div>

      {/* Content Types Section */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stack className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Content Types</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {types.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Stack className="w-8 h-8 text-slate-400" weight="bold" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">No content types yet</p>
              <p className="text-sm text-slate-500">Create your first content type to get started</p>
            </div>
          ) : (
            types.map((type, index) => (
              <div
                key={type.id}
                className="px-6 py-4 hover:bg-slate-50 transition-all duration-200 group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-blue-600" weight="bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{type.name}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">
                        <Code className="w-3 h-3 inline mr-1" weight="bold" />
                        {type.schema.length} fields
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-mono font-semibold">
                    {type.slug}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Content Items Section */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Content Items</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading content items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" weight="bold" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">No content items yet</p>
              <p className="text-sm text-slate-500">Create your first content item to get started</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-slate-50 transition-all duration-200 group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-purple-600" weight="bold" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-slate-600">
                        {item.content_types?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewItem(item)}
                    className="btn-ghost"
                  >
                    <Eye className="w-4 h-4 mr-2" weight="bold" />
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(80vh-80px)] scrollbar-thin">
          <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl text-sm overflow-auto font-mono shadow-inner">
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-md w-full shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stack className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Create Content Type</h3>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Type Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="e.g., Blog Post, Product, Event"
            />
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
              {loading ? 'Creating...' : 'Create Type'}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-md w-full shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Create Content Item</h3>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="input"
            >
              <option value="">Select a content type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Enter item title"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Data (JSON)</label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              rows={6}
              className="input font-mono text-sm"
              placeholder='{"key": "value"}'
            />
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
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
