import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';
import { getSites, getContentItems, getMappings, upsertMapping } from '../lib/api';

type Site = {
  id: string;
  name: string;
  slug: string;
};

type ContentItem = {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  content_types?: { name: string };
};

type Mapping = {
  id: string;
  site_id: string;
  content_item_id: string;
  mode: 'full' | 'override' | 'block';
  overrides: any;
};

export default function Mappings() {
  const [sites, setSites] = useState<Site[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sitesData, itemsData, mappingsData] = await Promise.all([
        getSites(),
        getContentItems(),
        getMappings(),
      ]);
      setSites(sitesData);
      setItems(itemsData);
      setMappings(mappingsData);
    } catch (error) {
      console.error('Error loading mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMapping = (siteId: string, itemId: string): Mapping | undefined => {
    return mappings.find(m => m.site_id === siteId && m.content_item_id === itemId);
  };

  const handleModeChange = async (siteId: string, itemId: string, mode: 'full' | 'override' | 'block' | null) => {
    try {
      if (mode === null) {
        return;
      }
      await upsertMapping(siteId, itemId, mode);
      await loadData();
    } catch (error) {
      console.error('Error updating mapping:', error);
    }
  };

  const getModeClass = (mode: 'full' | 'override' | 'block' | undefined) => {
    if (!mode) return 'bg-slate-100 text-slate-400';
    switch (mode) {
      case 'full':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'override':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'block':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mappings</h1>
          <p className="mt-2 text-slate-600">Control which content goes to which sites</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-slate-700">Full - Publish as is</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span className="text-slate-700">Override - Site-specific changes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-slate-700">Block - Exclude from site</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-100 rounded"></div>
              <span className="text-slate-700">None - Not mapped</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : sites.length === 0 || items.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">
              {sites.length === 0 ? 'Create sites first' : 'Create content items first'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Content Item</th>
                  {sites.map(site => (
                    <th key={site.id} className="text-center py-3 px-4 font-semibold text-slate-900">
                      {site.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(item => item.status === 'published')
                  .map(item => (
                    <tr key={item.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-600">{item.content_types?.name}</div>
                      </td>
                      {sites.map(site => {
                        const mapping = getMapping(site.id, item.id);
                        return (
                          <td key={site.id} className="py-3 px-4 text-center">
                            <select
                              value={mapping?.mode || ''}
                              onChange={(e) => handleModeChange(site.id, item.id, e.target.value as any || null)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 focus:ring-2 focus:ring-blue-500 ${getModeClass(mapping?.mode)}`}
                            >
                              <option value="">None</option>
                              <option value="full">Full</option>
                              <option value="override">Override</option>
                              <option value="block">Block</option>
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
