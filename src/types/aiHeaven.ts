/**
 * AI Heaven - Global AI Ecosystem Command Center
 * Domain Data Model & Type Definitions
 */

export type EntityCategory =
  | 'company'
  | 'model'
  | 'tool'
  | 'api'
  | 'github'
  | 'dataset'
  | 'research'
  | 'infrastructure'
  | 'organization'
  | 'university';

export type ModalityType =
  | 'text'
  | 'multimodal'
  | 'vision'
  | 'audio'
  | 'code'
  | 'embedding'
  | 'diffusion'
  | 'reasoning';

export type VerificationStatus =
  | 'VERIFIED_OFFICIAL'
  | 'COMMUNITY_VERIFIED'
  | 'BENCHMARK_VALIDATED'
  | 'LOCAL_DEMO_DATA'
  | 'PENDING_REVIEW';

export type RelationType =
  | 'DEPENDS_ON'
  | 'BUILT_WITH'
  | 'ALTERNATIVE_TO'
  | 'USES'
  | 'TRAINED_ON'
  | 'DOCUMENTED_BY'
  | 'COMPATIBLE_WITH'
  | 'CREATED_BY'
  | 'HOSTED_ON';

export type TimelineRange = 'LIVE' | '1H' | '6H' | '24H' | '7D' | '30D';

export interface LocationGeo {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  hubName: string; // e.g., "Silicon Valley", "Paris AI Hub", "London Deep Tech"
}

export interface TechnicalCompatibility {
  frameworks: string[]; // e.g. ["PyTorch", "vLLM", "Hugging Face", "Ollama"]
  hardware: string[]; // e.g. ["NVIDIA H100", "Apple Metal", "CPU AVX2"]
  sdks: string[]; // e.g. ["Python", "TypeScript", "Go", "Rust"]
}

export interface AIEntity {
  id: string;
  slug: string;
  name: string;
  category: EntityCategory;
  tagline: string;
  description: string;
  organization: string;
  orgId?: string;
  location: LocationGeo;
  websiteUrl: string;
  githubUrl?: string;
  docsUrl?: string;
  paperUrl?: string;
  
  // Technical Specifications
  version: string;
  releaseDate: string;
  lastUpdated: string;
  license: string;
  isOpensource: boolean;
  trustScore: number; // 0 - 100
  verificationStatus: VerificationStatus;
  verificationEvidence?: string;
  tags: string[];

  // Optional Category-specific properties
  modelMetadata?: {
    parameters?: string; // e.g. "70B", "405B"
    contextWindow?: string; // e.g. "128k tokens"
    modalities: ModalityType[];
    benchmarks?: Record<string, string | number>; // e.g. { "MMLU": "88.7%", "HumanEval": "90.2%" }
    hostingProviders?: string[];
  };

  toolMetadata?: {
    inputs: string[];
    outputs: string[];
    authType: 'API_KEY' | 'OAUTH' | 'LOCAL' | 'NONE';
    rateLimit?: string;
    pricing: 'FREE' | 'OPEN_SOURCE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE';
  };

  githubMetadata?: {
    repoOwner: string;
    repoName: string;
    primaryLanguage: string;
    stars: number;
    forks: number;
    openIssues: number;
    topics: string[];
  };

  datasetMetadata?: {
    domain: string;
    sizeFormatted: string; // e.g. "15 TB", "2.8B tokens"
    recordCount?: string;
    formats: string[]; // e.g. ["Parquet", "JSONL"]
    curator: string;
  };

  researchMetadata?: {
    authors: string[];
    affiliation: string;
    venue?: string; // e.g. "NeurIPS", "ICLR", "arXiv"
    citations?: number;
    doi?: string;
  };

  // Connected Relationships
  relationships: {
    targetId: string;
    targetName: string;
    targetCategory: EntityCategory;
    relation: RelationType;
    note?: string;
  }[];
}

export interface ActivityItem {
  id: string;
  entityId: string;
  entityName: string;
  entityCategory: EntityCategory;
  timestamp: string;
  relativeTime: string;
  type: 'MODEL_RELEASE' | 'GITHUB_SPIKE' | 'PAPER_PUBLISHED' | 'DATASET_UPDATE' | 'VERIFICATION_EVENT' | 'TOOL_UPDATE';
  title: string;
  description: string;
  metricsChange?: string; // e.g. "+1,240 stars", "Version 2.4 released"
  link?: string;
  severity?: 'normal' | 'highlight' | 'critical';
}

export interface ProjectBundle {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  entityIds: string[];
  tags: string[];
}

export interface AgentApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
    example: string;
  }[];
  exampleResponse: object;
}

export interface VerificationQueueItem {
  id: string;
  entityId: string;
  entityName: string;
  category: EntityCategory;
  requestedBy: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  claimedSpecs: string;
  evidenceLinks: string[];
  auditNotes?: string;
}

export type ActiveNavView =
  | 'monitor'
  | 'discover'
  | 'resources'
  | 'models'
  | 'tools'
  | 'datasets'
  | 'github'
  | 'research'
  | 'graph'
  | 'projects'
  | 'saved'
  | 'agents'
  | 'admin'
  | 'opportunities'
  | 'organizations'
  | 'personas'
  | 'ingestion';
