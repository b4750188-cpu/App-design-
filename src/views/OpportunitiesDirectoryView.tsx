import React, { useState, useMemo } from 'react';
import {
  Compass,
  Search,
  Filter,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Flame,
  Award,
  BookOpen,
  Briefcase,
  Code,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { StructuredOpportunity, OpportunityType, WorkMode } from '../server/opportunityEngine/types.ts';

const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  ALL: { label: 'All Opportunities', color: '#06b6d4', bg: 'bg-cyan-950/80', border: 'border-cyan-800', icon: Sparkles },
  GRANT: { label: 'Grants', color: '#10b981', bg: 'bg-emerald-950/80', border: 'border-emerald-800', icon: DollarSign },
  FELLOWSHIP: { label: 'Fellowships', color: '#a855f7', bg: 'bg-purple-950/80', border: 'border-purple-800', icon: Award },
  ACCELERATOR: { label: 'Accelerators', color: '#f97316', bg: 'bg-orange-950/80', border: 'border-orange-800', icon: Flame },
  SCHOLARSHIP: { label: 'Scholarships', color: '#3b82f6', bg: 'bg-blue-950/80', border: 'border-blue-800', icon: GraduationCap },
  RESEARCH_PROGRAM: { label: 'Research Programs', color: '#f43f5e', bg: 'bg-rose-950/80', border: 'border-rose-800', icon: BookOpen },
  HACKATHON: { label: 'Hackathons', color: '#eab308', bg: 'bg-amber-950/80', border: 'border-amber-800', icon: Code },
  STARTUP_PROGRAM: { label: 'Startup Programs', color: '#14b8a6', bg: 'bg-teal-950/80', border: 'border-teal-800', icon: Briefcase },
  JOB: { label: 'Jobs & Fellowships', color: '#6366f1', bg: 'bg-indigo-950/80', border: 'border-indigo-800', icon: Briefcase },
};

export const OpportunitiesDirectoryView: React.FC = () => {
  const { opportunities, setSelectedOpportunity, dbStats } = useAIHeaven();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (selectedType !== 'ALL' && opp.opportunityType !== selectedType) return false;
      if (selectedWorkMode !== 'ALL' && opp.workMode !== selectedWorkMode) return false;
      if (selectedStatus !== 'ALL' && opp.status !== selectedStatus) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesOrg = opp.organizationName.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesLocation = `${opp.location.city} ${opp.location.country}`.toLowerCase().includes(q);
        const matchesTags = opp.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOrg && !matchesDesc && !matchesLocation && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [opportunities, selectedType, selectedWorkMode, selectedStatus, search]);

  const countForType = (type: string) => {
    if (type === 'ALL') return opportunities.length;
    return opportunities.filter((o) => o.opportunityType === type).length;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
              <Compass className="w-4 h-4" />
              <span>GLOBAL OPPORTUNITY DIRECTORY & SEARCH</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verified Public Opportunities Engine
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Legitimate public grants, fellowships, accelerators, scholarships, hackathons, and research programs.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center space-x-2 bg-[#080d19] border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Opportunities:</span>
            <span className="text-cyan-400 font-bold">{opportunities.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">{opportunities.filter((o) => o.status === 'ACTIVE' || o.status === 'OPEN' || o.status === 'DEADLINE_APPROACHING').length} Active</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 bg-[#080d19] border border-slate-800/90 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organization, city, country, or technology tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Work Mode Filter */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400 text-[11px]">Work Mode:</span>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              aria-label="Filter by work mode"
              className="bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Modes</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by opportunity status"
              className="bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 border border-slate-800 bg-slate-900 p-1 rounded-xl shrink-0 font-mono text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Opportunity Type Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          {Object.entries(TYPE_CONFIG).map(([key, config]) => {
            const count = countForType(key);
            const isSelected = selectedType === key;
            const Icon = config.icon;

            return (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-cyan-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunity Results */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-[#080d19] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono">
          <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Opportunities Match Current Filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
            Try adjusting your search keywords, location filters, or opportunity type criteria.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpportunities.map((opp) => {
            const isExpired = opp.status === 'EXPIRED';
            const typeConfig = TYPE_CONFIG[opp.opportunityType] || TYPE_CONFIG.ALL;

            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpportunity(opp)}
                className="p-4 rounded-2xl bg-[#080d19]/90 hover:bg-[#0b1222] border border-slate-800/90 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-900 border border-slate-800 text-slate-300">
                        {opp.opportunityType.replace('_', ' ')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {opp.workMode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{opp.trustScore}%</span>
                    </div>
                  </div>

                  {/* Title & Organization */}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-mono line-clamp-2 leading-snug">
                      {opp.title}
                    </h3>
                    <div className="text-xs text-cyan-400/90 font-mono mt-0.5 line-clamp-1 font-semibold">
                      {opp.organizationName}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {opp.description}
                  </p>

                  {/* Funding & Deadline Specs */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10.5px] font-mono">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[9px] block">FUNDING / PRIZE:</span>
                      <span className="text-emerald-400 font-bold truncate block">
                        {opp.fundingAmount || opp.prize || opp.salary || 'Fully Funded / Stipend'}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[9px] block">DEADLINE:</span>
                      <span className={`font-semibold truncate block ${isExpired ? 'text-red-400' : 'text-slate-300'}`}>
                        {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling Admission'}
                      </span>
                    </div>
                  </div>

                  {/* Location & Tags */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{opp.location.city}, {opp.location.countryCode}</span>
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      isExpired ? 'bg-red-950/80 text-red-400' : 'bg-emerald-950/80 text-emerald-400'
                    }`}>
                      {opp.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-400 group-hover:text-cyan-300">
                  <span>View Details & Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View with Horizontal Scroll Container for Mobile */
        <div className="bg-[#080d19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-[#0b1222] border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Opportunity</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Funding / Prize</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => setSelectedOpportunity(opp)}
                    className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 max-w-[260px]">
                      <div className="font-bold text-white truncate">{opp.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{opp.category}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                        {opp.opportunityType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{opp.organizationName}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">
                      {opp.fundingAmount || opp.prize || 'Funded'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {opp.location.city}, {opp.location.countryCode}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          opp.status === 'ACTIVE' || opp.status === 'OPEN' || opp.status === 'DEADLINE_APPROACHING'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {opp.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-bold transition-colors">
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
