import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from '../components/WorldMonitorMap';
import { EntityCategory, AIEntity } from '../types/aiHeaven';

export const ResourcesView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [minTrust, setMinTrust] = useState(0);
  const [sortBy, setSortBy] = useState<'trust' | 'name' | 'recent'>('trust');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return entities
      .filter((e) => {
        const matchesQuery =
          !query ||
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.description.toLowerCase().includes(query.toLowerCase()) ||
          e.organization.toLowerCase().includes(query.toLowerCase()) ||
          e.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));

        const matchesCat = selectedCat === 'ALL' || e.category === selectedCat;
        const matchesOpen = !openSourceOnly || e.isOpensource;
        const matchesTrust = e.trustScore >= minTrust;

        return matchesQuery && matchesCat && matchesOpen && matchesTrust;
      })
      .sort((a, b) => {
        if (sortBy === 'trust') return b.trustScore - a.trustScore;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      });
  }, [entities, query, selectedCat, openSourceOnly, minTrust, sortBy]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto font-sans text-slate-200">
      {/* View Header */}
      <div className="border-b border-slate-800/80 pb-3 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold">
            <Layers className="w-4 h-4" />
            <span>GLOBAL RESOURCE REPOSITORY</span>
          </div>
          <h1 className="text-xl font-bold text-white">All Ecosystem Resources</h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-md text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-400'}`}
            title="Grid View"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-400'}`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg bg-[#080d19] border border-slate-800 font-mono text-xs space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources, tags, or providers..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 outline-none text-xs"
            />
          </div>

          {/* Category Select */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            <option value="ALL">All Categories ({entities.length})</option>
            <option value="model">Models</option>
            <option value="tool">Tools & Inference</option>
            <option value="dataset">Datasets</option>
            <option value="github">Repositories</option>
            <option value="research">Research</option>
            <option value="company">Companies</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            <option value="trust">Sort: Highest Trust</option>
            <option value="recent">Sort: Newest Release</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          {/* Open Source Checkbox */}
          <label className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded cursor-pointer select-none text-[11px] text-slate-300">
            <input
              type="checkbox"
              checked={openSourceOnly}
              onChange={(e) => setOpenSourceOnly(e.target.checked)}
              className="accent-cyan-500"
            />
            <span>Open Source Only</span>
          </label>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
          <span>Showing {filtered.length} verified ecosystem resources</span>
          <span>Source: Local Benchmark Index</span>
        </div>
      </div>

      {/* Grid or List Render */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((entity) => {
            const theme = CATEGORY_THEMES[entity.category] || CATEGORY_THEMES.company;
            return (
              <div
                key={entity.id}
                onClick={() => setSelectedEntity(entity)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className="px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                    >
                      {entity.category}
                    </span>
                    <span className="text-emerald-400 font-bold">{entity.trustScore}%</span>
                  </div>

                  <div className="font-bold text-white text-sm group-hover:text-cyan-300 truncate">
                    {entity.name}
                  </div>

                  <div className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {entity.tagline}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span className="truncate pr-1">{entity.organization}</span>
                  <span className="text-slate-400 shrink-0">{entity.license}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode - Horizontally scrollable on small viewports */
        <div className="bg-[#080d19] border border-slate-800 rounded-xl overflow-hidden font-mono text-xs overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-12 gap-2 p-2.5 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-500 uppercase font-bold">
              <div className="col-span-4">Name & Organization</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">License</div>
              <div className="col-span-2">Release</div>
              <div className="col-span-2 text-right">Trust Score</div>
            </div>
            <div className="divide-y divide-slate-800/60">
              {filtered.map((entity) => (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className="grid grid-cols-12 gap-2 p-2.5 hover:bg-slate-900/80 cursor-pointer items-center transition-colors group"
                >
                  <div className="col-span-4 min-w-0">
                    <div className="font-bold text-white group-hover:text-cyan-300 truncate">{entity.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{entity.organization}</div>
                  </div>
                  <div className="col-span-2 text-slate-400 uppercase text-[10px]">{entity.category}</div>
                  <div className="col-span-2 text-slate-400 text-[10px] truncate">{entity.license}</div>
                  <div className="col-span-2 text-slate-500 text-[10px]">{entity.releaseDate}</div>
                  <div className="col-span-2 text-right text-emerald-400 font-bold">{entity.trustScore}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
