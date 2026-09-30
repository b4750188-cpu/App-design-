import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Calendar,
  Phone,
  Tag,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  MessageSquare,
  Trash2,
  Filter,
} from 'lucide-react';
import { EnrichedLead } from '../types/client.ts';
import { LeadStatus } from '../server/types.ts';

interface LeadsPipelineProps {
  leads: EnrichedLead[];
  onSelectBusiness: (businessId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: LeadStatus) => void;
  onRemoveLead: (leadId: string) => void;
}

const PIPELINE_COLUMNS: Array<{ status: LeadStatus; label: string; color: string }> = [
  { status: 'NEW', label: 'New Saved', color: 'bg-blue-500' },
  { status: 'RESEARCHING', label: 'Researching', color: 'bg-purple-500' },
  { status: 'CONTACTED', label: 'Contacted', color: 'bg-amber-500' },
  { status: 'FOLLOW_UP', label: 'Follow Up', color: 'bg-indigo-500' },
  { status: 'INTERESTED', label: 'Interested', color: 'bg-emerald-500' },
  { status: 'PROPOSAL', label: 'Proposal Sent', color: 'bg-teal-500' },
  { status: 'WON', label: 'Won / Signed', color: 'bg-green-500' },
];

export const LeadsPipeline: React.FC<LeadsPipelineProps> = ({
  leads,
  onSelectBusiness,
  onUpdateLeadStatus,
  onRemoveLead,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const categories = Array.from(new Set(leads.map((l) => l.businessCategory))).filter(Boolean);

  const filteredLeads = leads.filter((l) => {
    if (filterCategory !== 'ALL' && l.businessCategory !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Opportunities Lead Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage relationships, track manual outreach outcomes, and schedule client follow-ups.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Categories ({leads.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Leads in Pipeline</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Discover establishments in the Discovery tab and click "Save Lead" to organize outreach and follow-ups.
          </p>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.status);

            return (
              <div
                key={col.status}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex flex-col min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-xs font-bold text-slate-200">{col.label}</span>
                  </div>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => onSelectBusiness(lead.businessId)}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-indigo-500/60 transition cursor-pointer shadow group text-left"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          {lead.businessCategory.replace(/_/g, ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLead(lead.id);
                          }}
                          className="text-slate-600 hover:text-red-400 p-0.5"
                          title="Remove Lead"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                        {lead.businessName}
                      </h4>

                      <div className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                        {lead.formattedAddress}
                      </div>

                      {lead.nextFollowUpDate && (
                        <div className="flex items-center space-x-1 text-[10px] text-indigo-400 font-mono mb-2">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          <span>Follow-up: {lead.nextFollowUpDate}</span>
                        </div>
                      )}

                      {/* Status Transition Selector */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                        >
                          {PIPELINE_COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>
                              Move: {c.label}
                            </option>
                          ))}
                          <option value="LOST">Move: Lost</option>
                          <option value="NOT_A_FIT">Move: Not A Fit</option>
                        </select>

                        <div className="text-[10px] text-slate-500 font-mono">
                          {lead.totalInteractions} logs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
