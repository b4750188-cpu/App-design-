/**
 * Global Business Service & Ingestion Pipeline
 * Connects Google Places API (New), Normalization, Deduplication, Audit Engine,
 * Social Verification, and Opportunity Engine into a seamless data flow.
 */

import crypto from 'crypto';
import {
  Business,
  BusinessIdentifier,
  BusinessCategory,
  BusinessLocation,
  BusinessContact,
  BusinessSource,
  Website,
  SocialProfile,
  OpportunityFilterOptions,
} from '../types.ts';
import { db } from '../db/storage.ts';
import { googlePlacesProvider, PlaceSearchRawItem } from './placesProvider.ts';
import { youtubeProvider } from './youtubeProvider.ts';
import {
  normalizeBusinessName,
  resolveCountry,
  normalizePhoneNumber,
  normalizeWebsiteUrl,
  isRtlText,
} from './normalization.ts';
import { findExistingBusiness } from './deduplication.ts';
import { executeWebsiteAudit } from './websiteAudit.ts';
import { evaluateOpportunities } from './opportunityEngine.ts';
import { recordBusinessSnapshot, detectAndRecordChanges } from './changeDetection.ts';

export interface IngestPlaceOptions {
  runWebsiteAuditImmediately?: boolean;
  searchCountryCode?: string;
  sourceJobId?: string;
}

export class BusinessService {
  /**
   * Ingest a single raw place item returned from Google Places API
   */
  public async ingestGooglePlace(rawItem: PlaceSearchRawItem, options: IngestPlaceOptions = {}): Promise<Business> {
    const rawName = rawItem.displayName?.text || 'Unnamed Establishment';
    const normName = normalizeBusinessName(rawName);

    // Normalize phone
    const rawPhone = rawItem.internationalPhoneNumber || rawItem.nationalPhoneNumber || '';
    const phoneInfo = normalizePhoneNumber(rawPhone);

    // Normalize website
    const rawWebsite = rawItem.websiteUri || '';
    const websiteInfo = normalizeWebsiteUrl(rawWebsite);

    // Formatted Address & Country
    const formattedAddress = rawItem.formattedAddress || 'Address Not Available';
    const countryInfo = resolveCountry(formattedAddress, options.searchCountryCode);

    // Deduplication check
    const dedup = findExistingBusiness({
      placeId: rawItem.id,
      name: rawName,
      normalizedPhone: phoneInfo.e164,
      websiteDomain: websiteInfo.domain,
      formattedAddress,
      latitude: rawItem.location?.latitude,
      longitude: rawItem.location?.longitude,
    });

    const now = new Date().toISOString();
    let businessId: string;
    let isNewBusiness = false;
    let existingBusiness: Business | undefined;

    if (dedup.matchFound && dedup.matchedBusiness) {
      businessId = dedup.matchedBusiness.id;
      existingBusiness = dedup.matchedBusiness;
    } else {
      businessId = `biz_${crypto.randomUUID()}`;
      isNewBusiness = true;
    }

    const businessStatus = rawItem.businessStatus || 'OPERATIONAL';
    const websiteStatus = rawItem.websiteUri
      ? 'WEBSITE_DETECTED'
      : 'NO_WEBSITE_DETECTED';

    const business: Business = {
      id: businessId,
      name: rawName,
      normalizedName: normName,
      primaryCategory: rawItem.primaryType || 'establishment',
      status: businessStatus,
      websiteStatus,
      rating: rawItem.rating,
      reviewCount: rawItem.userRatingCount,
      firstDiscovered: isNewBusiness ? now : existingBusiness?.firstDiscovered || now,
      lastChecked: now,
      lastModified: now,
      confidence: 'HIGH',
      primaryProvider: 'google_places',
      primaryProviderId: rawItem.id,
      rawData: {
        types: rawItem.types,
        googleMapsUri: rawItem.googleMapsUri,
        openingHours: rawItem.regularOpeningHours,
      },
    };

    // Save business record
    db.upsertBusiness(business);

    // 1. Save Identifier (Place ID)
    const placeIdentifier: BusinessIdentifier = {
      id: `ident_${crypto.randomUUID()}`,
      businessId,
      provider: 'google_places',
      identifierType: 'place_id',
      identifierValue: rawItem.id,
      confidence: 'HIGH',
      firstSeen: isNewBusiness ? now : existingBusiness?.firstDiscovered || now,
      lastSeen: now,
    };
    db.upsertIdentifier(placeIdentifier);

    // 2. Save Location
    const location: BusinessLocation = {
      id: `loc_${crypto.randomUUID()}`,
      businessId,
      country: countryInfo.name,
      isoCountryCode: countryInfo.isoCode,
      region: '',
      city: '',
      formattedAddress,
      latitude: rawItem.location?.latitude,
      longitude: rawItem.location?.longitude,
      timezone: countryInfo.defaultTimezone,
      localLanguage: countryInfo.defaultLanguage,
      isRtl: countryInfo.isRtl || isRtlText(formattedAddress),
    };
    db.upsertLocation(location);

    // 3. Save Categories
    if (rawItem.types && rawItem.types.length > 0) {
      for (const t of rawItem.types) {
        db.upsertCategory({
          id: `cat_${crypto.randomUUID()}`,
          businessId,
          industryGroup: rawItem.primaryType || t,
          categoryCode: t,
          categoryLabel: t.replace(/_/g, ' '),
          isPrimary: t === rawItem.primaryType,
          confidence: 'HIGH',
        });
      }
    }

    // 4. Save Contacts
    if (rawItem.nationalPhoneNumber) {
      db.upsertContact({
        id: `cnt_${crypto.randomUUID()}`,
        businessId,
        contactType: 'phone',
        value: rawItem.nationalPhoneNumber,
        normalizedValue: phoneInfo.e164 || rawItem.nationalPhoneNumber,
        source: 'google_places',
        confidence: 'HIGH',
        isVerified: true,
        hasConflict: false,
        discoveredAt: now,
      });
    }

    if (rawItem.internationalPhoneNumber) {
      db.upsertContact({
        id: `cnt_${crypto.randomUUID()}`,
        businessId,
        contactType: 'international_phone',
        value: rawItem.internationalPhoneNumber,
        normalizedValue: phoneInfo.e164,
        source: 'google_places',
        confidence: 'HIGH',
        isVerified: true,
        hasConflict: false,
        discoveredAt: now,
      });
    }

    if (rawItem.googleMapsUri) {
      db.upsertContact({
        id: `cnt_${crypto.randomUUID()}`,
        businessId,
        contactType: 'maps_uri',
        value: rawItem.googleMapsUri,
        normalizedValue: rawItem.googleMapsUri,
        source: 'google_places',
        confidence: 'HIGH',
        isVerified: true,
        hasConflict: false,
        discoveredAt: now,
      });
    }

    // 5. Save Source
    db.addSource({
      id: `src_${crypto.randomUUID()}`,
      businessId,
      sourceName: 'google_places',
      externalId: rawItem.id,
      retrievedAt: now,
      endpointCalled: '/places:searchText',
      fieldsRetrieved: ['id', 'displayName', 'formattedAddress', 'websiteUri', 'nationalPhoneNumber'],
    });

    // 6. Save Website
    let websiteRecord: Website | undefined;
    if (websiteInfo.isValid) {
      websiteRecord = {
        id: `ws_${crypto.randomUUID()}`,
        businessId,
        originalUrl: rawWebsite,
        normalizedUrl: websiteInfo.normalizedUrl,
        domain: websiteInfo.domain,
        protocol: websiteInfo.protocol,
        isHttps: websiteInfo.protocol === 'https',
        isLive: true,
        source: 'google_places',
        detectionDate: now,
        lastChecked: now,
        dnsResolved: false,
      };
      db.upsertWebsite(websiteRecord);
    }

    // 7. Optional Immediate Website Audit
    if (options.runWebsiteAuditImmediately && websiteRecord) {
      await this.runAuditForBusiness(businessId);
    }

    // 8. Initial Opportunity Evaluation
    this.refreshOpportunities(businessId);

    // 9. Record Initial Snapshot
    if (isNewBusiness) {
      recordBusinessSnapshot(businessId);
    }

    return business;
  }

  /**
   * Run a full website audit on an existing business
   */
  public async runAuditForBusiness(businessId: string): Promise<boolean> {
    const website = db.getWebsiteForBusiness(businessId);
    if (!website) return false;

    const previousAudit = db.getLatestAuditForBusiness(businessId);
    const auditRes = await executeWebsiteAudit(businessId, website);

    // Save audit record
    db.addAudit(auditRes.audit);

    // Save discovered pages & links
    for (const page of auditRes.discoveredPages) {
      db.addPage(page);
    }
    for (const link of auditRes.discoveredLinks) {
      db.addLink(link);
    }

    // Save discovered social profiles from official website links
    for (const soc of auditRes.discoveredSocials) {
      const socialProfile: SocialProfile = {
        id: `soc_${crypto.randomUUID()}`,
        businessId,
        platform: soc.platform,
        profileUrl: soc.url,
        handle: soc.handle,
        matchingConfidence: 'HIGH', // Link came directly from official business website!
        matchingEvidence: `Discovered as official hyperlink on audited website (${website.domain})`,
        source: 'crawler',
        firstDiscovered: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
      };
      db.upsertSocialProfile(socialProfile);
    }

    // Check for newly discovered contacts from website & detect conflicts
    for (const cnt of auditRes.discoveredContacts) {
      const existing = db.getContactsForBusiness(businessId);
      const isExisting = existing.some((c) => c.contactType === cnt.type && c.value === cnt.value);
      if (!isExisting) {
        const existingSameType = existing.find((c) => c.contactType === cnt.type);
        const hasConflict = Boolean(existingSameType && existingSameType.value !== cnt.value);

        if (hasConflict && existingSameType) {
          existingSameType.hasConflict = true;
          existingSameType.conflictingSources = [
            { source: existingSameType.source, value: existingSameType.value, date: existingSameType.discoveredAt },
            { source: 'crawler', value: cnt.value, date: new Date().toISOString() },
          ];
          db.upsertContact(existingSameType);
        }

        db.upsertContact({
          id: `cnt_${crypto.randomUUID()}`,
          businessId,
          contactType: cnt.type,
          value: cnt.value,
          normalizedValue: cnt.value,
          source: 'crawler',
          confidence: 'HIGH',
          isVerified: true,
          hasConflict,
          conflictingSources: hasConflict && existingSameType
            ? [
                { source: existingSameType.source, value: existingSameType.value, date: existingSameType.discoveredAt },
                { source: 'crawler', value: cnt.value, date: new Date().toISOString() },
              ]
            : undefined,
          discoveredAt: new Date().toISOString(),
        });
      }
    }

    // Refresh opportunities with new audit evidence
    this.refreshOpportunities(businessId);

    // Update website record status
    website.lastChecked = new Date().toISOString();
    website.httpStatusCode = auditRes.audit.httpStatus;
    website.isHttps = auditRes.audit.httpsEnforced || false;
    db.upsertWebsite(website);

    return true;
  }

  /**
   * Refresh and synthesize opportunities based on current business state
   */
  public refreshOpportunities(businessId: string) {
    const business = db.getBusinessById(businessId);
    if (!business) return;

    const website = db.getWebsiteForBusiness(businessId);
    const latestAudit = db.getLatestAuditForBusiness(businessId);
    const socials = db.getSocialProfilesForBusiness(businessId);
    const contacts = db.getContactsForBusiness(businessId);

    const evalResult = evaluateOpportunities(business, website, latestAudit, socials, contacts);

    db.replaceOpportunitiesForBusiness(businessId, evalResult.opportunities);
    db.addEvidence(evalResult.evidenceList);
  }

  /**
   * Rescan an existing business and detect changes (Requirement 35 & 36)
   */
  public async rescanBusiness(
    businessId: string,
    mode: 'FULL' | 'WEBSITE_ONLY' | 'CONTACTS_ONLY' | 'SOCIAL_ONLY' = 'FULL'
  ) {
    const profile = db.getFullBusinessProfile(businessId);
    if (!profile) return null;

    const snapshots = db.getSnapshotsForBusiness(businessId);
    const latestSnapshot = snapshots[0];

    // 1. If website audit requested
    if (mode === 'FULL' || mode === 'WEBSITE_ONLY') {
      if (profile.website) {
        await this.runAuditForBusiness(businessId);
      }
    }

    // 2. If social search requested
    if (mode === 'FULL' || mode === 'SOCIAL_ONLY') {
      if (youtubeProvider.isConfigured()) {
        const ytRes = await youtubeProvider.searchChannel(profile.business.name, profile.location?.city);
        if (ytRes.status === 'FOUND' && ytRes.channelId) {
          db.upsertSocialProfile({
            id: `soc_${crypto.randomUUID()}`,
            businessId,
            platform: 'youtube',
            profileUrl: `https://youtube.com/channel/${ytRes.channelId}`,
            channelId: ytRes.channelId,
            displayName: ytRes.channelTitle,
            matchingConfidence: 'MEDIUM',
            matchingEvidence: `Matched on business name query "${profile.business.name}"`,
            source: 'youtube',
            firstDiscovered: new Date().toISOString(),
            lastChecked: new Date().toISOString(),
          });
        }
      }
    }

    // Refresh opportunities
    this.refreshOpportunities(businessId);

    // Refresh profile state for change detection
    const updatedProfile = db.getFullBusinessProfile(businessId);
    if (updatedProfile) {
      const currentData = {
        websiteUrl: updatedProfile.website?.originalUrl,
        phone: updatedProfile.contacts.find((c) => c.contactType === 'phone')?.value,
        address: updatedProfile.location?.formattedAddress,
        socialCount: updatedProfile.socials.length,
        oppTypes: updatedProfile.opportunities.map((o) => o.type),
      };

      const changes = detectAndRecordChanges(businessId, latestSnapshot, currentData, `Rescan (${mode})`);
      return { profile: updatedProfile, changes };
    }

    return null;
  }

  /**
   * Search businesses with full international filters
   */
  public async searchAndIngest(params: {
    country: string;
    region?: string;
    city: string;
    area?: string;
    category: string;
    keyword?: string;
    secondaryKeyword?: string;
    quantityRequested: number;
    filters?: OpportunityFilterOptions;
  }): Promise<{
    businesses: Business[];
    totalFound: number;
    error?: string;
    providerStatus: string;
  }> {
    // Build precise text search query: Category + Keyword + City + Region + Country
    const locationParts = [params.area, params.city, params.region, params.country].filter(Boolean);
    const searchTerms = [params.category, params.keyword, params.secondaryKeyword].filter(Boolean);
    const textQuery = `${searchTerms.join(' ')} in ${locationParts.join(', ')}`.trim();

    const countryInfo = resolveCountry(params.country);

    // Perform query via Google Places API (New)
    const searchRes = await googlePlacesProvider.searchBusinesses({
      query: textQuery,
      pageSize: Math.min(params.quantityRequested, 20),
    });

    if (searchRes.error) {
      return {
        businesses: [],
        totalFound: 0,
        error: searchRes.error,
        providerStatus: searchRes.classification === 'AUTHENTICATION_ERROR' ? 'NOT_CONFIGURED' : 'UNAVAILABLE',
      };
    }

    const rawPlaces = searchRes.places || [];
    const ingestedList: Business[] = [];

    for (const raw of rawPlaces) {
      // Ingest into relational store
      const b = await this.ingestGooglePlace(raw, {
        searchCountryCode: countryInfo.isoCode,
        runWebsiteAuditImmediately: false, // will audit on demand or during deep scan
      });
      ingestedList.push(b);
    }

    // Apply opportunity filters if user specified them
    let filteredList = ingestedList;
    const f = params.filters;
    if (f) {
      filteredList = ingestedList.filter((b) => {
        if (f.noWebsiteOnly && b.websiteStatus !== 'NO_WEBSITE_DETECTED') return false;
        if (f.websiteExistsOnly && b.websiteStatus !== 'WEBSITE_DETECTED') return false;
        if (f.hasPhoneOnly) {
          const contacts = db.getContactsForBusiness(b.id);
          if (!contacts.some((c) => c.contactType === 'phone' || c.contactType === 'international_phone')) return false;
        }
        return true;
      });
    }

    return {
      businesses: filteredList,
      totalFound: filteredList.length,
      providerStatus: 'ONLINE',
    };
  }
}

export const businessService = new BusinessService();
