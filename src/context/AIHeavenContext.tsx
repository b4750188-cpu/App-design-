import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  AIEntity,
  ActivityItem,
  ActiveNavView,
  TimelineRange,
  ProjectBundle,
  VerificationQueueItem,
} from '../types/aiHeaven';
import {
  AI_ENTITIES,
  LIVE_ACTIVITY_STREAM,
  INITIAL_PROJECTS,
  VERIFICATION_QUEUE_DATA,
} from '../data/aiEcosystemData';
import {
  StructuredOpportunity,
  StructuredOrganization,
  StructuredPersona,
  DatabaseIntelligenceStats,
} from '../server/opportunityEngine/types.ts';

interface AIHeavenContextType {
  // Navigation & View
  activeNav: ActiveNavView;
  setActiveNav: (view: ActiveNavView) => void;
  selectedEntity: AIEntity | null;
  setSelectedEntity: (entity: AIEntity | null) => void;
  selectedOpportunity: StructuredOpportunity | null;
  setSelectedOpportunity: (opp: StructuredOpportunity | null) => void;
  activeDetailTab: 'overview' | 'evidence' | 'relationships' | 'versions' | 'compatibility' | 'activity' | 'agent_api';
  setActiveDetailTab: (tab: 'overview' | 'evidence' | 'relationships' | 'versions' | 'compatibility' | 'activity' | 'agent_api') => void;

  // Search & Global Command Palette
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  // Right Live Feed & Layout Controls
  isRightFeedOpen: boolean;
  setIsRightFeedOpen: (open: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;

  // Timeline Filtering
  timelineRange: TimelineRange;
  setTimelineRange: (range: TimelineRange) => void;

  // Category Filtering
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  // Entities & Activity
  entities: AIEntity[];
  filteredEntities: AIEntity[];
  filteredActivity: ActivityItem[];
  allActivity: ActivityItem[];

  // Opportunities, Organizations & Personas
  opportunities: StructuredOpportunity[];
  organizations: StructuredOrganization[];
  personas: StructuredPersona[];
  dbStats: DatabaseIntelligenceStats | null;
  refreshDbStats: () => Promise<void>;
  triggerSync: (connectorId?: string) => Promise<void>;

  // Saved / Bookmarks
  savedIds: string[];
  toggleSaveEntity: (id: string) => void;
  isSaved: (id: string) => boolean;

  // Projects
  projects: ProjectBundle[];
  createProject: (name: string, description: string) => void;
  addEntityToProject: (projectId: string, entityId: string) => void;
  removeEntityFromProject: (projectId: string, entityId: string) => void;
  deleteProject: (projectId: string) => void;

  // Verification Queue (Admin)
  verificationQueue: VerificationQueueItem[];
  approveVerification: (id: string) => void;
  rejectVerification: (id: string) => void;

  // Notifications
  notifications: { id: string; text: string; time: string; read: boolean }[];
  markNotificationAsRead: (id: string) => void;
}

const AIHeavenContext = createContext<AIHeavenContextType | undefined>(undefined);

export const AIHeavenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeNav, setActiveNav] = useState<ActiveNavView>('monitor');
  const [selectedEntity, setSelectedEntity] = useState<AIEntity | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<StructuredOpportunity | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'overview' | 'evidence' | 'relationships' | 'versions' | 'compatibility' | 'activity' | 'agent_api'
  >('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timelineRange, setTimelineRange] = useState<TimelineRange>('LIVE');

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRightFeedOpen, setIsRightFeedOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Entities & Activity
  const [entities] = useState<AIEntity[]>(AI_ENTITIES);
  const [allActivity] = useState<ActivityItem[]>(LIVE_ACTIVITY_STREAM);

  // Opportunities, Organizations & Personas
  const [opportunities, setOpportunities] = useState<StructuredOpportunity[]>([]);
  const [organizations, setOrganizations] = useState<StructuredOrganization[]>([]);
  const [personas, setPersonas] = useState<StructuredPersona[]>([]);
  const [dbStats, setDbStats] = useState<DatabaseIntelligenceStats | null>(null);

  // Initial fetch for opportunities, orgs, personas, and stats
  const fetchOpportunityData = async () => {
    try {
      const [oppRes, orgRes, perRes, statRes] = await Promise.all([
        fetch('/api/opportunities?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/organizations').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/personas').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/intelligence/stats').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (oppRes?.items) setOpportunities(oppRes.items);
      if (orgRes?.items) setOrganizations(orgRes.items);
      if (perRes?.items) setPersonas(perRes.items);
      if (statRes) setDbStats(statRes);
    } catch {
      // Offline / build fallback
    }
  };

  useEffect(() => {
    fetchOpportunityData();
  }, []);

  const refreshDbStats = async () => {
    try {
      const res = await fetch('/api/intelligence/stats');
      if (res.ok) {
        const stats = await res.json();
        setDbStats(stats);
      }
    } catch {
      // ignore
    }
  };

  const triggerSync = async (connectorId?: string) => {
    try {
      const res = await fetch('/api/ingestion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId }),
      });
      if (res.ok) {
        await fetchOpportunityData();
      }
    } catch {
      // ignore
    }
  };

  // Saved / Bookmarks (with LocalStorage)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ai_heaven_saved_entities');
      return stored ? JSON.parse(stored) : ['ent_llama_33_70b', 'ent_qdrant'];
    } catch {
      return ['ent_llama_33_70b', 'ent_qdrant'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai_heaven_saved_entities', JSON.stringify(savedIds));
    } catch {
      // ignore local storage restrictions
    }
  }, [savedIds]);

  const toggleSaveEntity = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const isSaved = (id: string) => savedIds.includes(id);

  // Projects (with LocalStorage)
  const [projects, setProjects] = useState<ProjectBundle[]>(() => {
    try {
      const stored = localStorage.getItem('ai_heaven_projects');
      return stored ? JSON.parse(stored) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ai_heaven_projects', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const createProject = (name: string, description: string) => {
    const newProj: ProjectBundle = {
      id: `proj_${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entityIds: [],
      tags: ['Custom'],
    };
    setProjects((prev) => [newProj, ...prev]);
  };

  const addEntityToProject = (projectId: string, entityId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId && !p.entityIds.includes(entityId)) {
          return { ...p, entityIds: [...p.entityIds, entityId], updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const removeEntityFromProject = (projectId: string, entityId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, entityIds: p.entityIds.filter((id) => id !== entityId), updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  // Verification Queue State
  const [verificationQueue, setVerificationQueue] = useState<VerificationQueueItem[]>(VERIFICATION_QUEUE_DATA);

  const approveVerification = (id: string) => {
    setVerificationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
  };

  const rejectVerification = (id: string) => {
    setVerificationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'REJECTED' } : item))
    );
  };

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 'notif_1', text: 'DeepSeek-V3 weights benchmark audited', time: '10m ago', read: false },
    { id: 'notif_2', text: 'vLLM v0.7.2 published with EAGLE-2 speculative kernels', time: '1h ago', read: false },
    { id: 'notif_3', text: 'Llama 3.3 70B community GGUF checkpoints verified', time: '2h ago', read: true },
  ]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Global Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        if (selectedEntity) {
          setSelectedEntity(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntity]);

  // Filtered Entities computation
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'ALL' || entity.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [entities, searchQuery, selectedCategory]);

  // Filtered Activity stream based on bottom timeline range
  const filteredActivity = useMemo(() => {
    const now = Date.now();
    let maxAgeMs = Infinity;

    switch (timelineRange) {
      case 'LIVE':
        maxAgeMs = 1000 * 60 * 60 * 2; // Last 2 hours
        break;
      case '1H':
        maxAgeMs = 1000 * 60 * 60 * 1;
        break;
      case '6H':
        maxAgeMs = 1000 * 60 * 60 * 6;
        break;
      case '24H':
        maxAgeMs = 1000 * 60 * 60 * 24;
        break;
      case '7D':
        maxAgeMs = 1000 * 60 * 60 * 24 * 7;
        break;
      case '30D':
        maxAgeMs = 1000 * 60 * 60 * 24 * 30;
        break;
    }

    return allActivity.filter((act) => {
      const itemTime = new Date(act.timestamp).getTime();
      return now - itemTime <= maxAgeMs;
    });
  }, [allActivity, timelineRange]);

  return (
    <AIHeavenContext.Provider
      value={{
        activeNav,
        setActiveNav,
        selectedEntity,
        setSelectedEntity,
        selectedOpportunity,
        setSelectedOpportunity,
        activeDetailTab,
        setActiveDetailTab,
        searchQuery,
        setSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isRightFeedOpen,
        setIsRightFeedOpen,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        timelineRange,
        setTimelineRange,
        selectedCategory,
        setSelectedCategory,
        entities,
        filteredEntities,
        filteredActivity,
        allActivity,
        opportunities,
        organizations,
        personas,
        dbStats,
        refreshDbStats,
        triggerSync,
        savedIds,
        toggleSaveEntity,
        isSaved,
        projects,
        createProject,
        addEntityToProject,
        removeEntityFromProject,
        deleteProject,
        verificationQueue,
        approveVerification,
        rejectVerification,
        notifications,
        markNotificationAsRead,
      }}
    >
      {children}
    </AIHeavenContext.Provider>
  );
};

export const useAIHeaven = () => {
  const context = useContext(AIHeavenContext);
  if (!context) {
    throw new Error('useAIHeaven must be used within an AIHeavenProvider');
  }
  return context;
};
