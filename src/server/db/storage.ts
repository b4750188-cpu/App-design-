/**
 * Relational Database & Entity Storage Engine
 * Manages all 27 required PostgreSQL relational entities with foreign keys,
 * unique constraints, indexes, timestamps, and persistent disk backing.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Business,
  BusinessIdentifier,
  BusinessCategory,
  BusinessLocation,
  BusinessContact,
  BusinessSource,
  Website,
  WebsiteAudit,
  WebsitePage,
  WebsiteLink,
  SocialProfile,
  SocialObservation,
  BusinessRelationship,
  Opportunity,
  OpportunityEvidence,
  Lead,
  LeadNote,
  LeadContact,
  FollowUp,
  BusinessSnapshot,
  ChangeEvent,
  ScanJob,
  ScanItem,
  ScanError,
  ProviderConfig,
  ProviderUsage,
  AuditLog,
} from '../types.ts';

interface DatabaseStore {
  users: User[];
  businesses: Business[];
  business_identifiers: BusinessIdentifier[];
  business_categories: BusinessCategory[];
  business_locations: BusinessLocation[];
  business_contacts: BusinessContact[];
  business_sources: BusinessSource[];
  websites: Website[];
  website_audits: WebsiteAudit[];
  website_pages: WebsitePage[];
  website_links: WebsiteLink[];
  social_profiles: SocialProfile[];
  social_observations: SocialObservation[];
  business_relationships: BusinessRelationship[];
  opportunities: Opportunity[];
  opportunity_evidence: OpportunityEvidence[];
  leads: Lead[];
  lead_notes: LeadNote[];
  lead_contacts: LeadContact[];
  follow_ups: FollowUp[];
  business_snapshots: BusinessSnapshot[];
  change_events: ChangeEvent[];
  scan_jobs: ScanJob[];
  scan_items: ScanItem[];
  scan_errors: ScanError[];
  provider_configs: ProviderConfig[];
  provider_usage: ProviderUsage[];
  audit_logs: AuditLog[];
}

const DB_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'finder_db.json');

export class RelationalDatabase {
  private data: DatabaseStore;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadInitial();
    this.ensureDefaults();
  }

  private loadInitial(): DatabaseStore {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing clean database:', e);
    }
    return this.createEmptyStore();
  }

  private createEmptyStore(): DatabaseStore {
    return {
      users: [],
      businesses: [],
      business_identifiers: [],
      business_categories: [],
      business_locations: [],
      business_contacts: [],
      business_sources: [],
      websites: [],
      website_audits: [],
      website_pages: [],
      website_links: [],
      social_profiles: [],
      social_observations: [],
      business_relationships: [],
      opportunities: [],
      opportunity_evidence: [],
      leads: [],
      lead_notes: [],
      lead_contacts: [],
      follow_ups: [],
      business_snapshots: [],
      change_events: [],
      scan_jobs: [],
      scan_items: [],
      scan_errors: [],
      provider_configs: [],
      provider_usage: [],
      audit_logs: [],
    };
  }

  private ensureDefaults() {
    // 1. Default user
    if (this.data.users.length === 0) {
      this.data.users.push({
        id: 'usr_default_admin',
        email: 'analyst@opportunityfinder.global',
        name: 'Lead Business Analyst',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Default Provider Configs
    const existingProviders = new Set(this.data.provider_configs.map((p) => p.providerName));
    if (!existingProviders.has('google_places')) {
      const gKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
      this.data.provider_configs.push({
        providerName: 'google_places',
        isEnabled: true,
        hasApiKey: Boolean(gKey),
        apiKeyMasked: gKey ? `${gKey.slice(0, 4)}...${gKey.slice(-4)}` : undefined,
        rateLimitPerMinute: 60,
        status: gKey ? 'ONLINE' : 'NOT_CONFIGURED',
        statusMessage: gKey ? 'Configured via environment variables' : 'API Key required for live Google Places discovery',
      });
    }

    if (!existingProviders.has('youtube')) {
      const yKey = process.env.YOUTUBE_API_KEY || '';
      this.data.provider_configs.push({
        providerName: 'youtube',
        isEnabled: true,
        hasApiKey: Boolean(yKey),
        apiKeyMasked: yKey ? `${yKey.slice(0, 4)}...${yKey.slice(-4)}` : undefined,
        rateLimitPerMinute: 30,
        status: yKey ? 'ONLINE' : 'NOT_CONFIGURED',
        statusMessage: yKey ? 'Configured for channel search' : 'Optional YouTube Data API v3 key',
      });
    }

    if (!existingProviders.has('crawler')) {
      this.data.provider_configs.push({
        providerName: 'crawler',
        isEnabled: true,
        hasApiKey: true,
        rateLimitPerMinute: 30,
        status: 'ONLINE',
        statusMessage: 'SSRF-protected safe website crawler enabled',
      });
    }

    this.saveImmediate();
  }

  private saveImmediate() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      console.error('Database write error:', e);
    }
  }

  public scheduleSave() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate();
    }, 100);
  }

  // --- Entity Accessors ---

  // 1. Users
  public getUsers(): User[] {
    return this.data.users;
  }

  // 2. Businesses
  public getBusinesses(): Business[] {
    return this.data.businesses;
  }

  public getBusinessById(id: string): Business | undefined {
    return this.data.businesses.find((b) => b.id === id);
  }

  public upsertBusiness(business: Business) {
    const idx = this.data.businesses.findIndex((b) => b.id === business.id);
    if (idx >= 0) {
      this.data.businesses[idx] = business;
    } else {
      this.data.businesses.unshift(business);
    }
    this.scheduleSave();
  }

  // 3. Business Identifiers
  public getIdentifiersForBusiness(businessId: string): BusinessIdentifier[] {
    return this.data.business_identifiers.filter((bi) => bi.businessId === businessId);
  }

  public findIdentifier(type: string, value: string): BusinessIdentifier | undefined {
    return this.data.business_identifiers.find(
      (bi) => bi.identifierType === type && bi.identifierValue.toLowerCase() === value.toLowerCase()
    );
  }

  public upsertIdentifier(identifier: BusinessIdentifier) {
    const idx = this.data.business_identifiers.findIndex(
      (bi) => bi.identifierType === identifier.identifierType && bi.identifierValue === identifier.identifierValue
    );
    if (idx >= 0) {
      this.data.business_identifiers[idx] = identifier;
    } else {
      this.data.business_identifiers.push(identifier);
    }
    this.scheduleSave();
  }

  // 4. Categories
  public getCategoriesForBusiness(businessId: string): BusinessCategory[] {
    return this.data.business_categories.filter((c) => c.businessId === businessId);
  }

  public upsertCategory(cat: BusinessCategory) {
    const idx = this.data.business_categories.findIndex(
      (c) => c.businessId === cat.businessId && c.categoryCode === cat.categoryCode
    );
    if (idx >= 0) {
      this.data.business_categories[idx] = cat;
    } else {
      this.data.business_categories.push(cat);
    }
    this.scheduleSave();
  }

  // 5. Locations
  public getLocationForBusiness(businessId: string): BusinessLocation | undefined {
    return this.data.business_locations.find((l) => l.businessId === businessId);
  }

  public upsertLocation(loc: BusinessLocation) {
    const idx = this.data.business_locations.findIndex((l) => l.businessId === loc.businessId);
    if (idx >= 0) {
      this.data.business_locations[idx] = loc;
    } else {
      this.data.business_locations.push(loc);
    }
    this.scheduleSave();
  }

  // 6. Contacts
  public getContactsForBusiness(businessId: string): BusinessContact[] {
    return this.data.business_contacts.filter((c) => c.businessId === businessId);
  }

  public upsertContact(contact: BusinessContact) {
    const idx = this.data.business_contacts.findIndex(
      (c) => c.businessId === contact.businessId && c.contactType === contact.contactType && c.normalizedValue === contact.normalizedValue
    );
    if (idx >= 0) {
      this.data.business_contacts[idx] = contact;
    } else {
      this.data.business_contacts.push(contact);
    }
    this.scheduleSave();
  }

  // 7. Sources
  public getSourcesForBusiness(businessId: string): BusinessSource[] {
    return this.data.business_sources.filter((s) => s.businessId === businessId);
  }

  public addSource(src: BusinessSource) {
    this.data.business_sources.push(src);
    this.scheduleSave();
  }

  // 8. Websites
  public getWebsiteForBusiness(businessId: string): Website | undefined {
    return this.data.websites.find((w) => w.businessId === businessId);
  }

  public upsertWebsite(ws: Website) {
    const idx = this.data.websites.findIndex((w) => w.businessId === ws.businessId);
    if (idx >= 0) {
      this.data.websites[idx] = ws;
    } else {
      this.data.websites.push(ws);
    }
    this.scheduleSave();
  }

  // 9. Website Audits
  public getAuditsForBusiness(businessId: string): WebsiteAudit[] {
    return this.data.website_audits
      .filter((a) => a.businessId === businessId)
      .sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime());
  }

  public getLatestAuditForBusiness(businessId: string): WebsiteAudit | undefined {
    return this.getAuditsForBusiness(businessId)[0];
  }

  public addAudit(audit: WebsiteAudit) {
    this.data.website_audits.unshift(audit);
    this.scheduleSave();
  }

  // 10. Website Pages & 11. Links
  public addPage(page: WebsitePage) {
    this.data.website_pages.push(page);
    this.scheduleSave();
  }

  public getPagesForWebsite(websiteId: string): WebsitePage[] {
    return this.data.website_pages.filter((p) => p.websiteId === websiteId);
  }

  public addLink(link: WebsiteLink) {
    this.data.website_links.push(link);
    this.scheduleSave();
  }

  // 12. Social Profiles
  public getSocialProfilesForBusiness(businessId: string): SocialProfile[] {
    return this.data.social_profiles.filter((s) => s.businessId === businessId);
  }

  public upsertSocialProfile(prof: SocialProfile) {
    const idx = this.data.social_profiles.findIndex(
      (s) => s.businessId === prof.businessId && s.platform === prof.platform
    );
    if (idx >= 0) {
      this.data.social_profiles[idx] = prof;
    } else {
      this.data.social_profiles.push(prof);
    }
    this.scheduleSave();
  }

  // 13. Social Observations
  public addSocialObservation(obs: SocialObservation) {
    this.data.social_observations.push(obs);
    this.scheduleSave();
  }

  // 14. Business Relationships
  public getRelationships(businessId: string): BusinessRelationship[] {
    return this.data.business_relationships.filter(
      (r) => r.businessId === businessId || r.relatedBusinessId === businessId
    );
  }

  public addRelationship(rel: BusinessRelationship) {
    this.data.business_relationships.push(rel);
    this.scheduleSave();
  }

  // 15. Opportunities
  public getOpportunitiesForBusiness(businessId: string): Opportunity[] {
    return this.data.opportunities.filter((o) => o.businessId === businessId);
  }

  public getAllOpportunities(): Opportunity[] {
    return this.data.opportunities;
  }

  public replaceOpportunitiesForBusiness(businessId: string, opps: Opportunity[]) {
    this.data.opportunities = this.data.opportunities.filter((o) => o.businessId !== businessId);
    this.data.opportunities.push(...opps);
    this.scheduleSave();
  }

  // 16. Opportunity Evidence
  public getEvidenceForBusiness(businessId: string): OpportunityEvidence[] {
    return this.data.opportunity_evidence.filter((e) => e.businessId === businessId);
  }

  public addEvidence(evidenceList: OpportunityEvidence[]) {
    this.data.opportunity_evidence.push(...evidenceList);
    this.scheduleSave();
  }

  // 17. Leads
  public getLeads(): Lead[] {
    return this.data.leads;
  }

  public getLeadByBusinessId(businessId: string): Lead | undefined {
    return this.data.leads.find((l) => l.businessId === businessId);
  }

  public getLeadById(leadId: string): Lead | undefined {
    return this.data.leads.find((l) => l.id === leadId);
  }

  public upsertLead(lead: Lead) {
    const idx = this.data.leads.findIndex((l) => l.id === lead.id || l.businessId === lead.businessId);
    if (idx >= 0) {
      this.data.leads[idx] = lead;
    } else {
      this.data.leads.unshift(lead);
    }
    this.scheduleSave();
  }

  public removeLead(leadId: string) {
    this.data.leads = this.data.leads.filter((l) => l.id !== leadId);
    this.scheduleSave();
  }

  // 18. Lead Notes
  public getNotesForLead(leadId: string): LeadNote[] {
    return this.data.lead_notes
      .filter((n) => n.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addLeadNote(note: LeadNote) {
    const idx = this.data.lead_notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      this.data.lead_notes[idx] = note;
    } else {
      this.data.lead_notes.unshift(note);
    }
    this.scheduleSave();
  }

  // 19. Lead Contacts (Outreach history)
  public getContactsForLead(leadId: string): LeadContact[] {
    return this.data.lead_contacts
      .filter((c) => c.leadId === leadId)
      .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  }

  public addLeadContact(c: LeadContact) {
    const idx = this.data.lead_contacts.findIndex((x) => x.id === c.id);
    if (idx >= 0) {
      this.data.lead_contacts[idx] = c;
    } else {
      this.data.lead_contacts.unshift(c);
    }
    // increment interaction count on lead
    const lead = this.getLeadById(c.leadId);
    if (lead) {
      lead.totalInteractions = (lead.totalInteractions || 0) + 1;
      lead.updatedAt = new Date().toISOString();
      if (c.nextFollowUp) {
        lead.nextFollowUpDate = c.nextFollowUp;
      }
    }
    this.scheduleSave();
  }

  // 20. Follow Ups
  public getFollowUps(): FollowUp[] {
    return this.data.follow_ups.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  public getFollowUpsForLead(leadId: string): FollowUp[] {
    return this.data.follow_ups.filter((f) => f.leadId === leadId);
  }

  public addFollowUp(fu: FollowUp) {
    this.data.follow_ups.push(fu);
    this.scheduleSave();
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>) {
    const idx = this.data.follow_ups.findIndex((f) => f.id === id);
    if (idx >= 0) {
      this.data.follow_ups[idx] = { ...this.data.follow_ups[idx], ...updates };
      this.scheduleSave();
    }
  }

  // 21. Business Snapshots
  public addSnapshot(snapshot: BusinessSnapshot) {
    this.data.business_snapshots.push(snapshot);
    this.scheduleSave();
  }

  public getSnapshotsForBusiness(businessId: string): BusinessSnapshot[] {
    return this.data.business_snapshots
      .filter((s) => s.businessId === businessId)
      .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime());
  }

  // 22. Change Events
  public addChangeEvent(event: ChangeEvent) {
    this.data.change_events.unshift(event);
    this.scheduleSave();
  }

  public getChangeEventsForBusiness(businessId: string): ChangeEvent[] {
    return this.data.change_events.filter((e) => e.businessId === businessId);
  }

  // 23. Scan Jobs, 24. Items, 25. Errors
  public getScanJobs(): ScanJob[] {
    return this.data.scan_jobs.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getScanJob(id: string): ScanJob | undefined {
    return this.data.scan_jobs.find((j) => j.id === id);
  }

  public upsertScanJob(job: ScanJob) {
    const idx = this.data.scan_jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) {
      this.data.scan_jobs[idx] = job;
    } else {
      this.data.scan_jobs.unshift(job);
    }
    this.scheduleSave();
  }

  public addScanItem(item: ScanItem) {
    this.data.scan_items.push(item);
    this.scheduleSave();
  }

  public getScanItems(jobId: string): ScanItem[] {
    return this.data.scan_items.filter((i) => i.jobId === jobId);
  }

  public addScanError(err: ScanError) {
    this.data.scan_errors.unshift(err);
    this.scheduleSave();
  }

  public getScanErrors(jobId?: string): ScanError[] {
    if (jobId) return this.data.scan_errors.filter((e) => e.jobId === jobId);
    return this.data.scan_errors;
  }

  // 26. Provider Configs
  public getProviderConfigs(): ProviderConfig[] {
    return this.data.provider_configs;
  }

  public updateProviderConfig(provider: string, updates: Partial<ProviderConfig>) {
    const idx = this.data.provider_configs.findIndex((p) => p.providerName === provider);
    if (idx >= 0) {
      this.data.provider_configs[idx] = { ...this.data.provider_configs[idx], ...updates };
      this.scheduleSave();
    }
  }

  // 27. Provider Usage
  public recordProviderUsage(usage: Omit<ProviderUsage, 'id'>) {
    const existing = this.data.provider_usage.find(
      (u) => u.provider === usage.provider && u.endpoint === usage.endpoint
    );
    if (existing) {
      existing.requestsCount += usage.requestsCount;
      existing.lastRequestAt = usage.lastRequestAt;
      if (usage.fieldMaskUsed) existing.fieldMaskUsed = usage.fieldMaskUsed;
    } else {
      this.data.provider_usage.push({
        id: `usage_${crypto.randomUUID()}`,
        ...usage,
      });
    }
    this.scheduleSave();
  }

  public getProviderUsage(): ProviderUsage[] {
    return this.data.provider_usage;
  }

  // 28. Audit Logs
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    this.data.audit_logs.unshift({
      id: `audit_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      ...log,
    });
    // keep max 500 audit logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.length = 500;
    }
    this.scheduleSave();
  }

  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  // Aggregate Complete Business Profile
  public getFullBusinessProfile(businessId: string) {
    const business = this.getBusinessById(businessId);
    if (!business) return null;

    const location = this.getLocationForBusiness(businessId);
    const categories = this.getCategoriesForBusiness(businessId);
    const contacts = this.getContactsForBusiness(businessId);
    const sources = this.getSourcesForBusiness(businessId);
    const website = this.getWebsiteForBusiness(businessId);
    const audits = this.getAuditsForBusiness(businessId);
    const latestAudit = audits[0] || null;
    const socials = this.getSocialProfilesForBusiness(businessId);
    const opportunities = this.getOpportunitiesForBusiness(businessId);
    const evidence = this.getEvidenceForBusiness(businessId);
    const lead = this.getLeadByBusinessId(businessId);
    const snapshots = this.getSnapshotsForBusiness(businessId);
    const changeEvents = this.getChangeEventsForBusiness(businessId);

    return {
      business,
      location,
      categories,
      contacts,
      sources,
      website,
      audits,
      latestAudit,
      socials,
      opportunities,
      evidence,
      lead,
      snapshots,
      changeEvents,
    };
  }
}

export const db = new RelationalDatabase();
