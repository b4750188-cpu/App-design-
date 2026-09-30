import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { EnrichedFollowUp } from '../types/client.ts';

interface FollowUpsViewProps {
  followUps: EnrichedFollowUp[];
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onSelectBusiness: (businessId: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  onToggleComplete,
  onSelectBusiness,
}) => {
  const pending = followUps.filter((f) => !f.isCompleted);
  const completed = followUps.filter((f) => f.isCompleted);

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Scheduled Outreach Follow-ups</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Never lose track of interested business owners or requested proposals.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800">
            {pending.length} Pending
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            {completed.length} Completed
          </span>
        </div>
      </div>

      {followUps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Follow-ups Scheduled</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Log outreach interactions on any saved lead to schedule a reminder date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Follow-ups */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Action Items ({pending.length})</span>
            </h3>

            <div className="space-y-2">
              {pending.map((fu) => (
                <div
                  key={fu.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={fu.isCompleted}
                      onChange={(e) => onToggleComplete(fu.id, e.target.checked)}
                      className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{fu.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span>Establishment:</span>
                        <button
                          onClick={() => onSelectBusiness(fu.businessId)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                        >
                          {fu.businessName}
                        </button>
                        <span>•</span>
                        <span>Due: {fu.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectBusiness(fu.businessId)}
                    className="flex items-center space-x-1 text-xs text-slate-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg bg-slate-800"
                  >
                    <span>View Lead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Follow-ups */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed Tasks ({completed.length})</span>
              </h3>

              <div className="space-y-2 opacity-60">
                {completed.map((fu) => (
                  <div
                    key={fu.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={fu.isCompleted}
                        onChange={(e) => onToggleComplete(fu.id, e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 cursor-pointer"
                      />
                      <span className="line-through text-slate-400">{fu.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Completed {fu.completedAt ? new Date(fu.completedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
