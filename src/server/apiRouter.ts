/**
 * Express API Router for Global Website Opportunity Finder
 * Implements real endpoints for search, audits, leads, follow-ups, and provider management.
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db/storage.ts';
import { businessService } from './services/businessService.ts';
import { googlePlacesProvider } from './services/placesProvider.ts';
import { youtubeProvider } from './services/youtubeProvider.ts';
import { LeadStatus, ContactMethod } from './types.ts';

export const apiRouter = Router();

// 1. Health check & Provider status
apiRouter.get('/health', (req: Request, res: Response) => {
  const configs = db.getProviderConfigs();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    providers: configs,
    database: {
      businessesCount: db.getBusinesses().length,
      leadsCount: db.getLeads().length,
      auditsCount: db.getAuditsForBusiness('').length, // total audits
    },
  });
});

// 2. Location Autocomplete
apiRouter.post('/autocomplete', async (req: Request, res: Response) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Missing input query parameter' });
    }
    const result = await googlePlacesProvider.autocompleteLocation(input);
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Autocomplete error' });
  }
});

// 3. Global Business Search & Discovery
apiRouter.post('/search', async (req: Request, res: Response) => {
  try {
    const {
      country,
      region,
      city,
      area,
      category,
      keyword,
      secondaryKeyword,
      quantity = 10,
      filters,
    } = req.body;

    if (!country || !city || !category) {
      return res.status(400).json({
        error: 'Missing required search parameters: country, city, and category are required.',
      });
    }

    db.logAudit({
      action: 'SEARCH_INITIATED',
      entityType: 'scan_job',
      entityId: `query_${Date.now()}`,
      details: `Search: ${category} in ${city}, ${region || ''} ${country} (Target: ${quantity})`,
    });

    const result = await businessService.searchAndIngest({
      country,
      region,
      city,
      area,
      category,
      keyword,
      secondaryKeyword,
      quantityRequested: Number(quantity),
      filters,
    });

    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Search processing error' });
  }
});

// 4. List Businesses
apiRouter.get('/businesses', (req: Request, res: Response) => {
  try {
    const { search, category, websiteStatus, country } = req.query;
    let list = db.getBusinesses();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.primaryCategory.toLowerCase().includes(q));
    }

    if (category && typeof category === 'string') {
      list = list.filter((b) => b.primaryCategory.toLowerCase() === category.toLowerCase());
    }

    if (websiteStatus && typeof websiteStatus === 'string') {
      list = list.filter((b) => b.websiteStatus === websiteStatus);
    }

    if (country && typeof country === 'string') {
      const countryCode = country.toUpperCase();
      list = list.filter((b) => {
        const loc = db.getLocationForBusiness(b.id);
        return loc && (loc.isoCountryCode === countryCode || loc.country.toLowerCase() === country.toLowerCase());
      });
    }

    // Attach basic opportunity tags and location summary to list response
    const enriched = list.map((b) => {
      const loc = db.getLocationForBusiness(b.id);
      const opps = db.getOpportunitiesForBusiness(b.id);
      const lead = db.getLeadByBusinessId(b.id);
      const website = db.getWebsiteForBusiness(b.id);
      const latestAudit = db.getLatestAuditForBusiness(b.id);
      return {
        ...b,
        formattedAddress: loc?.formattedAddress,
        country: loc?.country,
        isoCountryCode: loc?.isoCountryCode,
        opportunityCount: opps.length,
        topOpportunity: opps[0]?.title,
        topOpportunityType: opps[0]?.type,
        isLead: Boolean(lead),
        leadStatus: lead?.status,
        websiteUrl: website?.originalUrl,
        auditStatus: latestAudit?.status || 'NOT_CHECKED',
      };
    });

    res.json(enriched);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve businesses' });
  }
});

// 5. Full Business Profile
apiRouter.get('/businesses/:id', (req: Request, res: Response) => {
  try {
    const profile = db.getFullBusinessProfile(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(profile);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error retrieving business profile' });
  }
});

// 6. Run Real Website Audit
apiRouter.post('/businesses/:id/audit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const business = db.getBusinessById(id);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const website = db.getWebsiteForBusiness(id);
    if (!website) {
      return res.status(400).json({
        error: 'No website URL is on record for this business to audit.',
      });
    }

    db.logAudit({
      action: 'WEBSITE_AUDIT_TRIGGERED',
      entityType: 'website_audit',
      entityId: website.id,
      details: `Starting SSRF-safe audit on ${website.originalUrl}`,
    });

    const success = await businessService.runAuditForBusiness(id);
    const updatedProfile = db.getFullBusinessProfile(id);

    res.json({
      success,
      profile: updatedProfile,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Audit execution failed' });
  }
});

// 7. Rescan Business (Requirement 35 & 36)
apiRouter.post('/businesses/:id/rescan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode = 'FULL' } = req.body;

    const result = await businessService.rescanBusiness(id, mode);
    if (!result) {
      return res.status(404).json({ error: 'Business not found' });
    }

    db.logAudit({
      action: 'BUSINESS_RESCANNED',
      entityType: 'business',
      entityId: id,
      details: `Rescan mode: ${mode}. Changes detected: ${result.changes.length}`,
    });

    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Rescan execution failed' });
  }
});

// 8. Business Change History & Timeline
apiRouter.get('/businesses/:id/history', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const snapshots = db.getSnapshotsForBusiness(id);
    const changeEvents = db.getChangeEventsForBusiness(id);
    const contacts = db.getContactsForBusiness(id);
    const audits = db.getAuditsForBusiness(id);
    const lead = db.getLeadByBusinessId(id);
    const leadContacts = lead ? db.getContactsForLead(lead.id) : [];

    res.json({
      snapshots,
      changeEvents,
      contacts,
      audits,
      leadContacts,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve history' });
  }
});

// 9. Leads Management
apiRouter.get('/leads', (req: Request, res: Response) => {
  try {
    const leads = db.getLeads();
    const enriched = leads.map((l) => {
      const b = db.getBusinessById(l.businessId);
      const loc = db.getLocationForBusiness(l.businessId);
      const website = db.getWebsiteForBusiness(l.businessId);
      const opps = db.getOpportunitiesForBusiness(l.businessId);
      const latestAudit = db.getLatestAuditForBusiness(l.businessId);
      return {
        ...l,
        businessName: b?.name || 'Unknown',
        businessCategory: b?.primaryCategory || '',
        formattedAddress: loc?.formattedAddress || '',
        country: loc?.country || '',
        websiteUrl: website?.originalUrl,
        websiteStatus: b?.websiteStatus,
        opportunities: opps,
        auditStatus: latestAudit?.status || 'NOT_CHECKED',
      };
    });
    res.json(enriched);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve leads' });
  }
});

apiRouter.post('/leads', (req: Request, res: Response) => {
  try {
    const { businessId, status = 'NEW', priority = 'NORMAL', tags = [] } = req.body;
    if (!businessId) {
      return res.status(400).json({ error: 'Missing businessId' });
    }

    const business = db.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const now = new Date().toISOString();
    const leadId = `lead_${crypto.randomUUID()}`;
    const lead = {
      id: leadId,
      businessId,
      status: status as LeadStatus,
      priority,
      tags,
      savedAt: now,
      updatedAt: now,
      totalInteractions: 0,
    };

    db.upsertLead(lead);
    db.logAudit({
      action: 'LEAD_SAVED',
      entityType: 'lead',
      entityId: leadId,
      details: `Saved business "${business.name}" as lead with status ${status}`,
    });

    res.json(lead);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save lead' });
  }
});

apiRouter.put('/leads/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = db.getLeadById(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { status, priority, tags, nextFollowUpDate } = req.body;
    if (status) lead.status = status;
    if (priority) lead.priority = priority;
    if (tags) lead.tags = tags;
    if (nextFollowUpDate !== undefined) lead.nextFollowUpDate = nextFollowUpDate;
    lead.updatedAt = new Date().toISOString();

    db.upsertLead(lead);
    res.json(lead);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update lead' });
  }
});

apiRouter.delete('/leads/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.removeLead(id);
    db.logAudit({
      action: 'LEAD_REMOVED',
      entityType: 'lead',
      entityId: id,
      details: 'Removed lead from pipeline',
    });
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to remove lead' });
  }
});

// 10. Lead Notes
apiRouter.get('/leads/:id/notes', (req: Request, res: Response) => {
  try {
    const notes = db.getNotesForLead(req.params.id);
    res.json(notes);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get notes' });
  }
});

apiRouter.post('/leads/:id/notes', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, author = 'Lead Analyst' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const note = {
      id: `note_${crypto.randomUUID()}`,
      leadId: id,
      author,
      content,
      createdAt: new Date().toISOString(),
    };

    db.addLeadNote(note);
    res.json(note);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to add note' });
  }
});

// 11. Lead Outreach Contacts (Manual interactions only, strictly no automated spam)
apiRouter.get('/leads/:id/contacts', (req: Request, res: Response) => {
  try {
    const contacts = db.getContactsForLead(req.params.id);
    res.json(contacts);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get contact history' });
  }
});

apiRouter.post('/leads/:id/contacts', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lead = db.getLeadById(id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const {
      date = new Date().toISOString().split('T')[0],
      time = new Date().toTimeString().slice(0, 5),
      method,
      notes = '',
      outcome = 'COMPLETED',
      nextFollowUp,
    } = req.body;

    if (!method) return res.status(400).json({ error: 'Method is required' });

    const contactLog = {
      id: `lcnt_${crypto.randomUUID()}`,
      leadId: id,
      businessId: lead.businessId,
      date,
      time,
      method: method as ContactMethod,
      notes,
      outcome,
      nextFollowUp,
      loggedAt: new Date().toISOString(),
    };

    db.addLeadContact(contactLog);

    // If follow-up date specified, automatically schedule follow-up
    if (nextFollowUp) {
      db.addFollowUp({
        id: `fu_${crypto.randomUUID()}`,
        leadId: id,
        businessId: lead.businessId,
        dueDate: nextFollowUp,
        title: `Follow up via ${method}: ${notes.slice(0, 40) || 'Routine check'}`,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json(contactLog);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to log outreach contact' });
  }
});

// 12. Follow-Ups Management
apiRouter.get('/followups', (req: Request, res: Response) => {
  try {
    const followUps = db.getFollowUps();
    const enriched = followUps.map((fu) => {
      const b = db.getBusinessById(fu.businessId);
      const lead = db.getLeadById(fu.leadId);
      return {
        ...fu,
        businessName: b?.name || 'Unknown',
        leadStatus: lead?.status,
      };
    });
    res.json(enriched);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve follow-ups' });
  }
});

apiRouter.put('/followups/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;
    db.updateFollowUp(id, {
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    });
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update follow-up' });
  }
});

// 13. Provider Configurations & Quota Tracking
apiRouter.get('/providers', (req: Request, res: Response) => {
  try {
    const configs = db.getProviderConfigs();
    const usage = db.getProviderUsage();
    res.json({ configs, usage });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve providers' });
  }
});

apiRouter.post('/providers/config', (req: Request, res: Response) => {
  try {
    const { provider, apiKey } = req.body;
    if (!provider) return res.status(400).json({ error: 'Provider name required' });

    if (provider === 'google_places') {
      if (apiKey) {
        process.env.GMP_CUSTOM_API_KEY = apiKey.trim();
        db.updateProviderConfig('google_places', {
          isEnabled: true,
          hasApiKey: true,
          apiKeyMasked: `${apiKey.trim().slice(0, 4)}...${apiKey.trim().slice(-4)}`,
          status: 'ONLINE',
          statusMessage: 'Custom Google Places API Key configured',
        });
      }
    } else if (provider === 'youtube') {
      if (apiKey) {
        process.env.YOUTUBE_API_KEY = apiKey.trim();
        db.updateProviderConfig('youtube', {
          isEnabled: true,
          hasApiKey: true,
          apiKeyMasked: `${apiKey.trim().slice(0, 4)}...${apiKey.trim().slice(-4)}`,
          status: 'ONLINE',
          statusMessage: 'Custom YouTube Data API Key configured',
        });
      }
    }

    res.json({ success: true, configs: db.getProviderConfigs() });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update provider config' });
  }
});

// 14. Real Aggregated Stats (Verified evidence facts, strictly NO fabricated stats)
apiRouter.get('/stats', (req: Request, res: Response) => {
  try {
    const businesses = db.getBusinesses();
    const leads = db.getLeads();
    const audits = db.getAuditsForBusiness(''); // all audits

    const totalBusinesses = businesses.length;
    const noWebsiteCount = businesses.filter((b) => b.websiteStatus === 'NO_WEBSITE_DETECTED').length;
    const websiteDetectedCount = businesses.filter((b) => b.websiteStatus === 'WEBSITE_DETECTED').length;

    // From completed audits
    const completedAudits = audits.filter((a) => a.status === 'COMPLETED');
    const totalAudited = completedAudits.length;
    const mobileIssuesCount = completedAudits.filter((a) => a.hasViewportMeta === false).length;
    const insecureHttpCount = completedAudits.filter((a) => a.httpsEnforced === false).length;
    const missingContactCount = completedAudits.filter((a) => !a.hasContactForm && !a.hasClickToCall).length;

    // Opportunities
    const allOpps = db.getAllOpportunities();
    const oppCountsByType: Record<string, number> = {};
    for (const o of allOpps) {
      oppCountsByType[o.type] = (oppCountsByType[o.type] || 0) + 1;
    }

    res.json({
      totalBusinesses,
      noWebsiteCount,
      websiteDetectedCount,
      noWebsiteRate: totalBusinesses > 0 ? Math.round((noWebsiteCount / totalBusinesses) * 100) : 0,
      totalAudited,
      mobileIssuesCount,
      insecureHttpCount,
      missingContactCount,
      totalLeads: leads.length,
      leadsByStatus: {
        NEW: leads.filter((l) => l.status === 'NEW').length,
        RESEARCHING: leads.filter((l) => l.status === 'RESEARCHING').length,
        CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
        FOLLOW_UP: leads.filter((l) => l.status === 'FOLLOW_UP').length,
        INTERESTED: leads.filter((l) => l.status === 'INTERESTED').length,
        PROPOSAL: leads.filter((l) => l.status === 'PROPOSAL').length,
        WON: leads.filter((l) => l.status === 'WON').length,
      },
      oppCountsByType,
      countriesRepresented: Array.from(
        new Set(
          businesses
            .map((b) => db.getLocationForBusiness(b.id)?.country)
            .filter((c): c is string => Boolean(c))
        )
      ),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to compute stats' });
  }
});

// --- GLOBAL OPPORTUNITY ENGINE REST ENDPOINTS ---

import { opportunityStore } from './opportunityEngine/opportunityStore.ts';
import { ingestionEngine } from './opportunityEngine/ingestionEngine.ts';

// 18. Structured Opportunities Search & Filter
apiRouter.get('/opportunities', (req: Request, res: Response) => {
  try {
    const { query, opportunityType, country, workMode, status, limit, offset } = req.query;
    const result = opportunityStore.getOpportunities({
      query: typeof query === 'string' ? query : undefined,
      opportunityType: typeof opportunityType === 'string' ? opportunityType : undefined,
      country: typeof country === 'string' ? country : undefined,
      workMode: typeof workMode === 'string' ? workMode : undefined,
      status: typeof status === 'string' ? status : undefined,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch opportunities' });
  }
});

// 19. Single Opportunity Details
apiRouter.get('/opportunities/:id', (req: Request, res: Response) => {
  try {
    const opp = opportunityStore.getOpportunityById(req.params.id);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    const relatedOrgs = opportunityStore
      .getOrganizations()
      .filter((o) => opp.relatedOrganizationIds.includes(o.id));
    const relatedPersonas = opportunityStore
      .getPersonas()
      .filter((p) => opp.relatedPersonaIds.includes(p.id));

    res.json({
      opportunity: opp,
      organizations: relatedOrgs,
      personas: relatedPersonas,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch opportunity' });
  }
});

// 20. Structured Organizations Directory
apiRouter.get('/organizations', (req: Request, res: Response) => {
  try {
    const { query, businessType } = req.query;
    const orgs = opportunityStore.getOrganizations({
      query: typeof query === 'string' ? query : undefined,
      businessType: typeof businessType === 'string' ? businessType : undefined,
    });
    res.json({ items: orgs, total: orgs.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch organizations' });
  }
});

// 21. Structured Personas & Public Contacts Directory
apiRouter.get('/personas', (req: Request, res: Response) => {
  try {
    const { query, personaType } = req.query;
    const personas = opportunityStore.getPersonas({
      query: typeof query === 'string' ? query : undefined,
      personaType: typeof personaType === 'string' ? personaType : undefined,
    });
    res.json({ items: personas, total: personas.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch personas' });
  }
});

// 22. Real Database Intelligence Metrics
apiRouter.get('/intelligence/stats', (req: Request, res: Response) => {
  try {
    const stats = opportunityStore.getDatabaseStats();
    res.json(stats);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch stats' });
  }
});

// 23. Ingestion Connectors Status
apiRouter.get('/ingestion/connectors', (req: Request, res: Response) => {
  try {
    const connectors = opportunityStore.getConnectors();
    res.json({ items: connectors, total: connectors.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch connectors' });
  }
});

// 24. Ingestion Sync Logs
apiRouter.get('/ingestion/logs', (req: Request, res: Response) => {
  try {
    const logs = opportunityStore.getIngestionLogs();
    res.json({ items: logs, total: logs.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch logs' });
  }
});

// 25. Trigger Background Ingestion Sync
apiRouter.post('/ingestion/sync', async (req: Request, res: Response) => {
  try {
    const { connectorId } = req.body;
    const log = await ingestionEngine.triggerManualSync(connectorId);
    res.json({ success: true, log });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to trigger sync' });
  }
});

// 26. Global Search with Natural Language Query Parsing
apiRouter.all(['/search/global', '/search-global'], (req: Request, res: Response) => {
  try {
    const params = req.method === 'POST' ? req.body : req.query;
    const result = opportunityStore.searchGlobal({
      query: typeof params.query === 'string' ? params.query : undefined,
      opportunityType: typeof params.opportunityType === 'string' ? params.opportunityType : undefined,
      businessType: typeof params.businessType === 'string' ? params.businessType : undefined,
      country: typeof params.country === 'string' ? params.country : undefined,
      city: typeof params.city === 'string' ? params.city : undefined,
      limit: params.limit ? Number(params.limit) : 50,
      offset: params.offset ? Number(params.offset) : 0,
    });
    res.json(result);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to process global search' });
  }
});

// 27. Opportunity Profile Matching with Grounded Why-This-Matches Explanations
apiRouter.post('/match/opportunities', (req: Request, res: Response) => {
  try {
    const { educationLevel, skills = [], interests = [], location, preferredCountries = [], opportunityTypes = [] } = req.body;
    const matches = opportunityStore.matchOpportunities({
      educationLevel,
      skills,
      interests,
      location,
      preferredCountries,
      opportunityTypes,
    });
    res.json({ matches, totalMatches: matches.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to compute matches' });
  }
});

// 28. Multi-Entity Unified Knowledge Graph
apiRouter.get('/knowledge-graph', (req: Request, res: Response) => {
  try {
    const graphData = opportunityStore.getKnowledgeGraphData();
    res.json(graphData);
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate knowledge graph' });
  }
});

// 29. Real-Time System Intelligence Events Feed
apiRouter.get('/intelligence/events', (req: Request, res: Response) => {
  try {
    const events = opportunityStore.getSystemEvents();
    res.json({ events, total: events.length });
  } catch (err: unknown) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve system events' });
  }
});


