import React from 'react';
import { Bookmark, Trash2, ArrowRight, Download } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from '../components/WorldMonitorMap';

export const SavedView: React.FC = () => {
  const { savedIds, toggleSaveEntity, entities, setSelectedEntity } = useAIHeaven();

  const savedEntities = entities.filter((e) => savedIds.includes(e.id));

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedEntities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ai_heaven_saved_bookmarks.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1">
            <Bookmark className="w-4 h-4 fill-amber-400" />
            <span>SAVED BOOKMARKS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Bookmarked Entities & Research</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Personal intelligence library persisted to local storage for quick offline access.
          </p>
        </div>

        {savedEntities.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bookmarks JSON</span>
          </button>
        )}
      </div>

      {/* Items Grid */}
      {savedEntities.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 font-mono text-xs space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
          <div>No entities bookmarked yet.</div>
          <div className="text-[10px] text-slate-600">
            Click the &quot;Save&quot; icon on any entity panel in Monitor or Models to keep it here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
          {savedEntities.map((entity) => {
            const theme = CATEGORY_THEMES[entity.category] || CATEGORY_THEMES.company;
            return (
              <div
                key={entity.id}
                className="p-3.5 rounded-lg bg-[#090d18] border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className="px-1.5 py-0.2 rounded font-bold uppercase"
                      style={{ backgroundColor: `${theme.color}20`, color: theme.color }}
                    >
                      {entity.category}
                    </span>
                    <button
                      onClick={() => toggleSaveEntity(entity.id)}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div
                    onClick={() => setSelectedEntity(entity)}
                    className="font-bold text-white text-sm hover:text-cyan-300 cursor-pointer truncate"
                  >
                    {entity.name}
                  </div>

                  <div className="text-xs text-slate-400 font-sans line-clamp-2">
                    {entity.tagline}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{entity.organization}</span>
                  <button
                    onClick={() => setSelectedEntity(entity)}
                    className="text-amber-400 hover:underline flex items-center"
                  >
                    Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
