import React from 'react';
import { Wrench, Terminal, Shield, Key, ExternalLink, ArrowRight, Activity } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';

export const ToolsView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const tools = entities.filter((e) => e.category === 'tool' || e.category === 'api');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-1">
          <Wrench className="w-4 h-4" />
          <span>TOOL & INFERENCE REGISTRY</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Inference Engines, SDKs & APIs</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Authentication contracts, input/output schemas, hardware throughput limits, and deployment documentation.
        </p>
      </div>

      {/* Tools Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedEntity(tool)}
            className="p-4 rounded-xl bg-[#090d18] border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group space-y-3 font-mono"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-bold uppercase">{tool.organization}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold">
                {tool.toolMetadata?.pricing || 'OPEN SOURCE'}
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                {tool.name}
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-2">{tool.tagline}</div>
            </div>

            {/* Inputs / Outputs Contract Box */}
            {tool.toolMetadata && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-900 space-y-2 text-[11px]">
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>INPUT SCHEMA:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {tool.toolMetadata.inputs.map((inp, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {inp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-slate-900">
                  <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>OUTPUTS:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {tool.toolMetadata.outputs.map((out, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {out}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-900 flex justify-between text-[10px]">
                  <span className="text-slate-500">AUTH TYPE:</span>
                  <span className="text-white font-semibold">{tool.toolMetadata.authType}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>{tool.license}</span>
              <span className="text-emerald-400 group-hover:underline flex items-center">
                Inspect Specs <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
