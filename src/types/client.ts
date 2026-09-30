import {
  Business,
  BusinessLocation,
  BusinessContact,
  Website,
  WebsiteAudit,
  SocialProfile,
  Opportunity,
  OpportunityEvidence,
  Lead,
  LeadStatus,
  LeadNote,
  LeadContact,
  FollowUp,
  BusinessSnapshot,
  ChangeEvent,
  ProviderConfig,
  ProviderUsage,
  OpportunityFilterOptions,
} from '../server/types.ts';

export interface EnrichedBusiness extends Business {
  formattedAddress?: string;
  country?: string;
  isoCountryCode?: string;
  opportunityCount: number;
  topOpportunity?: string;
  topOpportunityType?: string;
  isLead: boolean;
  leadStatus?: LeadStatus;
  websiteUrl?: string;
  auditStatus: string;
}

export interface FullProfileResponse {
  business: Business;
  location?: BusinessLocation;
  categories: Array<{ id: string; categoryLabel: string; isPrimary: boolean }>;
  contacts: BusinessContact[];
  sources: Array<{ sourceName: string; externalId: string; retrievedAt: string }>;
  website?: Website;
  audits: WebsiteAudit[];
  latestAudit?: WebsiteAudit;
  socials: SocialProfile[];
  opportunities: Opportunity[];
  evidence: OpportunityEvidence[];
  lead?: Lead;
  snapshots: BusinessSnapshot[];
  changeEvents: ChangeEvent[];
}

export interface EnrichedLead extends Lead {
  businessName: string;
  businessCategory: string;
  formattedAddress: string;
  country: string;
  websiteUrl?: string;
  websiteStatus?: string;
  opportunities: Opportunity[];
  auditStatus: string;
}

export interface EnrichedFollowUp extends FollowUp {
  businessName: string;
  leadStatus?: LeadStatus;
}

export interface StatsResponse {
  totalBusinesses: number;
  noWebsiteCount: number;
  websiteDetectedCount: number;
  noWebsiteRate: number;
  totalAudited: number;
  mobileIssuesCount: number;
  insecureHttpCount: number;
  missingContactCount: number;
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  oppCountsByType: Record<string, number>;
  countriesRepresented: string[];
}
