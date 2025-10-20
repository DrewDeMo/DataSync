import { useState, useEffect } from 'react';
import {
  Plus,
  FileText,
  Eye,
  X,
  Stack,
  Code,
  PencilSimple
} from '@phosphor-icons/react';
import { getContentTypes, getContentItems, createContentType, createContentItem, updateContentItem } from '../lib/api';
import { FormBuilder } from '../components/forms/FormBuilder';
import { CONTENT_TYPE_TEMPLATES, getTemplateBySlug } from '../components/content/ContentTypeTemplates';
import { FieldDefinition } from '../types/fieldTypes';

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
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

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
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-600">
                          {item.content_types?.name}
                        </p>
                        {(() => {
                          const type = types.find(t => t.id === item.content_type_id);
                          const template = type ? getTemplateBySlug(type.slug) : null;
                          if (template) {
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                📋 {template.name}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="btn-ghost"
                    >
                      <PencilSimple className="w-4 h-4 mr-2" weight="bold" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleViewItem(item)}
                      className="btn-ghost"
                    >
                      <Eye className="w-4 h-4 mr-2" weight="bold" />
                      View
                    </button>
                  </div>
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

      {editingItem && (
        <EditItemModal
          item={editingItem}
          types={types}
          onClose={() => setEditingItem(null)}
          onSuccess={loadData}
        />
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
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const templates = Object.values(CONTENT_TYPE_TEMPLATES);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedTemplate) {
        const template = CONTENT_TYPE_TEMPLATES[selectedTemplate];
        await createContentType(template.name, template.schema);
      } else if (customName) {
        // Create custom type with basic schema
        await createContentType(customName, [{ name: 'content', type: 'text' }]);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating type:', error);
      alert('Error creating content type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stack className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Create Content Type</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-auto max-h-[calc(90vh-140px)]">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Choose a Template</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <label
                  key={template.slug}
                  className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedTemplate === template.slug
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.slug}
                    checked={selectedTemplate === template.slug}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      setCustomName('');
                    }}
                    className="mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-slate-900">{template.name}</div>
                    <div className="text-xs text-slate-600 mt-1">{template.description}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      {template.schema.length} fields
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Create Custom Type
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                setSelectedTemplate('');
              }}
              className="input"
              placeholder="e.g., Blog Post, Product, Event"
            />
            <p className="text-xs text-slate-500 mt-1">
              Custom types will use a basic schema that you can modify later
            </p>
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!selectedTemplate && !customName)}
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
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [jsonData, setJsonData] = useState('{}');
  const [loading, setLoading] = useState(false);

  const selectedType = types.find(t => t.id === typeId);
  const template = selectedType ? getTemplateBySlug(selectedType.slug) : null;

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      await createContentItem(typeId, title, formData, status);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating content item');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonData);
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
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Create Content Item</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Content Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Content Type
            </label>
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
            {template && (
              <p className="text-xs text-slate-500 mt-1">{template.description}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Enter item title"
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Mode Toggle */}
          {selectedType && template && (
            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setShowJsonMode(false)}
                  className={`px-4 py-2 font-semibold ${!showJsonMode
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-600'
                    }`}
                >
                  📝 Form View
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonMode(true)}
                  className={`px-4 py-2 font-semibold ${showJsonMode
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-600'
                    }`}
                >
                  💻 JSON View
                </button>
              </div>
            </div>
          )}

          {/* Form or JSON Editor */}
          {selectedType && template ? (
            showJsonMode ? (
              <form onSubmit={handleJsonSubmit}>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="input font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4"
                >
                  {loading ? 'Creating...' : 'Create Item'}
                </button>
              </form>
            ) : (
              <FormBuilder
                schema={template.schema}
                onSubmit={handleFormSubmit}
                submitLabel="Create Item"
                isLoading={loading}
              />
            )
          ) : selectedType && !template ? (
            <form onSubmit={handleJsonSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Data (JSON)
                </label>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="input font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating...' : 'Create Item'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditItemModal({
  item,
  types,
  onClose,
  onSuccess
}: {
  item: ContentItem;
  types: ContentType[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(item.status);
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [jsonData, setJsonData] = useState(JSON.stringify(item.data, null, 2));
  const [loading, setLoading] = useState(false);

  const selectedType = types.find(t => t.id === item.content_type_id);
  const template = selectedType ? getTemplateBySlug(selectedType.slug) : null;

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      await updateContentItem(item.id, { title, data: formData, status });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating content item');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonData);
      await updateContentItem(item.id, { title, data: parsedData, status });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Invalid JSON or error updating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <PencilSimple className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Edit Content Item</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" weight="bold" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Enter item title"
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Mode Toggle */}
          {template && (
            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setShowJsonMode(false)}
                  className={`px-4 py-2 font-semibold ${!showJsonMode
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-600'
                    }`}
                >
                  📝 Form View
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonMode(true)}
                  className={`px-4 py-2 font-semibold ${showJsonMode
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-600'
                    }`}
                >
                  💻 JSON View
                </button>
              </div>
            </div>
          )}

          {/* Form or JSON Editor */}
          {template ? (
            showJsonMode ? (
              <form onSubmit={handleJsonSubmit}>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="input font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <FormBuilder
                schema={template.schema}
                initialData={item.data}
                onSubmit={handleFormSubmit}
                submitLabel="Save Changes"
                isLoading={loading}
              />
            )
          ) : (
            <form onSubmit={handleJsonSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Data (JSON)
                </label>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="input font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
