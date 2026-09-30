import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building,
  CheckCircle,
  Award,
  ArrowRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { StructuredPersona, PersonaType } from '../server/opportunityEngine/types.ts';

const PERSONA_TYPES: PersonaType[] = [
  'Founder',
  'CEO',
  'Executive',
  'Investor',
  'Recruiter',
  'Hiring Manager',
  'Student',
  'Researcher',
  'Developer',
  'Entrepreneur',
  'Mentor',
  'Professor',
  'Program Manager',
  'NGO Representative',
  'Government Representative',
  'Other',
];

export const PersonasDirectoryView: React.FC = () => {
  const { personas, organizations, opportunities, setSelectedOpportunity } = useAIHeaven();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredPersonas = useMemo(() => {
    return personas.filter((p) => {
      if (selectedType !== 'ALL' && p.personaType !== selectedType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesRole = p.roleTitle.toLowerCase().includes(q);
        const matchesOrg = p.organizationName.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesOrg) return false;
      }
      return true;
    });
  }, [personas, selectedType, search]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold mb-1">
              <Users className="w-4 h-4" />
              <span>PUBLIC PERSONAS & OFFICIAL CONTACT PROFILES</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verified Public Personas Directory
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Publicly documented founders, executives, researchers, and program managers connected to organizations and opportunities.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#080d19] border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Total Personas:</span>
            <span className="text-cyan-400 font-bold">{personas.length}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">Public Official Channels Only</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 font-mono text-xs text-cyan-300 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white uppercase tracking-wider text-[11px]">
            Strict Public Information Classification & Provenance Guarantee
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
            All contact channels listed below are restricted strictly to publicly published official organization directories, verified press announcements, or legitimate institutional contact pages. Private or unverified contact data is never collected or inferred.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3 bg-[#080d19] border border-slate-800/90 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, leadership role, or affiliated organization..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs shrink-0">
            <span className="text-slate-400 text-[11px]">Role Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter by persona role type"
              className="bg-slate-900 border border-slate-700/80 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Persona Types ({personas.length})</option>
              {PERSONA_TYPES.map((pt) => {
                const count = personas.filter((p) => p.personaType === pt).length;
                return (
                  <option key={pt} value={pt}>
                    {pt} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
              selectedType === 'ALL'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Roles
          </button>
          {PERSONA_TYPES.slice(0, 8).map((pt) => {
            const count = personas.filter((p) => p.personaType === pt).length;
            if (count === 0) return null;
            const isSelected = selectedType === pt;
            return (
              <button
                key={pt}
                onClick={() => setSelectedType(pt)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition border ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {pt} <span className="text-[10px] text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonas.map((persona) => {
          const relatedOpps = opportunities.filter((o) => persona.relevantOpportunityIds.includes(o.id));

          return (
            <div
              key={persona.id}
              className="p-4 rounded-2xl bg-[#080d19]/90 border border-slate-800/90 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono leading-tight">
                      {persona.name}
                    </h3>
                    <div className="text-xs text-cyan-400 font-mono mt-0.5 font-semibold">
                      {persona.roleTitle}
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800 shrink-0">
                    {persona.personaType}
                  </span>
                </div>

                {/* Affiliated Organization */}
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                  <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{persona.organizationName}</span>
                </div>

                {/* Public Official Contact Block */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Public Official Channels
                  </div>

                  {persona.publicContact.publicOfficeLocation && (
                    <div className="flex items-center space-x-1.5 text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{persona.publicContact.publicOfficeLocation}</span>
                    </div>
                  )}

                  {persona.publicContact.officialContactPageUrl && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={persona.publicContact.officialContactPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline truncate flex items-center space-x-1"
                      >
                        <span>Official Contact Desk</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}

                  {persona.publicProfileUrl && (
                    <div className="flex items-center space-x-1.5 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <a
                        href={persona.publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline truncate"
                      >
                        Public Professional Profile
                      </a>
                    </div>
                  )}
                </div>

                {/* Connected Opportunities */}
                {relatedOpps.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">CONNECTED PROGRAM:</span>
                    {relatedOpps.map((opp) => (
                      <button
                        key={opp.id}
                        onClick={() => setSelectedOpportunity(opp)}
                        className="text-left w-full text-xs text-slate-200 hover:text-cyan-300 font-mono truncate block hover:underline"
                      >
                        → {opp.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Provenance Footer */}
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="truncate">Source: {persona.provenance.sourceName}</span>
                <span className="text-emerald-400 font-bold shrink-0 ml-1">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
