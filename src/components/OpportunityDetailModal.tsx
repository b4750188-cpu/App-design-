import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  CheckCircle,
  Copy,
  Check,
  Building,
  User,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { StructuredOpportunity } from '../server/opportunityEngine/types.ts';

export const OpportunityDetailModal: React.FC = () => {
  const { selectedOpportunity, setSelectedOpportunity, organizations, personas } = useAIHeaven();
  const [copied, setCopied] = useState(false);

  if (!selectedOpportunity) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedOpportunity.applicationUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedOrg = organizations.find((o) => o.id === selectedOpportunity.organizationId);
  const relatedPersonas = personas.filter((p) => selectedOpportunity.relatedPersonaIds.includes(p.id));

  const isExpired = selectedOpportunity.status === 'EXPIRED';

  return (
    <div
      onClick={() => setSelectedOpportunity(null)}
      className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92dvh] bg-[#070b15] border border-slate-700/90 rounded-2xl shadow-2xl flex flex-col font-mono text-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#090e1c] flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 uppercase">
                {selectedOpportunity.opportunityType.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                {selectedOpportunity.workMode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                  isExpired
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{selectedOpportunity.status}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedOpportunity.trustScore}% TRUST</span>
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug">
              {selectedOpportunity.title}
            </h2>

            <div className="text-xs text-slate-400 font-sans flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-cyan-300 font-semibold">{selectedOpportunity.organizationName}</span>
              <span>•</span>
              <span className="flex items-center space-x-1 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>
                  {selectedOpportunity.location.city}, {selectedOpportunity.location.country}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedOpportunity(null)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 font-sans overscroll-contain">
          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            {selectedOpportunity.fundingAmount && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  <span>FUNDING / PRIZE</span>
                </div>
                <div className="text-sm font-bold text-emerald-400">{selectedOpportunity.fundingAmount}</div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>APPLICATION DEADLINE</span>
              </div>
              <div className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-slate-200'}`}>
                {selectedOpportunity.deadline
                  ? new Date(selectedOpportunity.deadline).toLocaleDateString()
                  : 'Rolling Admission'}
              </div>
            </div>

            {selectedOpportunity.duration && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>PROGRAM DURATION</span>
                </div>
                <div className="text-xs font-bold text-slate-200">{selectedOpportunity.duration}</div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span>INDUSTRY & SECTOR</span>
              </div>
              <div className="text-xs font-bold text-slate-200 truncate">{selectedOpportunity.industry}</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-400">
              Opportunity Description & Overview
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedOpportunity.description}</p>
          </div>

          {/* Eligibility & Requirements */}
          <div className="p-4 rounded-xl bg-[#090d18] border border-slate-800 space-y-3 font-mono text-xs">
            <div className="font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>ELIGIBILITY CRITERIA & REQUIREMENTS</span>
            </div>

            <p className="text-slate-300 font-sans text-xs">{selectedOpportunity.eligibility}</p>

            {selectedOpportunity.requirements.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase">Submissions Required:</div>
                <ul className="space-y-1">
                  {selectedOpportunity.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-slate-300 font-sans text-xs">
                      <span className="text-cyan-400 font-mono font-bold shrink-0">▸</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Benefits */}
          {selectedOpportunity.benefits && selectedOpportunity.benefits.length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <h4 className="font-bold text-white">KEY PARTICIPANT BENEFITS</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedOpportunity.benefits.map((b, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300 text-xs font-sans flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Organization & Public Persona Contacts */}
          {(relatedOrg || relatedPersonas.length > 0) && (
            <div className="space-y-2.5 font-mono text-xs">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <Building className="w-4 h-4 text-indigo-400" />
                <span>CONNECTED ORGANIZATIONS & OFFICIAL CONTACTS</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {relatedOrg && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase">Host Organization:</div>
                    <div className="font-bold text-white">{relatedOrg.name}</div>
                    <div className="text-[11px] text-slate-400 font-sans line-clamp-1">{relatedOrg.description}</div>
                    <a
                      href={relatedOrg.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 text-[10px] inline-flex items-center space-x-1 hover:underline pt-1"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {relatedPersonas.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>{p.personaType} (Official Contact)</span>
                    </div>
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{p.roleTitle}</div>
                    {p.publicContact.officialContactPageUrl && (
                      <a
                        href={p.publicContact.officialContactPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 text-[10px] inline-flex items-center space-x-1 hover:underline pt-1"
                      >
                        <span>Official Contact Channel</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provenance & Verification Metadata */}
          <div className="p-3 rounded-xl bg-[#050810] border border-slate-900 text-[10px] font-mono text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Source: <span className="text-slate-300">{selectedOpportunity.sourceName}</span></span>
              <span>Discovered: <span className="text-slate-300">{new Date(selectedOpportunity.publicationDate).toLocaleDateString()}</span></span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Status: <span className="text-emerald-400 font-bold">{selectedOpportunity.verificationState}</span></span>
              <span>Last Verified: <span className="text-slate-300">{selectedOpportunity.verificationDate || selectedOpportunity.lastVerifiedDate || '2026-09-30'}</span></span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080d19] flex items-center justify-between gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Application Link'}</span>
          </button>

          <a
            href={selectedOpportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <span>Apply on Official Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
