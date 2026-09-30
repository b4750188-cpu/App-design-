import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Command,
  X,
  Cpu,
  Wrench,
  Database,
  GitBranch,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from './WorldMonitorMap';
import { AIEntity, ActiveNavView } from '../types/aiHeaven';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    entities,
    setSelectedEntity,
    setActiveNav,
  } = useAIHeaven();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) {
    return null;
  }

  const results = entities.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.organization.toLowerCase().includes(q) ||
      e.tagline.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelectEntity = (entity: AIEntity) => {
    setSelectedEntity(entity);
    setIsCommandPaletteOpen(false);
  };

  const handleNavigate = (view: ActiveNavView) => {
    setActiveNav(view);
    setIsCommandPaletteOpen(false);
  };

  return (
    <div
      onClick={() => setIsCommandPaletteOpen(false)}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-[max(1rem,env(safe-area-inset-top))] sm:pt-20 p-2 sm:p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#090e1a] border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden font-mono text-slate-200 max-h-[88dvh] flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#070b14]">
          <Search className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search models, tools, datasets, repos, papers..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-800 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Quick Nav Shortcuts */}
        {!query && (
          <div className="p-3 border-b border-slate-800/80 bg-[#060912] flex flex-wrap gap-1.5 text-[11px]">
            <button
              onClick={() => handleNavigate('models')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1"
            >
              <Cpu className="w-3 h-3 text-purple-400" />
              <span>Models Registry</span>
            </button>
            <button
              onClick={() => handleNavigate('tools')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1"
            >
              <Wrench className="w-3 h-3 text-emerald-400" />
              <span>Tools & APIs</span>
            </button>
            <button
              onClick={() => handleNavigate('graph')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Knowledge Graph</span>
            </button>
            <button
              onClick={() => handleNavigate('agents')}
              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1"
            >
              <span>Agent APIs</span>
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching ecosystem entities found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((entity) => {
              const theme = CATEGORY_THEMES[entity.category] || CATEGORY_THEMES.company;
              return (
                <div
                  key={entity.id}
                  onClick={() => handleSelectEntity(entity)}
                  className="p-2.5 rounded-lg hover:bg-slate-900/90 border border-transparent hover:border-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold"
                        style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                      >
                        {entity.category}
                      </span>
                      <span className="font-semibold text-white text-xs group-hover:text-cyan-300 truncate">
                        {entity.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({entity.organization})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate font-sans">
                      {entity.tagline}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 shrink-0">
                    <span className="text-emerald-400 font-bold">{entity.trustScore}%</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-slate-800 bg-[#060912] text-[10px] text-slate-500 flex justify-between">
          <span>AI Heaven Global Discovery</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
