/**
 * Strict Multi-Tier Business Deduplication Engine
 * Adheres strictly to duplicate priority:
 * 1. Provider Place ID
 * 2. Provider-specific stable identifier
 * 3. Exact normalized phone (E.164)
 * 4. Exact normalized website domain
 * 5. Name + formatted address
 * 6. Name + geographic proximity (< 100 meters)
 * NEVER merges on similar names alone!
 */

import { Business, BusinessLocation, BusinessContact, Website } from '../types.ts';
import { db } from '../db/storage.ts';
import { normalizeBusinessName } from './normalization.ts';

export interface DeduplicationMatch {
  matchFound: boolean;
  matchedBusiness?: Business;
  matchTier?: 1 | 2 | 3 | 4 | 5 | 6;
  matchReason?: string;
}

/**
 * Calculate distance in meters between two lat/lng coordinates (Haversine formula)
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function findExistingBusiness(candidate: {
  placeId?: string;
  providerId?: string;
  normalizedPhone?: string;
  websiteDomain?: string;
  name: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}): DeduplicationMatch {
  // Tier 1: Provider Place ID
  if (candidate.placeId) {
    const ident = db.findIdentifier('place_id', candidate.placeId);
    if (ident) {
      const b = db.getBusinessById(ident.businessId);
      if (b) {
        return { matchFound: true, matchedBusiness: b, matchTier: 1, matchReason: `Exact Place ID Match (${candidate.placeId})` };
      }
    }
  }

  // Tier 2: Provider stable identifier
  if (candidate.providerId) {
    const ident = db.findIdentifier('registry_id', candidate.providerId);
    if (ident) {
      const b = db.getBusinessById(ident.businessId);
      if (b) {
        return { matchFound: true, matchedBusiness: b, matchTier: 2, matchReason: `Exact Registry/Provider ID Match` };
      }
    }
  }

  // Tier 3: Exact normalized phone (E.164)
  if (candidate.normalizedPhone && candidate.normalizedPhone.length >= 8) {
    const allBusinesses = db.getBusinesses();
    for (const b of allBusinesses) {
      const contacts = db.getContactsForBusiness(b.id);
      const phoneMatch = contacts.find(
        (c) =>
          (c.contactType === 'phone' || c.contactType === 'international_phone') &&
          c.normalizedValue === candidate.normalizedPhone
      );
      if (phoneMatch) {
        return {
          matchFound: true,
          matchedBusiness: b,
          matchTier: 3,
          matchReason: `Exact Normalized Phone Match (${candidate.normalizedPhone})`,
        };
      }
    }
  }

  // Tier 4: Exact normalized website domain
  if (candidate.websiteDomain && !['facebook.com', 'instagram.com', 'google.com', 'wa.me'].includes(candidate.websiteDomain)) {
    const allBusinesses = db.getBusinesses();
    for (const b of allBusinesses) {
      const w = db.getWebsiteForBusiness(b.id);
      if (w && w.domain === candidate.websiteDomain.toLowerCase()) {
        return {
          matchFound: true,
          matchedBusiness: b,
          matchTier: 4,
          matchReason: `Exact Normalized Website Domain Match (${candidate.websiteDomain})`,
        };
      }
    }
  }

  const normCandidateName = normalizeBusinessName(candidate.name);

  // Tier 5: Name + exact formatted address
  if (candidate.formattedAddress && normCandidateName) {
    const cleanCandidateAddr = candidate.formattedAddress.trim().toLowerCase();
    const allBusinesses = db.getBusinesses();
    for (const b of allBusinesses) {
      if (b.normalizedName === normCandidateName) {
        const loc = db.getLocationForBusiness(b.id);
        if (loc && loc.formattedAddress.trim().toLowerCase() === cleanCandidateAddr) {
          return {
            matchFound: true,
            matchedBusiness: b,
            matchTier: 5,
            matchReason: 'Exact Normalized Name + Formatted Address Match',
          };
        }
      }
    }
  }

  // Tier 6: Name + geographic proximity (< 100 meters)
  if (candidate.latitude && candidate.longitude && normCandidateName) {
    const allBusinesses = db.getBusinesses();
    for (const b of allBusinesses) {
      if (b.normalizedName === normCandidateName) {
        const loc = db.getLocationForBusiness(b.id);
        if (loc && loc.latitude && loc.longitude) {
          const dist = calculateDistanceMeters(candidate.latitude, candidate.longitude, loc.latitude, loc.longitude);
          if (dist < 100) {
            return {
              matchFound: true,
              matchedBusiness: b,
              matchTier: 6,
              matchReason: `Exact Name + Geographic Proximity Match (${Math.round(dist)}m)`,
            };
          }
        }
      }
    }
  }

  // No confident match — keep separate to avoid false positives!
  return { matchFound: false };
}
