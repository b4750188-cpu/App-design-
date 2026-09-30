import React from 'react';
import {
  ExternalLink,
  Globe,
  Phone,
  Star,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { EnrichedBusiness } from '../types/client.ts';

interface BusinessListProps {
  businesses: EnrichedBusiness[];
  onSelectBusiness: (id: string) => void;
  onSaveLead: (businessId: string) => void;
  onAuditWebsite: (businessId: string) => void;
  onRescanBusiness: (businessId: string) => void;
  selectedId?: string;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  onSelectBusiness,
  onSaveLead,
  onAuditWebsite,
  onRescanBusiness,
  selectedId,
}) => {
  if (businesses.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">No Businesses Discovered Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Execute a discovery query using the search bar above to pull real establishments from Google Places API
          worldwide.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {businesses.length} Verified Establishments</span>
        <span>Click any card to inspect full evidence, audit website, or log outreach</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((biz) => {
          const isSelected = selectedId === biz.id;
          const hasWebsite = biz.websiteStatus === 'WEBSITE_DETECTED';

          return (
            <div
              key={biz.id}
              onClick={() => onSelectBusiness(biz.id)}
              className={`bg-slate-900/90 border rounded-2xl p-5 hover:border-indigo-500/60 transition-all duration-150 cursor-pointer flex flex-col justify-between group shadow-lg ${
                isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-850' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Category & Website status badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono">
                    {biz.primaryCategory.replace(/_/g, ' ')}
                  </span>

                  {hasWebsite ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <Globe className="w-3 h-3 text-emerald-400" />
                      <span>Website Detected</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>No Website from Provider</span>
                    </span>
                  )}
                </div>

                {/* Business Name */}
                <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {biz.name}
                </h4>

                {/* Address & Country */}
                <div className="flex items-start space-x-1.5 text-xs text-slate-400 mb-3 line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{biz.formattedAddress || 'Location details not available'}</span>
                </div>

                {/* Rating & Phone */}
                <div className="flex items-center space-x-3 text-xs text-slate-400 mb-4">
                  {biz.rating !== undefined && (
                    <div className="flex items-center space-x-1 text-amber-400 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{biz.rating.toFixed(1)}</span>
                      {biz.reviewCount !== undefined && (
                        <span className="text-slate-500 font-normal">({biz.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {typeof biz.rawData?.googleMapsUri === 'string' && (
                    <a
                      href={biz.rawData.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <span>Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Opportunity Highlight */}
                {biz.topOpportunity && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
                      Identified Opportunity
                    </div>
                    <div className="text-xs text-slate-200 line-clamp-2">{biz.topOpportunity}</div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {biz.isLead ? (
                    <span className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Lead: {biz.leadStatus}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveLead(biz.id);
                      }}
                      className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                      <span>Save Lead</span>
                    </button>
                  )}

                  {hasWebsite && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAuditWebsite(biz.id);
                      }}
                      className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 transition"
                      title="Run automated SSRF-safe website crawl & audit"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{biz.auditStatus === 'COMPLETED' ? 'Re-audit' : 'Audit'}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-indigo-300 font-medium">
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
