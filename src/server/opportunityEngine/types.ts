/**
 * Global Opportunity Intelligence Platform - Domain Types & Data Contracts
 * Enforces strict typing for Opportunities, Organizations, Personas, Ingestion,
 * Knowledge Graph, User Matching, and Real-Time Event Systems.
 */

export type OpportunityType =
  | 'GRANT'
  | 'FELLOWSHIP'
  | 'ACCELERATOR'
  | 'INCUBATOR'
  | 'SCHOLARSHIP'
  | 'RESEARCH_PROGRAM'
  | 'HACKATHON'
  | 'COMPETITION'
  | 'INTERNSHIP'
  | 'JOB'
  | 'STARTUP_PROGRAM'
  | 'VENTURE_FUNDING'
  | 'CONFERENCE_EVENT'
  | 'GOVERNMENT_PROGRAM'
  | 'NONPROFIT_PROGRAM'
  | 'BUSINESS_IMPROVEMENT';

export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';

// Opportunity Lifecycle: DISCOVERED → VERIFIED → OPEN → DEADLINE APPROACHING → CLOSED / EXPIRED → ARCHIVED
export type OpportunityLifecycleStatus =
  | 'DISCOVERED'
  | 'VERIFIED'
  | 'OPEN'
  | 'DEADLINE_APPROACHING'
  | 'CLOSED'
  | 'EXPIRED'
  | 'ARCHIVED';

// Legacy status compatibility alias
export type OpportunityStatus = OpportunityLifecycleStatus | 'ACTIVE' | 'EXPIRED' | 'UPCOMING' | 'UNDER_REVIEW';

export type VerificationState = 'VERIFIED_OFFICIAL' | 'COMMUNITY_VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';

export type BusinessType =
  | 'Startup'
  | 'SME'
  | 'Enterprise'
  | 'Nonprofit'
  | 'NGO'
  | 'University'
  | 'Research Organization'
  | 'Government Organization'
  | 'Accelerator'
  | 'Incubator'
  | 'Venture Capital'
  | 'Investment Firm'
  | 'Technology Company'
  | 'Service Business'
  | 'Manufacturer'
  | 'Media Organization'
  | 'Community'
  | 'Other';

export type PersonaType =
  | 'Founder'
  | 'CEO'
  | 'Executive'
  | 'Investor'
  | 'Recruiter'
  | 'Hiring Manager'
  | 'Student'
  | 'Researcher'
  | 'Developer'
  | 'Entrepreneur'
  | 'Mentor'
  | 'Professor'
  | 'Program Manager'
  | 'NGO Representative'
  | 'Government Representative'
  | 'Other';

// 1. Structured Opportunity Intelligence Record
export interface StructuredOpportunity {
  id: string;
  title: string;
  slug: string;
  organizationId: string;
  organizationName: string;
  opportunityType: OpportunityType;
  category: string;
  industry: string;
  sector: string;
  description: string;

  // Geographic Location
  location: {
    city: string;
    country: string;
    countryCode: string;
    region: string;
    lat: number;
    lng: number;
    hubName?: string;
  };
  workMode: WorkMode;

  // Terms & Criteria
  eligibility: string;
  educationRequirements: string[];
  ageRequirements?: string;
  skills: string[];
  requirements: string[];
  deadline?: string; // ISO UTC or undefined for rolling
  startDate?: string;
  duration?: string;
  fundingAmount?: string; // e.g. "$100,000", "€50,000"
  prize?: string;
  salary?: string;
  benefits?: string[];

  // URLs & Provenance Tracking
  applicationUrl: string;
  officialWebsite: string;
  sourceUrl: string;
  sourceName: string;
  publicationDate: string;
  discoveryDate: string;
  updateDate: string;
  verificationDate: string;
  lastVerifiedDate?: string;
  status: OpportunityStatus;
  trustScore: number; // 0 - 100
  verificationState: VerificationState;

  tags: string[];
  relatedOrganizationIds: string[];
  relatedPersonaIds: string[];
}

// 2. Structured Organization / Business Profile
export interface StructuredOrganization {
  id: string;
  name: string;
  normalizedName: string;
  slug: string;
  businessTypes: BusinessType[];
  industry: string;
  sector: string;
  companySize?: string;
  headquarters: {
    city: string;
    country: string;
    countryCode: string;
    lat: number;
    lng: number;
    formattedAddress?: string;
  };
  countriesServed: string[];
  citiesServed: string[];
  website: string;
  officialSource: string;
  foundedYear?: number;
  description: string;
  productsServices: string[];
  organizationStatus: 'ACTIVE' | 'ACQUIRED' | 'INACTIVE';
  opportunitiesOfferedCount: number;
  programs: string[];
  events: string[];
  relatedOrganizationIds: string[];
  provenance: {
    connectorId: string;
    discoveredAt: string;
    lastCheckedAt: string;
  };
  lastVerifiedDate: string;
  trustScore: number;
}

// 3. Structured Persona & Public Contact Profile
export interface StructuredPersona {
  id: string;
  name: string;
  normalizedName: string;
  roleTitle: string;
  organizationId: string;
  organizationName: string;
  personaType: PersonaType;
  publicProfileUrl?: string; // LinkedIn, GitHub, official staff page
  officialStaffPageUrl?: string;

  // Public Contact Information Only (Strictly distinguish from private)
  publicContact: {
    publicEmail?: string;
    publicPhone?: string;
    officialContactPageUrl?: string;
    officialWebsite?: string;
    publicOfficeLocation?: string;
  };

  privacyClassification: 'PUBLIC_OFFICIAL_CONTACT';
  relevantOpportunityIds: string[];
  provenance: {
    sourceUrl: string;
    sourceName: string;
    discoveredAt: string;
  };
  lastVerifiedDate: string;
}

// 4. Data Gathering & Connector Types
export type ConnectorType = 'API' | 'RSS_ATOM' | 'OPEN_DATA' | 'DIRECTORY';

export interface ConnectorConfig {
  id: string;
  name: string;
  type: ConnectorType;
  baseUrl: string;
  endpoint?: string;
  pollIntervalMinutes: number;
  enabled: boolean;
  rateLimitPerMinute: number;
  lastRunAt?: string;
  nextRunAt?: string;
  lastStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'IDLE' | 'RUNNING';
  lastItemCount: number;
  lastErrorMessage?: string;
}

export interface IngestionLog {
  id: string;
  connectorId: string;
  connectorName: string;
  startedAt: string;
  finishedAt: string;
  itemsFetched: number;
  itemsNormalized: number;
  itemsDeduplicated: number;
  itemsInserted: number;
  itemsUpdated: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  errorDetails?: string;
}

// 5. Database Intelligence Stats
export interface DatabaseIntelligenceStats {
  totalOpportunities: number;
  activeOpportunities: number;
  expiredOpportunities: number;
  totalOrganizations: number;
  totalPersonas: number;
  countriesRepresented: number;
  industriesCovered: number;
  sourcesTracked: number;
  verifiedRecordsCount: number;
  needingVerificationCount: number;
  discoveredLast7Days: number;
  updatedLast7Days: number;
  ingestionStatus: 'IDLE' | 'ACTIVE' | 'SYNCING';
  duplicateCountPrevented: number;
  failedIngestionJobs: number;
}

// 6. User Profile & Opportunity Matching Engine
export interface UserMatchProfile {
  educationLevel?: string; // e.g. "Computer Science Undergraduate", "PhD Candidate", "High School"
  skills: string[]; // e.g. ["Python", "Machine Learning", "PyTorch", "Rust"]
  interests: string[]; // e.g. ["Artificial Intelligence", "Robotics", "Startups"]
  location?: string; // e.g. "Lahore, Pakistan", "Berlin, Germany", "San Francisco, USA"
  preferredCountries: string[]; // e.g. ["United States", "Germany", "United Kingdom", "Remote"]
  opportunityTypes: OpportunityType[];
  careerInterests?: string[];
}

export interface OpportunityMatchResult {
  opportunity: StructuredOpportunity;
  matchScore: number; // 0 to 100
  qualifies: boolean;
  whyThisMatches: {
    matchingRequirements: string[];
    missingRequirements: string[];
    locationCompatibility: { compatible: boolean; details: string };
    eligibilityCompatibility: { compatible: boolean; details: string };
    skillCompatibility: { compatible: boolean; matchedSkills: string[]; missingSkills: string[] };
    deadlineStatus: { isOpen: boolean; daysRemaining?: number; label: string };
  };
}

// 7. Global Search Query & Multimodal Results
export interface GlobalSearchQuery {
  query?: string;
  opportunityType?: string;
  businessType?: string;
  country?: string;
  city?: string;
  region?: string;
  industry?: string;
  organizationId?: string;
  personaType?: string;
  verificationStatus?: string;
  deadlineBefore?: string;
  limit?: number;
  offset?: number;
}

export interface GlobalSearchResult {
  query: string;
  parsedTokens?: {
    location?: string;
    opportunityTypes?: OpportunityType[];
    topics?: string[];
    fundingRequirement?: boolean;
  };
  opportunities: StructuredOpportunity[];
  organizations: StructuredOrganization[];
  personas: StructuredPersona[];
  totalMatches: number;
}

// 8. Real-Time System Intelligence Event
export type SystemEventType =
  | 'NEW_OPPORTUNITY_DISCOVERED'
  | 'ORGANIZATION_UPDATED'
  | 'DEADLINE_CHANGED'
  | 'NEW_SOURCE_SYNCED'
  | 'OPPORTUNITY_VERIFIED'
  | 'OPPORTUNITY_EXPIRED'
  | 'NEW_ORGANIZATION_DISCOVERED';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  title: string;
  description: string;
  entityId: string;
  entityType: 'opportunity' | 'organization' | 'persona' | 'connector';
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
  severity: 'normal' | 'highlight' | 'critical';
  linkUrl: string;
}

// 9. Knowledge Graph Schema
export type GraphNodeType =
  | 'opportunity'
  | 'organization'
  | 'persona'
  | 'industry'
  | 'location'
  | 'category'
  | 'source'
  | 'program'
  | 'event'
  | 'research';

export type GraphEdgeRelation =
  | 'SIMILAR_OPPORTUNITY'
  | 'ALTERNATIVE'
  | 'SAME_ORGANIZATION'
  | 'SAME_INDUSTRY'
  | 'SAME_LOCATION'
  | 'PREREQUISITE'
  | 'PARTNER'
  | 'SPONSOR'
  | 'ACCELERATOR'
  | 'INVESTOR'
  | 'RELATED_RESEARCH'
  | 'RELATED_EVENT'
  | 'RELATED_PROGRAM'
  | 'OFFERS'
  | 'LEAD_BY';

export interface KnowledgeGraphData {
  nodes: {
    id: string;
    label: string;
    type: GraphNodeType;
    category?: string;
    attributes: Record<string, any>;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    relation: GraphEdgeRelation;
    weight: number;
  }[];
}
