import React from 'react';
import {
  Clock,
  Globe,
  Compass,
  Cpu,
  Share2,
  Menu,
  Award,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { TimelineRange, ActiveNavView } from '../types/aiHeaven';

export const BottomTimeline: React.FC = () => {
  const {
    timelineRange,
    setTimelineRange,
    filteredActivity,
    allActivity,
    activeNav,
    setActiveNav,
    setIsMobileDrawerOpen,
  } = useAIHeaven();

  const timeRanges: { id: TimelineRange; label: string }[] = [
    { id: 'LIVE', label: 'LIVE' },
    { id: '1H', label: '1H' },
    { id: '6H', label: '6H' },
    { id: '24H', label: '24H' },
    { id: '7D', label: '7D' },
    { id: '30D', label: '30D' },
  ];

  const mobileNavShortcuts: { id: ActiveNavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'monitor', label: 'Map', icon: Globe },
    { id: 'opportunities', label: 'Opps', icon: Award },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'graph', label: 'Graph', icon: Share2 },
  ];

  return (
    <footer className="bg-[#070b13] border-t border-slate-800/80 flex flex-col z-30 shrink-0 select-none pb-[env(safe-area-inset-bottom)]">
      {/* Mobile-Only Quick Tab Navigation Bar (lg:hidden) */}
      <div className="lg:hidden flex items-center justify-around border-b border-slate-800/60 py-1.5 px-2 bg-[#060910]">
        {mobileNavShortcuts.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-mono transition-colors min-h-[44px] min-w-[54px] ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/60 font-bold'
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* All Views Menu Button */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-200 active:bg-slate-900 min-h-[44px] min-w-[54px]"
        >
          <Menu className="w-4 h-4 mb-0.5 text-slate-400" />
          <span>Menu</span>
        </button>
      </div>

      {/* Temporal Timeline Bar */}
      <div className="h-10 px-2 sm:px-4 flex items-center justify-between text-xs font-mono overflow-x-auto gap-2">
        {/* Left: Indicator */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-slate-400 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline text-slate-500 text-[11px]">TEMPORAL:</span>
          <span className="text-white font-bold text-xs">{timelineRange}</span>
          <span className="text-[10px] text-slate-500 hidden md:inline">
            ({filteredActivity.length}/{allActivity.length})
          </span>
        </div>

        {/* Center/Right: Interactive Buttons */}
        <div className="flex items-center space-x-1 shrink-0 overflow-x-auto py-0.5">
          {timeRanges.map((range) => {
            const isActive = timelineRange === range.id;
            return (
              <button
                key={range.id}
                onClick={() => setTimelineRange(range.id)}
                className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-bold transition-all min-h-[30px] ${
                  isActive
                    ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 active:bg-slate-700'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
