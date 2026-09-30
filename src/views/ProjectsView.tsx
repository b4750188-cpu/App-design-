import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  X,
  Download,
  Share2,
  ArrowRight,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from '../components/WorldMonitorMap';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    createProject,
    deleteProject,
    removeEntityFromProject,
    entities,
    setSelectedEntity,
  } = useAIHeaven();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    createProject(newProjectName.trim(), newProjectDesc.trim());
    setNewProjectName('');
    setNewProjectDesc('');
    setShowCreateModal(false);
  };

  const handleExportProjectJson = (proj: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(proj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${proj.name.toLowerCase().replace(/\s+/g, '_')}_spec.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-wrap items-center justify-between gap-3 font-mono">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-semibold mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>AI ARCHITECTURE WORKSPACES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Project Stacks & Architecture Bundles</h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Curate, bundle, and export custom AI stacks combining frontier models, vector databases, and evaluation datasets.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-semibold shadow-lg shadow-violet-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Stack</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 font-mono text-xs space-y-2">
            <FolderGit2 className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
            <div>No project bundles created yet.</div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-semibold"
            >
              Create your first project stack
            </button>
          </div>
        ) : (
          projects.map((project) => {
            const bundledEntities = entities.filter((e) => project.entityIds.includes(e.id));
            return (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-[#090d18] border border-slate-800/90 space-y-3 font-mono"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white">{project.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800">
                        {project.entityIds.length} ENTITIES
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">{project.description}</div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={() => handleExportProjectJson(project)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white"
                      title="Export Stack Spec JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1.5 rounded bg-slate-900 hover:bg-red-950/80 border border-slate-800 text-slate-400 hover:text-red-400"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bundled Items Grid */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase">BUNDLED INFRASTRUCTURE & ASSETS:</div>

                  {bundledEntities.length === 0 ? (
                    <div className="text-xs text-slate-500 italic p-3 rounded bg-slate-950/60 border border-slate-900">
                      No entities added to this project yet. Open any entity in Monitor or Models and click &quot;Add to Workspace Project&quot;.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {bundledEntities.map((item) => {
                        const theme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.company;
                        return (
                          <div
                            key={item.id}
                            className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between group"
                          >
                            <div
                              onClick={() => setSelectedEntity(item)}
                              className="cursor-pointer space-y-0.5 truncate pr-2"
                            >
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: theme.color }}
                                />
                                <span className="font-semibold text-white text-xs truncate group-hover:text-cyan-300">
                                  {item.name}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase">{item.category}</div>
                            </div>

                            <button
                              onClick={() => removeEntityFromProject(project.id, item.id)}
                              className="text-slate-600 hover:text-red-400 p-1"
                              title="Remove from project"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#090d19] border border-slate-700 rounded-xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">CREATE NEW AI STACK</span>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400">STACK NAME *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Autonomous Coding Agent Stack"
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-600 outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Describe the architectural goals and constraints..."
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-600 outline-none focus:border-violet-500 font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                >
                  Create Stack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
