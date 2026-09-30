import React from 'react';
import { GitBranch, Star, GitFork, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';

export const GitHubView: React.FC = () => {
  const { entities, setSelectedEntity } = useAIHeaven();

  const repos = entities.filter((e) => e.category === 'github');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 font-mono">
        <div className="flex items-center space-x-2 text-sky-400 text-xs font-semibold mb-1">
          <GitBranch className="w-4 h-4" />
          <span>OPEN REPOSITORIES RADAR</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">GitHub Intelligence & Star Velocity</h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Tracking critical open-source deep learning repositories, maintainers, star trajectories, and releases.
        </p>
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => setSelectedEntity(repo)}
            className="p-4 rounded-xl bg-[#090d18] border border-slate-800 hover:border-sky-500/60 transition-all cursor-pointer group space-y-3 font-mono"
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-sky-400 font-bold uppercase">{repo.githubMetadata?.repoOwner || 'open-source'}</span>
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{repo.githubMetadata?.stars.toLocaleString() || '10,000+'}</span>
                </span>
                <span className="flex items-center space-x-1 text-slate-400">
                  <GitFork className="w-3 h-3" />
                  <span>{repo.githubMetadata?.forks.toLocaleString() || '1,000+'}</span>
                </span>
              </div>
            </div>

            <div>
              <div className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                {repo.name}
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-2">{repo.tagline}</div>
            </div>

            {/* Topics */}
            {repo.githubMetadata?.topics && (
              <div className="flex flex-wrap gap-1 font-mono text-[9.5px]">
                {repo.githubMetadata.topics.map((t) => (
                  <span key={t} className="px-1.5 py-0.2 rounded bg-sky-950/60 border border-sky-800/40 text-sky-300">
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>LANG: {repo.githubMetadata?.primaryLanguage || 'Python'}</span>
              <span className="text-sky-400 group-hover:underline flex items-center">
                Inspect Repository <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
