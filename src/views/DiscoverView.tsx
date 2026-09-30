import React from 'react';
import {
  Compass,
  TrendingUp,
  Cpu,
  Wrench,
  Database,
  FileText,
  ShieldCheck,
  GitBranch,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from '../components/WorldMonitorMap';
import { AIEntity } from '../types/aiHeaven';

export const DiscoverView: React.FC = () => {
  const { entities, setSelectedEntity, setActiveNav } = useAIHeaven();

  const trending = entities.slice(0, 3);
  const newModels = entities.filter((e) => e.category === 'model');
  const popularTools = entities.filter((e) => e.category === 'tool');
  const topDatasets = entities.filter((e) => e.category === 'dataset');
  const recentResearch = entities.filter((e) => e.category === 'research');
  const openSource = entities.filter((e) => e.isOpensource);

  const renderCard = (entity: AIEntity) => {
    const theme = CATEGORY_THEMES[entity.category] || CATEGORY_THEMES.company;
    return (
      <div
        key={entity.id}
        onClick={() => setSelectedEntity(entity)}
        className="p-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span
              className="px-1.5 py-0.2 rounded font-bold uppercase"
              style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
            >
              {entity.category}
            </span>
            <span className="text-emerald-400 font-bold">{entity.trustScore}% TRUST</span>
          </div>

          <div className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors font-mono">
            {entity.name}
          </div>

          <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {entity.tagline}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{entity.organization}</span>
          <span className="group-hover:text-cyan-400 flex items-center">
            Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* View Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
          <Compass className="w-4 h-4 animate-spin" />
          <span>GLOBAL AI DISCOVERY RADAR</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Ecosystem Intelligence Discoveries</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Curated index of breakthrough models, open source runtimes, verified benchmark corpora, and seminal papers.
        </p>
      </div>

      {/* Section 1: Trending Breakthroughs */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white uppercase">Trending Breakthroughs</span>
          </div>
          <span className="text-[10px] text-slate-500">REAL TIME VELOCITY</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{trending.map(renderCard)}</div>
      </section>

      {/* Section 2: New Frontier Models */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white uppercase">Frontier Models</span>
          </div>
          <button
            onClick={() => setActiveNav('models')}
            className="text-[11px] text-purple-400 hover:text-purple-300"
          >
            View all models →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{newModels.slice(0, 3).map(renderCard)}</div>
      </section>

      {/* Section 3: High-Throughput Tools & Runtimes */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white uppercase">Essential Tools & Inference Engines</span>
          </div>
          <button
            onClick={() => setActiveNav('tools')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300"
          >
            View all tools →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{popularTools.slice(0, 3).map(renderCard)}</div>
      </section>

      {/* Section 4: Datasets & Research Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Datasets */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white uppercase">Pretraining & Eval Datasets</span>
            </div>
            <button
              onClick={() => setActiveNav('datasets')}
              className="text-[11px] text-amber-400 hover:text-amber-300"
            >
              All datasets →
            </button>
          </div>
          <div className="space-y-2.5">{topDatasets.map(renderCard)}</div>
        </section>

        {/* Research */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-rose-400" />
              <span className="font-bold text-white uppercase">Landmark Research Papers</span>
            </div>
            <button
              onClick={() => setActiveNav('research')}
              className="text-[11px] text-rose-400 hover:text-rose-300"
            >
              All research →
            </button>
          </div>
          <div className="space-y-2.5">{recentResearch.map(renderCard)}</div>
        </section>
      </div>
    </div>
  );
};
