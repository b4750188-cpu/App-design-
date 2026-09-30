import React from 'react';
import {
  Globe,
  Compass,
  Layers,
  Cpu,
  Wrench,
  Database,
  GitBranch,
  FileText,
  Share2,
  FolderGit2,
  Bookmark,
  Bot,
  ShieldCheck,
  X,
  Sparkles,
  Award,
  Building2,
  Users,
  Radio,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { ActiveNavView } from '../types/aiHeaven';

interface NavItem {
  id: ActiveNavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    entities,
    savedIds,
    projects,
    opportunities,
    organizations,
    personas,
  } = useAIHeaven();

  const modelCount = entities.filter((e) => e.category === 'model').length;
  const toolCount = entities.filter((e) => e.category === 'tool').length;
  const datasetCount = entities.filter((e) => e.category === 'dataset').length;
  const repoCount = entities.filter((e) => e.category === 'github').length;
  const researchCount = entities.filter((e) => e.category === 'research').length;

  const primaryNavItems: NavItem[] = [
    { id: 'monitor', label: 'Monitor (Map)', icon: Globe, highlight: true },
    { id: 'opportunities', label: 'Opportunities', icon: Award, badge: opportunities.length || 18, highlight: true },
    { id: 'organizations', label: 'Organizations', icon: Building2, badge: organizations.length || 8 },
    { id: 'personas', label: 'Personas & Contacts', icon: Users, badge: personas.length || 7 },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'resources', label: 'Resources', icon: Layers, badge: entities.length },
    { id: 'models', label: 'Models', icon: Cpu, badge: modelCount },
    { id: 'tools', label: 'Tools', icon: Wrench, badge: toolCount },
    { id: 'datasets', label: 'Datasets', icon: Database, badge: datasetCount },
    { id: 'github', label: 'GitHub', icon: GitBranch, badge: repoCount },
    { id: 'research', label: 'Research', icon: FileText, badge: researchCount },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2, highlight: true },
  ];

  const secondaryNavItems: NavItem[] = [
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedIds.length },
    { id: 'agents', label: 'Agents', icon: Bot, highlight: true },
    { id: 'ingestion', label: 'Ingestion Engine', icon: Radio, badge: 'Active' },
    { id: 'admin', label: 'Admin Metrics', icon: ShieldCheck },
  ];

  const handleSelectNav = (id: ActiveNavView) => {
    setActiveNav(id);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 max-w-[85vw] bg-[#060910] border-r border-slate-800/80 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile-Only Drawer Header with Close Button */}
        <div className="lg:hidden p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#080d19] pt-[max(0.875rem,env(safe-area-inset-top))]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-mono font-bold text-xs text-white tracking-wider">COMMAND NAVIGATION</span>
          </div>
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            aria-label="Close Navigation Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 overscroll-contain">
          {/* Group 1: Ecosystem Core */}
          <div>
            <div className="px-2.5 pb-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>Ecosystem Navigation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>
            <div className="space-y-0.5">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono transition-all group min-h-[40px] sm:min-h-[32px] ${
                      isActive
                        ? 'bg-cyan-950/70 border border-cyan-800/80 text-cyan-200 shadow-sm shadow-cyan-950/50 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent active:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors shrink-0 ${
                          isActive
                            ? 'text-cyan-400'
                            : item.highlight
                            ? 'text-indigo-400 group-hover:text-cyan-300'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1 ${
                          isActive ? 'bg-cyan-900/80 text-cyan-200 font-bold' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Workspaces & Systems */}
          <div>
            <div className="px-2.5 pb-1.5 text-[10px] font-mono tracking-wider text-slate-500 uppercase flex items-center justify-between">
              <span>Command & Workspaces</span>
            </div>
            <div className="space-y-0.5">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono transition-all group min-h-[40px] sm:min-h-[32px] ${
                      isActive
                        ? 'bg-violet-950/70 border border-violet-800/80 text-violet-200 shadow-sm shadow-violet-950/50 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent active:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors shrink-0 ${
                          isActive
                            ? 'text-violet-400'
                            : item.highlight
                            ? 'text-cyan-400'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ml-1 ${
                          isActive ? 'bg-violet-900/80 text-violet-200 font-bold' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer: System Specs & Verifiable Status */}
        <div className="p-3 border-t border-slate-800/80 bg-[#05070c] text-[10px] font-mono space-y-1.5 text-slate-400 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">TELEMETRY GRID</span>
            <span className="text-emerald-400 font-semibold">SYNCHRONIZED</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>AUDIT INTEGRITY</span>
            <span className="text-cyan-400">SHA256 SIGNED</span>
          </div>
        </div>
      </aside>
    </>
  );
};
