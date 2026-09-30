import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Bookmark,
  FolderPlus,
  Share2,
  Copy,
  Check,
  Cpu,
  Terminal,
  Activity,
  GitBranch,
  Layers,
  MapPin,
  Calendar,
  Lock,
  Code,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from './WorldMonitorMap';

export const EntityIntelligencePanel: React.FC = () => {
  const {
    selectedEntity,
    setSelectedEntity,
    activeDetailTab,
    setActiveDetailTab,
    isSaved,
    toggleSaveEntity,
    projects,
    addEntityToProject,
  } = useAIHeaven();

  const [copied, setCopied] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectAddedMsg, setProjectAddedMsg] = useState(false);

  if (!selectedEntity) {
    return null;
  }

  const theme = CATEGORY_THEMES[selectedEntity.category] || CATEGORY_THEMES.company;
  const isBookmarked = isSaved(selectedEntity.id);

  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedEntity.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToProject = () => {
    if (!selectedProjectId) return;
    addEntityToProject(selectedProjectId, selectedEntity.id);
    setProjectAddedMsg(true);
    setTimeout(() => setProjectAddedMsg(false), 2500);
  };

  const tabs: {
    id: 'overview' | 'evidence' | 'relationships' | 'versions' | 'compatibility' | 'activity' | 'agent_api';
    label: string;
  }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'evidence', label: 'Evidence & Trust' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'versions', label: 'Versions' },
    { id: 'compatibility', label: 'Compatibility' },
    { id: 'activity', label: 'Activity' },
    { id: 'agent_api', label: 'Agent API' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] lg:w-[560px] max-w-full bg-[#070b14] border-l border-slate-800/90 shadow-2xl z-50 flex flex-col font-mono text-slate-200 select-none backdrop-blur-md animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-[#080d19] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider"
                style={{ backgroundColor: `${theme.color}20`, color: theme.color, border: `1px solid ${theme.color}50` }}
              >
                {theme.label}
              </span>

              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  {selectedEntity.location.city}, {selectedEntity.location.countryCode}
                </span>
              </span>

              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                {selectedEntity.version}
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug truncate">
              {selectedEntity.name}
            </h2>

            <div className="text-xs text-slate-400 font-sans truncate">{selectedEntity.organization}</div>
          </div>

          <button
            onClick={() => setSelectedEntity(null)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
            title="Close Panel (Esc)"
            aria-label="Close Intelligence Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 pt-2.5 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => toggleSaveEntity(selectedEntity.id)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-colors min-h-[32px] ${
              isBookmarked
                ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleCopyId}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors min-h-[32px]"
            title="Copy Machine Entity ID"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'ID'}</span>
          </button>

          {selectedEntity.websiteUrl && (
            <a
              href={selectedEntity.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors min-h-[32px]"
            >
              <span>Site</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          )}

          {selectedEntity.githubUrl && (
            <a
              href={selectedEntity.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors min-h-[32px]"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          )}

          <div className="flex-1 text-right min-w-[70px]">
            <span className="text-[10px] text-slate-500 font-mono">
              TRUST: <span className="text-emerald-400 font-bold">{selectedEntity.trustScore}%</span>
            </span>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center space-x-1 mt-2.5 overflow-x-auto text-[11px] pb-1 border-b border-slate-800/80 -mx-1 px-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors shrink-0 min-h-[30px] ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drawer Body (Tab Content) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {/* OVERVIEW TAB */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-4">
            {/* Tagline Box */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/90 text-sm font-medium text-slate-200 leading-snug">
              {selectedEntity.tagline}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Description</div>
              <p className="text-slate-300 leading-relaxed text-xs">{selectedEntity.description}</p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="space-y-1.5">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Specifications</div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">LICENSE</div>
                  <div className="text-slate-200 font-semibold">{selectedEntity.license}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">ARCHITECTURE</div>
                  <div className="text-slate-200 font-semibold">
                    {selectedEntity.isOpensource ? 'Open Source / Weights' : 'Proprietary / Managed API'}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">RELEASE DATE</div>
                  <div className="text-slate-200">{selectedEntity.releaseDate}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-500">LAST CHECKED</div>
                  <div className="text-slate-200">{selectedEntity.lastUpdated}</div>
                </div>
              </div>
            </div>

            {/* Category-Specific Metadata */}
            {selectedEntity.modelMetadata && (
              <div className="space-y-1.5">
                <div className="font-mono text-[10px] text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                  <Cpu className="w-3 h-3" />
                  <span>Model Architecture & Benchmarks</span>
                </div>
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/40 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Context Window:</span>
                    <span className="text-purple-300 font-bold">{selectedEntity.modelMetadata.contextWindow}</span>
                  </div>
                  {selectedEntity.modelMetadata.parameters && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parameter Count:</span>
                      <span className="text-white">{selectedEntity.modelMetadata.parameters}</span>
                    </div>
                  )}
                  {selectedEntity.modelMetadata.benchmarks && (
                    <div className="pt-2 border-t border-purple-900/40 space-y-1">
                      <div className="text-[10px] text-slate-500">BENCHMARK EVALUATIONS:</div>
                      {Object.entries(selectedEntity.modelMetadata.benchmarks).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[10px]">
                          <span className="text-slate-400">{k}</span>
                          <span className="text-emerald-400 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add to Project Form */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="font-mono text-[10px] text-slate-400 uppercase flex items-center justify-between">
                <span>Add to Workspace Project</span>
                {projectAddedMsg && <span className="text-emerald-400 font-bold">Added successfully!</span>}
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.entityIds.length} items)
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToProject}
                  disabled={!selectedProjectId}
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <div className="font-mono text-[10px] text-slate-500 uppercase">Tags & Taxonomies</div>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {selectedEntity.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVIDENCE & TRUST TAB */}
        {activeDetailTab === 'evidence' && (
          <div className="space-y-3 font-mono">
            {/* Status Card */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">VERIFICATION AUDIT STATUS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{selectedEntity.verificationStatus}</span>
                </span>
              </div>

              <div className="text-xs text-slate-300 font-sans">
                {selectedEntity.verificationEvidence || 'Verified against open foundation registers and cryptographic records.'}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
                <span>AUDIT INTEGRITY:</span>
                <span className="text-cyan-400">BENCHMARK REPRODUCED</span>
              </div>
            </div>

            {/* Trust Breakdown */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-[11px]">
              <div className="text-[10px] text-slate-500 uppercase">TRUST METRICS SCORING</div>
              <div className="flex justify-between items-center">
                <span>Reproducibility Score</span>
                <span className="text-emerald-400 font-bold">98/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Licensing Certainty</span>
                <span className="text-cyan-400 font-bold">100/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Provider Reputation</span>
                <span className="text-indigo-400 font-bold">96/100</span>
              </div>
            </div>

            {/* Label notice */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
              <span className="text-cyan-400 font-bold">LOCAL DEMO DATA NOTICE:</span> All ecosystem parameters are
              sourced from public whitepapers, LMSYS Chatbot Arena benchmarks, and GitHub open repositories for
              reproducible evaluation.
            </div>
          </div>
        )}

        {/* RELATIONSHIPS TAB */}
        {activeDetailTab === 'relationships' && (
          <div className="space-y-3 font-mono">
            <div className="text-[10px] text-slate-500 uppercase">
              CONNECTED RELATIONSHIP EDGES ({selectedEntity.relationships.length})
            </div>

            {selectedEntity.relationships.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No direct graph links cataloged yet.</div>
            ) : (
              selectedEntity.relationships.map((rel, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {rel.relation}
                    </span>
                    <div className="font-semibold text-white pt-1">{rel.targetName}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{rel.targetCategory}</div>
                  </div>
                  <button
                    onClick={() => {
                      const found = useAIHeaven; // switch entity
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300"
                  >
                    View Node →
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* VERSIONS TAB */}
        {activeDetailTab === 'versions' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase">RELEASES & ARCHIVE</div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{selectedEntity.version} (Active)</span>
                <span className="text-emerald-400 text-[10px]">CURRENT</span>
              </div>
              <div className="text-[10px] text-slate-400">Release Date: {selectedEntity.releaseDate}</div>
            </div>
          </div>
        )}

        {/* COMPATIBILITY TAB */}
        {activeDetailTab === 'compatibility' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase">HARDWARE & ECOSYSTEM COMPATIBILITY</div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
              <div className="text-[10px] text-slate-500">SUPPORTED ACCELERATORS:</div>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  NVIDIA CUDA / TensorRT-LLM
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Apple Silicon Metal / MLX
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  AMD ROCm
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  CPU AVX-512
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeDetailTab === 'activity' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase">AUDIT & UPDATE TIMELINE</div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>SYNCHRONIZED AUDIT</span>
                <span>{selectedEntity.lastUpdated}</span>
              </div>
              <div className="text-white text-xs font-sans">
                Entity record re-verified through automated telemetry scanner.
              </div>
            </div>
          </div>
        )}

        {/* AGENT API TAB */}
        {activeDetailTab === 'agent_api' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase">MACHINE-TO-MACHINE AGENT CONTRACT</div>
            <div className="p-3 rounded bg-[#050810] border border-slate-800 text-[10px] space-y-2">
              <div className="text-cyan-400 font-bold">GET /api/v1/entities/{selectedEntity.slug}</div>
              <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded border border-slate-900">
                {JSON.stringify(
                  {
                    id: selectedEntity.id,
                    name: selectedEntity.name,
                    category: selectedEntity.category,
                    version: selectedEntity.version,
                    trustScore: selectedEntity.trustScore,
                    license: selectedEntity.license,
                    location: selectedEntity.location,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-800 bg-[#070b14] text-[10px] text-slate-500 flex items-center justify-between">
        <span>ENTITY HASH: #{selectedEntity.id}</span>
        <button
          onClick={() => setSelectedEntity(null)}
          className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
        >
          Dismiss Panel
        </button>
      </div>
    </div>
  );
};
