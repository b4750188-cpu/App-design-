import React from 'react';
import {
  Radio,
  Sparkles,
  GitBranch,
  FileText,
  Database,
  Cpu,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { ActivityItem } from '../types/aiHeaven';

export const LiveIntelligenceFeed: React.FC = () => {
  const {
    filteredActivity,
    isRightFeedOpen,
    setIsRightFeedOpen,
    setSelectedEntity,
    entities,
    timelineRange,
  } = useAIHeaven();

  if (!isRightFeedOpen) {
    return null;
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'MODEL_RELEASE':
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case 'GITHUB_SPIKE':
        return <GitBranch className="w-3.5 h-3.5 text-sky-400" />;
      case 'PAPER_PUBLISHED':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      case 'DATASET_UPDATE':
        return <Database className="w-3.5 h-3.5 text-amber-400" />;
      case 'VERIFICATION_EVENT':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const handleCardClick = (item: ActivityItem) => {
    const target = entities.find((e) => e.id === item.entityId);
    if (target) {
      setSelectedEntity(target);
      // On mobile, automatically close feed when entity is selected
      if (window.innerWidth < 1280) {
        setIsRightFeedOpen(false);
      }
    }
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop (below xl breakpoint) */}
      <div
        onClick={() => setIsRightFeedOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 xl:hidden transition-opacity"
        aria-hidden="true"
      />

      {/* Feed Panel: Fixed drawer on mobile/tablet, docked sidebar on desktop (xl+) */}
      <aside className="fixed xl:static inset-y-0 right-0 w-80 sm:w-88 max-w-[calc(100vw-32px)] bg-[#070b13] border-l border-slate-800/80 flex flex-col h-full z-40 xl:z-20 shrink-0 font-mono select-none shadow-2xl xl:shadow-none animate-in slide-in-from-right duration-200">
        {/* Feed Header */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between bg-[#080d17] pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-wider">LIVE INTELLIGENCE</span>
          </div>

          <div className="flex items-center space-x-2 text-[10px]">
            <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              {timelineRange}
            </span>
            <span className="text-slate-500">({filteredActivity.length})</span>

            {/* Close Button for all screens */}
            <button
              onClick={() => setIsRightFeedOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Feed"
              aria-label="Close Live Feed"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feed Stream List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 divide-y divide-slate-800/50 overscroll-contain">
          {filteredActivity.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2 font-mono text-xs">
              <Radio className="w-6 h-6 mx-auto text-slate-600 opacity-50" />
              <div>No events recorded in {timelineRange} window</div>
              <div className="text-[10px] text-slate-600">Select 7D or 30D on bottom timeline</div>
            </div>
          ) : (
            filteredActivity.map((item) => (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className="pt-2 first:pt-0 group cursor-pointer"
              >
                <div className="p-2.5 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-800/70 hover:border-cyan-500/40 transition-all space-y-1.5 shadow-sm active:scale-[0.99]">
                  {/* Meta row */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center space-x-1.5 truncate pr-1">
                      {getActivityIcon(item.type)}
                      <span className="text-slate-300 font-semibold truncate max-w-[140px]">
                        {item.entityName}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 shrink-0">{item.relativeTime}</span>
                  </div>

                  {/* Event Headline */}
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug font-sans">
                    {item.title}
                  </div>

                  {/* Event Summary Description */}
                  <div className="text-[10.5px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>

                  {/* Metrics Highlight Pill */}
                  {item.metricsChange && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                      <span className="text-cyan-400 font-mono font-medium flex items-center space-x-1">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>{item.metricsChange}</span>
                      </span>
                      <span className="text-[9px] text-slate-500 group-hover:text-slate-300 flex items-center">
                        Inspect <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feed Footer Telemetry Banner */}
        <div className="p-2 border-t border-slate-800/80 bg-[#050810] text-[9.5px] text-slate-500 flex items-center justify-between pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STREAM ACTIVE</span>
          </span>
          <span className="text-slate-400">POLL: 3.2s</span>
        </div>
      </aside>
    </>
  );
};
