import { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle,
  Prohibit,
  PencilSimple,
  Info
} from '@phosphor-icons/react';
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
    if (!mode) return 'bg-slate-100 text-slate-600 border-slate-200';
    switch (mode) {
      case 'full':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
      case 'override':
        return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
      case 'block':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    }
  };

  const getModeIcon = (mode: 'full' | 'override' | 'block' | undefined) => {
    if (!mode) return null;
    switch (mode) {
      case 'full':
        return <CheckCircle className="w-3 h-3" weight="bold" />;
      case 'override':
        return <PencilSimple className="w-3 h-3" weight="bold" />;
      case 'block':
        return <Prohibit className="w-3 h-3" weight="bold" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gradient-primary">Mappings</h1>
        <p className="text-slate-600 text-lg">Control which content goes to which sites</p>
      </div>

      {/* Legend Card */}
      <div className="card p-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Info className="w-5 h-5 text-white" weight="bold" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Mapping Modes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" weight="bold" />
            </div>
            <div>
              <div className="font-bold text-emerald-900 text-sm">Full</div>
              <div className="text-xs text-emerald-700">Publish as is</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <PencilSimple className="w-5 h-5 text-blue-600" weight="bold" />
            </div>
            <div>
              <div className="font-bold text-blue-900 text-sm">Override</div>
              <div className="text-xs text-blue-700">Site-specific changes</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-red-50 border border-red-200">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Prohibit className="w-5 h-5 text-red-600" weight="bold" />
            </div>
            <div>
              <div className="font-bold text-red-900 text-sm">Block</div>
              <div className="text-xs text-red-700">Exclude from site</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-slate-600" weight="bold" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">None</div>
              <div className="text-xs text-slate-700">Not mapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <GitBranch className="w-5 h-5 text-white" weight="bold" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Content Mappings</h2>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading mappings...</p>
          </div>
        ) : sites.length === 0 || items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GitBranch className="w-8 h-8 text-slate-400" weight="bold" />
            </div>
            <p className="text-slate-900 font-semibold mb-1">
              {sites.length === 0 ? 'No sites available' : 'No content items available'}
            </p>
            <p className="text-sm text-slate-500">
              {sites.length === 0 ? 'Create sites first to set up mappings' : 'Create content items first to set up mappings'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 font-bold text-slate-900 sticky left-0 bg-slate-50 z-10">
                    Content Item
                  </th>
                  {sites.map(site => (
                    <th key={site.id} className="text-center py-4 px-6 font-bold text-slate-900 min-w-[140px]">
                      <div className="flex flex-col items-center space-y-1">
                        <span>{site.name}</span>
                        <span className="text-xs font-mono text-slate-500 font-normal">{site.slug}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(item => item.status === 'published')
                  .map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-sm text-slate-600 mt-0.5">{item.content_types?.name}</div>
                      </td>
                      {sites.map(site => {
                        const mapping = getMapping(site.id, item.id);
                        return (
                          <td key={site.id} className="py-4 px-6 text-center">
                            <select
                              value={mapping?.mode || ''}
                              onChange={(e) => handleModeChange(site.id, item.id, e.target.value as any || null)}
                              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border-2 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none ${getModeClass(mapping?.mode)}`}
                            >
                              <option value="">None</option>
                              <option value="full">✓ Full</option>
                              <option value="override">✎ Override</option>
                              <option value="block">✕ Block</option>
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
