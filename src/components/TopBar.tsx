import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Command,
  Bell,
  Radio,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';

export const TopBar: React.FC = () => {
  const {
    searchQuery,
    setIsCommandPaletteOpen,
    isRightFeedOpen,
    setIsRightFeedOpen,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    notifications,
    markNotificationAsRead,
    entities,
    setActiveNav,
  } = useAIHeaven();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showNotifDropdown]);

  return (
    <header className="h-14 shrink-0 bg-[#070b12] border-b border-slate-800/80 px-2 sm:px-4 flex items-center justify-between text-slate-200 z-30 select-none pt-[env(safe-area-inset-top)] gap-2">
      {/* Left: Mobile Toggle + Logo Branding */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:bg-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Toggle Navigation"
          aria-label="Toggle Navigation Drawer"
        >
          {isMobileDrawerOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
        </button>

        <div
          onClick={() => setActiveNav('monitor')}
          className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group"
          title="Return to World Monitor"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 p-[1px] shadow-sm shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#090d16] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#070b12]" />
          </div>

          <div className="leading-tight">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold tracking-wider text-xs sm:text-sm text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                AI HEAVEN
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.2 text-[9px] font-mono rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
                COMMAND
              </span>
            </div>
            <span className="hidden xl:block text-[9px] font-mono text-slate-500 tracking-tight">
              WORLD MONITOR × AI ECOSYSTEM
            </span>
          </div>
        </div>
      </div>

      {/* Center: Global Search & Ctrl+K Trigger */}
      <div className="flex-1 max-w-xl mx-1 sm:mx-4 min-w-0">
        <div
          onClick={() => setIsCommandPaletteOpen(true)}
          className="group relative flex items-center w-full h-9 px-2 sm:px-3 bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 rounded-lg transition-all cursor-pointer shadow-inner min-w-0"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 mr-2 shrink-0 transition-colors" />
          <span className="text-xs text-slate-400 truncate flex-1 font-mono">
            {searchQuery ? `"${searchQuery}"` : 'Search models, tools, papers...'}
          </span>
          <div className="hidden sm:flex items-center space-x-1 pl-2 text-[10px] font-mono text-slate-500 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 flex items-center space-x-0.5">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Telemetry, Notifications, Live Feed Toggle */}
      <div className="flex items-center space-x-1 sm:space-x-2 text-xs font-mono shrink-0">
        {/* Live Status Chip - Desktop only */}
        <div className="hidden 2xl:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold">GRID LIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>{entities.length} NODES</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 relative transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Telemetry Alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-[9px] font-bold text-black flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="fixed sm:absolute top-14 sm:top-auto sm:mt-2 right-2 sm:right-0 w-[calc(100vw-16px)] sm:w-80 bg-[#0b0f19] border border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 text-xs font-sans max-h-[80dvh] flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 font-mono text-[11px] text-slate-400 px-1">
                <span className="font-semibold text-slate-200">TELEMETRY NOTIFICATIONS</span>
                <span className="text-[10px] text-cyan-400">{unreadCount} UNREAD</span>
              </div>
              <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      n.read
                        ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                        : 'bg-slate-900 border-cyan-500/30 text-slate-200 hover:border-cyan-500/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs leading-snug">{n.text}</span>
                      <span className="text-[10px] font-mono text-slate-500 ml-2 whitespace-nowrap">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Feed Toggle */}
        <button
          onClick={() => setIsRightFeedOpen(!isRightFeedOpen)}
          className={`flex items-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-[11px] transition-all min-h-[38px] ${
            isRightFeedOpen
              ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300 shadow-sm shadow-cyan-950'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Right Intelligence Stream"
          aria-label="Toggle Live Intelligence Pulse Feed"
        >
          <Radio className={`w-3.5 h-3.5 ${isRightFeedOpen ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="hidden xs:inline">PULSE</span>
        </button>
      </div>
    </header>
  );
};
