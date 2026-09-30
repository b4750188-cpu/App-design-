import React from 'react';
import { Database, FileCode, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';

export const DatasetsView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const datasets = entities.filter((e) => e.category === 'dataset');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1">
          <Database className="w-4 h-4" />
          <span>PRETRAINING & EVALUATION DATASETS</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Curated Machine Learning Datasets</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Corpora token counts, extraction domains, file formats, and licensing attribution records.
        </p>
      </div>

      {/* Datasets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            onClick={() => setSelectedEntity(dataset)}
            className="p-4 rounded-xl bg-[#090d18] border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer group space-y-3 font-mono"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-amber-400 font-bold uppercase">{dataset.organization}</span>
              <span className="text-emerald-400 font-bold">{dataset.trustScore}% TRUST</span>
            </div>

            <div>
              <div className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {dataset.name}
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-2">{dataset.tagline}</div>
            </div>

            {/* Dataset Specs Box */}
            {dataset.datasetMetadata && (
              <div className="p-3 rounded bg-slate-950 border border-slate-900 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">CORPUS SIZE:</span>
                  <span className="text-amber-300 font-bold">{dataset.datasetMetadata.sizeFormatted}</span>
                </div>
                {dataset.datasetMetadata.recordCount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">TOKEN COUNT:</span>
                    <span className="text-white">{dataset.datasetMetadata.recordCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">DOMAIN:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{dataset.datasetMetadata.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FORMATS:</span>
                  <span className="text-slate-400">{dataset.datasetMetadata.formats.join(', ')}</span>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>{dataset.license}</span>
              <span className="text-amber-400 group-hover:underline flex items-center">
                Inspect Dataset Specs <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
