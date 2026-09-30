/**
 * Change Detection & Historical Snapshot Engine
 * Takes snapshots of businesses before and after updates, detects meaningful deltas,
 * and logs historical ChangeEvents (OLD VALUE, NEW VALUE, DATE, SOURCE).
 */

import crypto from 'crypto';
import { Business, Website, BusinessContact, BusinessLocation, BusinessSnapshot, ChangeEvent } from '../types.ts';
import { db } from '../db/storage.ts';

export function recordBusinessSnapshot(businessId: string): BusinessSnapshot {
  const profile = db.getFullBusinessProfile(businessId);
  const now = new Date().toISOString();

  const snapshot: BusinessSnapshot = {
    id: `snap_${crypto.randomUUID()}`,
    businessId,
    snapshotDate: now,
    snapshotData: {
      name: profile?.business.name || '',
      website: profile?.website?.originalUrl,
      phone: profile?.contacts.find((c) => c.contactType === 'phone')?.value,
      address: profile?.location?.formattedAddress,
      categories: (profile?.categories || []).map((c) => c.categoryLabel),
      opportunityTypes: (profile?.opportunities || []).map((o) => o.type),
      socialCount: profile?.socials.length || 0,
      auditStatus: profile?.latestAudit?.status,
    },
  };

  db.addSnapshot(snapshot);
  return snapshot;
}

export function detectAndRecordChanges(
  businessId: string,
  previousSnapshot: BusinessSnapshot | undefined,
  currentData: {
    websiteUrl?: string;
    phone?: string;
    address?: string;
    socialCount?: number;
    oppTypes?: string[];
  },
  source = 'Rescan Engine'
): ChangeEvent[] {
  if (!previousSnapshot) {
    recordBusinessSnapshot(businessId);
    return [];
  }

  const prev = previousSnapshot.snapshotData;
  const now = new Date().toISOString();
  const detectedEvents: ChangeEvent[] = [];

  const addEvent = (
    eventType: ChangeEvent['eventType'],
    fieldName: string,
    oldValue: string | null,
    newValue: string | null
  ) => {
    const event: ChangeEvent = {
      id: `chg_${crypto.randomUUID()}`,
      businessId,
      eventType,
      fieldName,
      oldValue,
      newValue,
      detectedAt: now,
      source,
    };
    db.addChangeEvent(event);
    detectedEvents.push(event);
  };

  // 1. Website changes
  if (!prev.website && currentData.websiteUrl) {
    addEvent('WEBSITE_ADDED', 'website', null, currentData.websiteUrl);
  } else if (prev.website && !currentData.websiteUrl) {
    addEvent('WEBSITE_REMOVED', 'website', prev.website, null);
  } else if (prev.website && currentData.websiteUrl && prev.website !== currentData.websiteUrl) {
    addEvent('WEBSITE_CHANGED', 'website', prev.website, currentData.websiteUrl);
  }

  // 2. Phone changes
  if (prev.phone !== currentData.phone && (prev.phone || currentData.phone)) {
    addEvent('PHONE_CHANGED', 'phone', prev.phone || null, currentData.phone || null);
  }

  // 3. Address changes
  if (prev.address !== currentData.address && (prev.address || currentData.address)) {
    addEvent('ADDRESS_CHANGED', 'address', prev.address || null, currentData.address || null);
  }

  // 4. Social account count changes
  if (currentData.socialCount !== undefined && prev.socialCount !== currentData.socialCount) {
    if (currentData.socialCount > prev.socialCount) {
      addEvent('SOCIAL_ACCOUNT_ADDED', 'social_profiles', `${prev.socialCount} accounts`, `${currentData.socialCount} accounts`);
    } else {
      addEvent('SOCIAL_ACCOUNT_REMOVED', 'social_profiles', `${prev.socialCount} accounts`, `${currentData.socialCount} accounts`);
    }
  }

  // Record a fresh snapshot
  recordBusinessSnapshot(businessId);

  return detectedEvents;
}
