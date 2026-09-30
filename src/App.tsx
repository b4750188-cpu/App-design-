import React from 'react';
import { AIHeavenProvider, useAIHeaven } from './context/AIHeavenContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { WorldMonitorMap } from './components/WorldMonitorMap';
import { LiveIntelligenceFeed } from './components/LiveIntelligenceFeed';
import { BottomTimeline } from './components/BottomTimeline';
import { EntityIntelligencePanel } from './components/EntityIntelligencePanel';
import { CommandPalette } from './components/CommandPalette';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { DiscoverView } from './views/DiscoverView';
import { ResourcesView } from './views/ResourcesView';
import { ModelsView } from './views/ModelsView';
import { ToolsView } from './views/ToolsView';
import { DatasetsView } from './views/DatasetsView';
import { GitHubView } from './views/GitHubView';
import { ResearchView } from './views/ResearchView';
import { ProjectsView } from './views/ProjectsView';
import { SavedView } from './views/SavedView';
import { AgentsView } from './views/AgentsView';
import { AdminView } from './views/AdminView';
import { OpportunitiesDirectoryView } from './views/OpportunitiesDirectoryView';
import { OrganizationsDirectoryView } from './views/OrganizationsDirectoryView';
import { PersonasDirectoryView } from './views/PersonasDirectoryView';
import { IngestionEngineView } from './views/IngestionEngineView';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';

const MainContent: React.FC = () => {
  const { activeNav } = useAIHeaven();

  switch (activeNav) {
    case 'monitor':
      return <WorldMonitorMap />;
    case 'opportunities':
      return <OpportunitiesDirectoryView />;
    case 'organizations':
      return <OrganizationsDirectoryView />;
    case 'personas':
      return <PersonasDirectoryView />;
    case 'ingestion':
      return <IngestionEngineView />;
    case 'discover':
      return <DiscoverView />;
    case 'resources':
      return <ResourcesView />;
    case 'models':
      return <ModelsView />;
    case 'tools':
      return <ToolsView />;
    case 'datasets':
      return <DatasetsView />;
    case 'github':
      return <GitHubView />;
    case 'research':
      return <ResearchView />;
    case 'graph':
      return <KnowledgeGraphView />;
    case 'projects':
      return <ProjectsView />;
    case 'saved':
      return <SavedView />;
    case 'agents':
      return <AgentsView />;
    case 'admin':
      return <AdminView />;
    default:
      return <WorldMonitorMap />;
  }
};

const AppShell: React.FC = () => {
  const { activeNav } = useAIHeaven();

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#04060d] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Center Area: Left Sidebar + Center View + Right Live Feed */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation */}
        <Sidebar />

        {/* Center Content Surface */}
        <main className="flex-1 relative flex flex-col overflow-y-auto bg-[#04060d] overscroll-contain">
          <MainContent />
        </main>

        {/* Right Live Intelligence Feed */}
        <LiveIntelligenceFeed />

        {/* Detail Inspection Drawer Overlay */}
        <EntityIntelligencePanel />

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal />

        {/* Command Palette Modal (Ctrl+K) */}
        <CommandPalette />
      </div>

      {/* Bottom Timeline Bar */}
      <BottomTimeline />
    </div>
  );
};

export function App() {
  return (
    <AIHeavenProvider>
      <AppShell />
    </AIHeavenProvider>
  );
}

export default App;
