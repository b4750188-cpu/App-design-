import React from 'react';
import { FileText, BookOpen, ExternalLink, Award, Users, ArrowRight } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';

export const ResearchView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const papers = entities.filter((e) => e.category === 'research');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold mb-1">
          <FileText className="w-4 h-4" />
          <span>SCIENTIFIC RESEARCH INDEX</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Landmark AI Research Papers & Literature</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Seminal architecture papers, mathematical foundations, peer-reviewed publications, and citation networks.
        </p>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => setSelectedEntity(paper)}
            className="p-4 rounded-xl bg-[#090d18] border border-slate-800 hover:border-rose-500/60 transition-all cursor-pointer group space-y-3 font-mono"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-rose-400 font-bold uppercase">{paper.researchMetadata?.venue || 'arXiv'}</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <Award className="w-3 h-3" />
                <span>{paper.researchMetadata?.citations?.toLocaleString() || '1,000+'} CITATIONS</span>
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                {paper.name}
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-2">{paper.tagline}</div>
            </div>

            {/* Authors */}
            {paper.researchMetadata?.authors && (
              <div className="p-2 rounded bg-slate-950 border border-slate-900 text-[10px] space-y-1">
                <div className="text-slate-500 flex items-center space-x-1">
                  <Users className="w-3 h-3 text-cyan-400" />
                  <span>AUTHORS & AFFILIATION:</span>
                </div>
                <div className="text-slate-300 truncate">{paper.researchMetadata.authors.join(', ')}</div>
                <div className="text-slate-500">{paper.researchMetadata.affiliation}</div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>{paper.license}</span>
              <span className="text-rose-400 group-hover:underline flex items-center">
                Inspect Publication <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
