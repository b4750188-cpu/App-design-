import React, { useState } from 'react';
import { Flame, AlertTriangle, Smartphone, Zap, PhoneCall, Calendar, Share2, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { EnrichedBusiness } from '../types/client.ts';
import { OpportunityType } from '../server/types.ts';

interface OpportunitiesViewProps {
  businesses: EnrichedBusiness[];
  onSelectBusiness: (businessId: string) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ businesses, onSelectBusiness }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Collect opportunity occurrences
  const allOpps: Array<{
    business: EnrichedBusiness;
    type: OpportunityType;
    title?: string;
  }> = [];

  for (const b of businesses) {
    if (b.topOpportunityType) {
      allOpps.push({
        business: b,
        type: b.topOpportunityType as OpportunityType,
        title: b.topOpportunity,
      });
    }
  }

  const filteredOpps = allOpps.filter((item) => {
    if (selectedType !== 'ALL' && item.type !== selectedType) return false;
    return true;
  });

  const countForType = (type: string) => {
    if (type === 'ALL') return allOpps.length;
    return allOpps.filter((o) => o.type === type).length;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Modernization Opportunities Portfolio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-backed deficiencies categorized across discovered establishments.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Total Flagged: <span className="text-indigo-400 font-bold">{allOpps.length}</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'All Opportunities' },
          { id: 'NO_WEBSITE_DETECTED', label: 'No Website from Provider' },
          { id: 'WEBSITE_ACCESSIBLE_BUT_ISSUES_FOUND', label: 'Insecure HTTP / SSL' },
          { id: 'MOBILE_IMPROVEMENT', label: 'Mobile Viewport Missing' },
          { id: 'CONTACT_IMPROVEMENT', label: 'Missing Contact Form' },
          { id: 'BOOKING_IMPROVEMENT', label: 'Missing Booking System' },
          { id: 'PERFORMANCE_IMPROVEMENT', label: 'Slow TTFB (>2.5s)' },
          { id: 'SOCIAL_TO_WEBSITE_OPPORTUNITY', label: 'Social Without Hub' },
          { id: 'OUTDATED_CONTENT_SIGNAL', label: 'Outdated Copyright' },
        ].map((tab) => {
          const count = countForType(tab.id);
          const isSelected = selectedType === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Opportunity Items */}
      {filteredOpps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <CheckCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Opportunities Found Under Selected Category</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Discover more establishments or choose another category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOpps.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectBusiness(item.business.id)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer flex flex-col justify-between group shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.business.primaryCategory.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/60">
                    {item.type}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {item.business.name}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                  {item.business.formattedAddress}
                </p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-3">
                  <div className="text-[11px] font-semibold text-amber-300 mb-0.5">Identified Issue:</div>
                  <div className="text-xs text-slate-200">{item.title}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-indigo-300">
                <span>Inspect Evidence & Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
