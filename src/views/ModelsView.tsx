import React, { useState } from 'react';
import { Cpu, Zap, Shield, ExternalLink, SlidersHorizontal, Check } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { ModalityType } from '../types/aiHeaven';

export const ModelsView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const [selectedModality, setSelectedModality] = useState<string>('ALL');

  const models = entities.filter((e) => e.category === 'model');

  const filteredModels = models.filter((m) => {
    if (selectedModality === 'ALL') return true;
    return m.modelMetadata?.modalities.includes(selectedModality as ModalityType);
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold mb-1">
          <Cpu className="w-4 h-4" />
          <span>FRONTIER MODEL REGISTRY</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Models & Weights Database</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Technical specifications, context windows, benchmark reproducibility scores, and accelerator compatibility.
        </p>
      </div>

      {/* Modality Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        {['ALL', 'text', 'multimodal', 'vision', 'audio', 'code'].map((mod) => (
          <button
            key={mod}
            onClick={() => setSelectedModality(mod)}
            className={`px-3 py-1 rounded border text-[11px] font-semibold transition-all ${
              selectedModality === mod
                ? 'bg-purple-950/80 border-purple-700 text-purple-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {mod.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Models Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => setSelectedEntity(model)}
            className="p-4 rounded-xl bg-[#090d18] border border-slate-800/90 hover:border-purple-500/60 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-purple-400 font-bold uppercase">{model.organization}</span>
                <span className="text-emerald-400 font-bold">{model.trustScore}% TRUST</span>
              </div>

              <div className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                {model.name}
              </div>

              <div className="text-xs text-slate-400 font-sans line-clamp-2">{model.tagline}</div>

              {/* Specs Box */}
              <div className="p-2.5 rounded bg-slate-950/80 border border-slate-900 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">CONTEXT:</span>
                  <span className="text-purple-300 font-semibold">
                    {model.modelMetadata?.contextWindow || '128k tokens'}
                  </span>
                </div>
                {model.modelMetadata?.parameters && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PARAMS:</span>
                    <span className="text-white">{model.modelMetadata.parameters}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">LICENSE:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{model.license}</span>
                </div>
              </div>

              {/* Benchmarks Snippet */}
              {model.modelMetadata?.benchmarks && (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1 text-[10px]">
                  {Object.entries(model.modelMetadata.benchmarks).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="p-1 rounded bg-slate-900/60 border border-slate-800 flex justify-between">
                      <span className="text-slate-500 truncate mr-1">{k}:</span>
                      <span className="text-emerald-400 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{model.isOpensource ? 'Open Weights' : 'API Service'}</span>
              <span className="text-purple-400 group-hover:underline">Inspect Architecture →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
