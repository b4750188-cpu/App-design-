import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Filter,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Briefcase,
  Users,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { StructuredOrganization, BusinessType } from '../server/opportunityEngine/types.ts';

const BUSINESS_TYPE_OPTIONS: BusinessType[] = [
  'Startup',
  'SME',
  'Enterprise',
  'Nonprofit',
  'NGO',
  'University',
  'Research Organization',
  'Government Organization',
  'Accelerator',
  'Incubator',
  'Venture Capital',
  'Investment Firm',
  'Technology Company',
  'Service Business',
  'Manufacturer',
  'Media Organization',
  'Community',
  'Other',
];

export const OrganizationsDirectoryView: React.FC = () => {
  const { organizations, opportunities, setSelectedOpportunity, setActiveNav } = useAIHeaven();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedOrg, setSelectedOrg] = useState<StructuredOrganization | null>(null);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      if (selectedType !== 'ALL' && !org.businessTypes.includes(selectedType as BusinessType)) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesIndustry = org.industry.toLowerCase().includes(q);
        const matchesSector = org.sector.toLowerCase().includes(q);
        const matchesHq = `${org.headquarters.city} ${org.headquarters.country}`.toLowerCase().includes(q);
        const matchesDesc = org.description.toLowerCase().includes(q);
        const matchesProducts = org.productsServices.some((p) => p.toLowerCase().includes(q));
        if (!matchesName && !matchesIndustry && !matchesSector && !matchesHq && !matchesDesc && !matchesProducts) {
          return false;
        }
      }
      return true;
    });
  }, [organizations, selectedType, search]);

  const orgOpportunities = useMemo(() => {
    if (!selectedOrg) return [];
    return opportunities.filter((o) => o.organizationId === selectedOrg.id);
  }, [selectedOrg, opportunities]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
              <Building2 className="w-4 h-4" />
              <span>GLOBAL ORGANIZATIONS & ENTERPRISES DIRECTORY</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verified Organization Intelligence Profiles
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Comprehensive institutional profiles spanning Startups, Accelerators, Universities, Nonprofits, NGOs, and Government Programs.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#080d19] border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Organizations:</span>
            <span className="text-cyan-400 font-bold">{organizations.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">100% Provenance Verified</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-[#080d19] border border-slate-800/90 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations by name, sector, headquarters, or services..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Business Type Selector */}
          <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
            <span className="text-slate-400 text-[11px]">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by business type"
              className="bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Business Types ({organizations.length})</option>
              {BUSINESS_TYPE_OPTIONS.map((bt) => {
                const count = organizations.filter((o) => o.businessTypes.includes(bt)).length;
                return (
                  <option key={bt} value={bt}>
                    {bt} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Business Type Quick Filter Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
              selectedType === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Types
          </button>
          {BUSINESS_TYPE_OPTIONS.slice(0, 10).map((bt) => {
            const count = organizations.filter((o) => o.businessTypes.includes(bt)).length;
            if (count === 0) return null;
            const isSelected = selectedType === bt;
            return (
              <button
                key={bt}
                onClick={() => setSelectedType(bt)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {bt} <span className="text-[10px] text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Organization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.map((org) => {
          const offeredOpps = opportunities.filter((o) => o.organizationId === org.id);

          return (
            <div
              key={org.id}
              onClick={() => setSelectedOrg(org)}
              className="p-4 rounded-2xl bg-[#080d19]/90 hover:bg-[#0b1222] border border-slate-800/90 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                {/* Header with Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-mono leading-tight">
                      {org.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{org.industry}</div>
                  </div>

                  <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[10px] font-bold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{org.trustScore}%</span>
                  </div>
                </div>

                {/* Multiple Business Type Badges */}
                <div className="flex flex-wrap gap-1">
                  {org.businessTypes.map((bt) => (
                    <span
                      key={bt}
                      className="px-2 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      {bt}
                    </span>
                  ))}
                  {org.organizationStatus && (
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                      {org.organizationStatus}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {org.description}
                </p>

                {/* Key Attributes */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>HQ:</span>
                    </span>
                    <span className="text-slate-300 truncate max-w-[170px]">
                      {org.headquarters.city}, {org.headquarters.country}
                    </span>
                  </div>

                  {org.foundedYear && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Founded:</span>
                      </span>
                      <span className="text-slate-300">{org.foundedYear}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-slate-500">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>Opportunities Offered:</span>
                    </span>
                    <span className="text-cyan-400 font-bold">{offeredOpps.length} active</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-cyan-400 group-hover:text-cyan-300">
                <span>Inspect Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Organization Drawer / Modal */}
      {selectedOrg && (
        <div
          onClick={() => setSelectedOrg(null)}
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[92dvh] bg-[#070b15] border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col font-mono text-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 bg-[#090e1c] flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedOrg.businessTypes.map((bt) => (
                    <span
                      key={bt}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase"
                    >
                      {bt}
                    </span>
                  ))}
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedOrg.trustScore}% TRUST</span>
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">{selectedOrg.name}</h2>
                <div className="text-xs text-slate-400 font-sans">
                  {selectedOrg.industry} • {selectedOrg.sector}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 font-sans overscroll-contain">
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  About Organization
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedOrg.description}</p>
              </div>

              {/* Headquarters & Coverage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">HEADQUARTERS:</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedOrg.headquarters.formattedAddress ||
                      `${selectedOrg.headquarters.city}, ${selectedOrg.headquarters.country}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">COUNTRIES SERVED:</span>
                  <span className="text-slate-200">{selectedOrg.countriesServed.join(', ')}</span>
                </div>
                {selectedOrg.foundedYear && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">FOUNDED YEAR:</span>
                    <span className="text-slate-200">{selectedOrg.foundedYear}</span>
                  </div>
                )}
                {selectedOrg.companySize && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">ORGANIZATION SIZE:</span>
                    <span className="text-slate-200">{selectedOrg.companySize}</span>
                  </div>
                )}
              </div>

              {/* Products & Programs */}
              {selectedOrg.productsServices.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Key Offerings & Programs
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOrg.productsServices.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities Offered */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Opportunities Offered ({orgOpportunities.length})
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedOrg(null);
                      setActiveNav('opportunities');
                    }}
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    View All in Directory →
                  </button>
                </div>

                <div className="space-y-2">
                  {orgOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      onClick={() => {
                        setSelectedOrg(null);
                        setSelectedOpportunity(opp);
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white font-mono">{opp.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                          <span className="text-cyan-400 font-mono font-semibold">{opp.opportunityType}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono">{opp.fundingAmount || 'Funded'}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Provenance */}
              <div className="p-3 rounded-xl bg-[#050a16] border border-slate-800/90 font-mono text-[10.5px] space-y-1 text-slate-400">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>DATA PROVENANCE & OFFICIAL AUDIT</span>
                </div>
                <div>Source: {selectedOrg.provenance.connectorId}</div>
                <div>Last Verified: {selectedOrg.lastVerifiedDate}</div>
                {selectedOrg.website && (
                  <div className="pt-1">
                    <a
                      href={selectedOrg.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Visit Official Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
