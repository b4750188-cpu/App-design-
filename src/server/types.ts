/**
 * Global Website Opportunity Finder - Domain & Database Types
 * Covers all 27 specified relational database tables & domain contracts
 */

export type ProviderSource = 'google_places' | 'youtube' | 'crawler' | 'user_manual' | 'open_registry';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export type OpportunityType =
  | 'NO_WEBSITE_DETECTED'
  | 'WEBSITE_ACCESSIBLE_BUT_ISSUES_FOUND'
  | 'MOBILE_IMPROVEMENT'
  | 'PERFORMANCE_IMPROVEMENT'
  | 'CONTACT_IMPROVEMENT'
  | 'BOOKING_IMPROVEMENT'
  | 'CONTENT_IMPROVEMENT'
  | 'BUSINESS_FUNCTIONALITY_GAP'
  | 'SOCIAL_TO_WEBSITE_OPPORTUNITY'
  | 'OUTDATED_CONTENT_SIGNAL'
  | 'NO_MAJOR_ISSUES_DETECTED'
  | 'UNKNOWN';

export type LeadStatus =
  | 'NEW'
  | 'RESEARCHING'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST'
  | 'NOT_A_FIT';

export type ContactMethod =
  | 'phone'
  | 'whatsapp'
  | 'email'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'youtube'
  | 'in_person'
  | 'website_form'
  | 'other';

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';

export type ErrorClassification =
  | 'TEMPORARY'
  | 'PERMANENT'
  | 'RATE_LIMITED'
  | 'AUTHENTICATION_ERROR'
  | 'INVALID_DATA'
  | 'PROVIDER_UNAVAILABLE'
  | 'CRAWLER_BLOCKED';

// 1. users
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'analyst';
  createdAt: string;
  updatedAt: string;
}

// 2. businesses
export interface Business {
  id: string; // internal UUID
  name: string;
  normalizedName: string;
  primaryCategory: string;
  status: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY' | 'UNKNOWN';
  websiteStatus: 'NO_WEBSITE_DETECTED' | 'WEBSITE_DETECTED' | 'UNVERIFIED' | 'NOT_CHECKED';
  rating?: number;
  reviewCount?: number;
  priceLevel?: string;
  firstDiscovered: string; // ISO UTC
  lastChecked: string;
  lastModified: string;
  confidence: ConfidenceLevel;
  primaryProvider: ProviderSource;
  primaryProviderId: string;
  rawData?: Record<string, unknown>;
}

// 3. business_identifiers
export interface BusinessIdentifier {
  id: string;
  businessId: string;
  provider: ProviderSource;
  identifierType: 'place_id' | 'channel_id' | 'registry_id' | 'domain_hash' | 'phone_e164';
  identifierValue: string;
  confidence: ConfidenceLevel;
  firstSeen: string;
  lastSeen: string;
}

// 4. business_categories
export interface BusinessCategory {
  id: string;
  businessId: string;
  industryGroup: string; // e.g. "Food & Drink", "Healthcare", "Legal"
  categoryCode: string;
  categoryLabel: string;
  isPrimary: boolean;
  confidence: ConfidenceLevel;
}

// 5. business_locations
export interface BusinessLocation {
  id: string;
  businessId: string;
  country: string; // Full name e.g. "Japan", "Germany"
  isoCountryCode: string; // ISO 3166-1 alpha-2 e.g. "JP", "DE"
  region: string; // State / Province / Prefecture
  city: string;
  district?: string;
  neighborhood?: string;
  postalCode?: string;
  streetAddress?: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  localLanguage?: string;
  isRtl: boolean;
}

// 6. business_contacts
export interface BusinessContact {
  id: string;
  businessId: string;
  contactType: 'phone' | 'international_phone' | 'email' | 'whatsapp' | 'website_contact' | 'maps_uri';
  value: string;
  normalizedValue: string;
  source: ProviderSource;
  confidence: ConfidenceLevel;
  isVerified: boolean;
  hasConflict: boolean;
  conflictingSources?: { source: string; value: string; date: string }[];
  discoveredAt: string;
}

// 7. business_sources
export interface BusinessSource {
  id: string;
  businessId: string;
  sourceName: ProviderSource;
  externalId: string;
  retrievedAt: string;
  httpStatus?: number;
  endpointCalled?: string;
  fieldsRetrieved?: string[];
  rawPayloadSnippet?: string;
}

// 8. websites
export interface Website {
  id: string;
  businessId: string;
  originalUrl: string;
  normalizedUrl: string;
  domain: string;
  protocol: 'http' | 'https' | 'unknown';
  isHttps: boolean;
  httpStatusCode?: number;
  isLive: boolean;
  source: ProviderSource;
  detectionDate: string;
  lastChecked: string;
  dnsResolved: boolean;
  ipAddress?: string;
  redirectsCount?: number;
  finalUrl?: string;
}

// 9. website_audits
export interface WebsiteAudit {
  id: string;
  websiteId: string;
  businessId: string;
  auditDate: string;
  status: 'COMPLETED' | 'INCOMPLETE' | 'FAILED' | 'BLOCKED';
  incompleteReason?: string;
  // Technical
  httpStatus?: number;
  httpsEnforced?: boolean;
  hasCanonical?: boolean;
  hasRobotsTxt?: boolean;
  hasSitemap?: boolean;
  dnsLookupMs?: number;
  // Mobile
  hasViewportMeta?: boolean;
  viewportContent?: string;
  hasResponsiveElements?: boolean;
  mobileSignalsDetected?: string[];
  // SEO
  pageTitle?: string;
  pageTitleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  h1Count?: number;
  h1Text?: string;
  h2Count?: number;
  hasStructuredData?: boolean;
  structuredDataTypes?: string[];
  // Content
  hasBusinessDescription?: boolean;
  hasServicesListed?: boolean;
  hasProductsListed?: boolean;
  hasPricing?: boolean;
  hasPhysicalAddress?: boolean;
  hasPhoneDisplayed?: boolean;
  hasEmailDisplayed?: boolean;
  hasHoursDisplayed?: boolean;
  // Conversion
  hasContactForm?: boolean;
  hasClickToCall?: boolean;
  hasMailto?: boolean;
  hasBookingSystem?: boolean;
  hasReservations?: boolean;
  hasQuoteRequest?: boolean;
  hasOnlineOrdering?: boolean;
  // Performance
  ttfbMs?: number;
  totalPageSizeBytes?: number;
  resourceCount?: number;
  // Evidence signals
  copyrightYear?: number;
  outdatedSignals?: string[];
  evidenceLog: { test: string; result: string; timestamp: string; source: string }[];
}

// 10. website_pages
export interface WebsitePage {
  id: string;
  websiteId: string;
  url: string;
  pageType: 'home' | 'about' | 'services' | 'contact' | 'booking' | 'menu' | 'pricing' | 'other';
  httpStatus: number;
  title?: string;
  crawledAt: string;
}

// 11. website_links
export interface WebsiteLink {
  id: string;
  websiteId: string;
  fromPageUrl: string;
  toUrl: string;
  isInternal: boolean;
  isBroken: boolean;
  httpStatus?: number;
}

// 12. social_profiles
export interface SocialProfile {
  id: string;
  businessId: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'tiktok' | 'linkedin';
  profileUrl: string;
  handle?: string;
  displayName?: string;
  channelId?: string;
  matchingConfidence: ConfidenceLevel;
  matchingEvidence: string;
  source: ProviderSource;
  firstDiscovered: string;
  lastChecked: string;
}

// 13. social_observations
export interface SocialObservation {
  id: string;
  socialProfileId: string;
  observedAt: string;
  followersCount?: number;
  subscribersCount?: number;
  videoCount?: number;
  viewCount?: number;
  publicBio?: string;
  externalWebsiteInBio?: string;
  lastActiveDate?: string;
}

// 14. business_relationships
export interface BusinessRelationship {
  id: string;
  businessId: string;
  relatedBusinessId: string;
  relationshipType: 'parent' | 'branch' | 'potential_duplicate' | 'same_chain';
  confidence: ConfidenceLevel;
  notes?: string;
}

// 15. opportunities
export interface Opportunity {
  id: string;
  businessId: string;
  type: OpportunityType;
  title: string;
  reasoning: string;
  confidence: ConfidenceLevel;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  firstIdentified: string;
  lastVerified: string;
  isResolved: boolean;
  recommendedWebsiteType?: string;
  recommendedFeatures: string[];
}

// 16. opportunity_evidence
export interface OpportunityEvidence {
  id: string;
  opportunityId: string;
  businessId: string;
  testName: string;
  evidenceText: string;
  source: string;
  observedAt: string;
  confidence: ConfidenceLevel;
}

// 17. leads
export interface Lead {
  id: string;
  businessId: string;
  status: LeadStatus;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  assignedTo?: string;
  tags: string[];
  savedAt: string;
  updatedAt: string;
  nextFollowUpDate?: string; // YYYY-MM-DD
  totalInteractions: number;
}

// 18. lead_notes
export interface LeadNote {
  id: string;
  leadId: string;
  author: string;
  content: string;
  createdAt: string;
}

// 19. lead_contacts (Interactions)
export interface LeadContact {
  id: string;
  leadId: string;
  businessId: string;
  date: string;
  time: string;
  method: ContactMethod;
  notes: string;
  outcome: 'NO_ANSWER' | 'GATEKEEPER' | 'INTERESTED' | 'NOT_INTERESTED' | 'REQUESTED_PROPOSAL' | 'SCHEDULED_CALL' | 'COMPLETED';
  nextFollowUp?: string;
  loggedAt: string;
}

// 20. follow_ups
export interface FollowUp {
  id: string;
  leadId: string;
  businessId: string;
  dueDate: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

// 21. business_snapshots
export interface BusinessSnapshot {
  id: string;
  businessId: string;
  snapshotDate: string;
  snapshotData: {
    name: string;
    website?: string;
    phone?: string;
    address?: string;
    categories: string[];
    opportunityTypes: OpportunityType[];
    socialCount: number;
    auditStatus?: string;
  };
}

// 22. change_events
export interface ChangeEvent {
  id: string;
  businessId: string;
  eventType:
    | 'WEBSITE_ADDED'
    | 'WEBSITE_REMOVED'
    | 'WEBSITE_CHANGED'
    | 'PHONE_CHANGED'
    | 'ADDRESS_CHANGED'
    | 'SOCIAL_ACCOUNT_ADDED'
    | 'SOCIAL_ACCOUNT_REMOVED'
    | 'WEBSITE_ISSUE_FIXED'
    | 'WEBSITE_ISSUE_APPEARED'
    | 'OPPORTUNITY_UPDATED';
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  detectedAt: string;
  source: string;
}

// 23. scan_jobs
export interface ScanJob {
  id: string;
  searchQuery: {
    country: string;
    region?: string;
    city: string;
    category: string;
    keyword?: string;
    radiusKm?: number;
    quantityRequested: number;
    filters?: OpportunityFilterOptions;
  };
  status: JobStatus;
  totalItems: number;
  processedItems: number;
  successItems: number;
  errorItems: number;
  startedAt: string;
  finishedAt?: string;
}

// 24. scan_items
export interface ScanItem {
  id: string;
  jobId: string;
  businessId?: string;
  placeId?: string;
  businessName: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  step: 'DISCOVERY' | 'WEBSITE_AUDIT' | 'SOCIAL_SEARCH' | 'OPPORTUNITY_EVAL';
  processedAt?: string;
}

// 25. scan_errors
export interface ScanError {
  id: string;
  jobId?: string;
  businessId?: string;
  provider: ProviderSource;
  errorClassification: ErrorClassification;
  statusCode?: number;
  errorMessage: string;
  occurredAt: string;
  canRetry: boolean;
  retryCount: number;
}

// 26. provider_configs
export interface ProviderConfig {
  providerName: ProviderSource;
  isEnabled: boolean;
  hasApiKey: boolean;
  apiKeyMasked?: string;
  rateLimitPerMinute: number;
  lastUsed?: string;
  status: 'ONLINE' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  statusMessage?: string;
}

// 27. provider_usage
export interface ProviderUsage {
  id: string;
  provider: ProviderSource;
  endpoint: string;
  requestsCount: number;
  lastRequestAt: string;
  fieldMaskUsed?: string;
  estimatedCostUnit?: string;
}

// 28. audit_logs
export interface AuditLog {
  id: string;
  action: string;
  entityType: 'business' | 'lead' | 'website_audit' | 'scan_job' | 'provider';
  entityId: string;
  details: string;
  timestamp: string;
}

// Filter options supported in Global Business Search
export interface OpportunityFilterOptions {
  noWebsiteOnly?: boolean;
  websiteExistsOnly?: boolean;
  websiteIssuesOnly?: boolean;
  mobileIssuesOnly?: boolean;
  performanceIssuesOnly?: boolean;
  missingBookingOnly?: boolean;
  missingContactOnly?: boolean;
  activeSocialOnly?: boolean;
  hasPhoneOnly?: boolean;
  hasEmailOnly?: boolean;
  hasWhatsappOnly?: boolean;
  hasInstagramOnly?: boolean;
  hasYoutubeOnly?: boolean;
  hasFacebookOnly?: boolean;
  hasXOnly?: boolean;
  hasTiktokOnly?: boolean;
  hasLinkedinOnly?: boolean;
}
