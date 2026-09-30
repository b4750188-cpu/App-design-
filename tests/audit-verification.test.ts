/**
 * Automated Verification & Gap Audit Test Suite
 * Tests SSRF protection, URL safety, normalization, deduplication,
 * industry classification, opportunity evaluation, and CRM persistence.
 */

import assert from 'node:assert/strict';
import { validateSafeHost, isPrivateOrReservedIpv4 } from '../src/server/services/security.ts';
import {
  normalizeWebsiteUrl,
  normalizePhoneNumber,
  normalizeBusinessName,
  resolveCountry,
  isRtlText,
} from '../src/server/services/normalization.ts';
import { findExistingBusiness } from '../src/server/services/deduplication.ts';
import { classifyBusinessIndustry } from '../src/server/services/industryEngine.ts';
import { evaluateOpportunities } from '../src/server/services/opportunityEngine.ts';
import { db } from '../src/server/db/storage.ts';
import { businessService } from '../src/server/services/businessService.ts';
import { googlePlacesProvider } from '../src/server/services/placesProvider.ts';
import { youtubeProvider } from '../src/server/services/youtubeProvider.ts';

async function runTestSuite() {
  console.log('--- STARTING VERIFICATION TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => void | Promise<void>) => {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err: unknown) {
      console.error(`✗ [FAIL] ${name}`);
      console.error(err);
      failed++;
    }
  };

  // 1. SSRF Guard & Host Validation
  await test('SSRF Guard: blocks localhost and loopback IPv4', async () => {
    const resLocalhost = await validateSafeHost('localhost');
    assert.equal(resLocalhost.isSafe, false);

    const resLoopback = await validateSafeHost('127.0.0.1');
    assert.equal(resLoopback.isSafe, false);
  });

  await test('SSRF Guard: blocks cloud metadata endpoints', async () => {
    const resMetadata = await validateSafeHost('169.254.169.254');
    assert.equal(resMetadata.isSafe, false);

    const resGcpInternal = await validateSafeHost('metadata.google.internal');
    assert.equal(resGcpInternal.isSafe, false);
  });

  await test('SSRF Guard: blocks private IPv4 ranges (10.x, 192.168.x, 172.16.x)', async () => {
    assert.equal(isPrivateOrReservedIpv4('10.0.0.1'), true);
    assert.equal(isPrivateOrReservedIpv4('192.168.1.1'), true);
    assert.equal(isPrivateOrReservedIpv4('172.20.0.1'), true);
    assert.equal(isPrivateOrReservedIpv4('8.8.8.8'), false);
  });

  await test('SSRF Guard: blocks decimal & octal obfuscated IPs', async () => {
    const resDec = await validateSafeHost('2130706433'); // 127.0.0.1
    assert.equal(resDec.isSafe, false);

    const resOct = await validateSafeHost('017700000001'); // 127.0.0.1
    assert.equal(resOct.isSafe, false);
  });

  // 2. URL Normalization & Scheme Hardening
  await test('URL Normalizer: blocks non-HTTP/HTTPS schemes', () => {
    const dangerous = ['file:///etc/passwd', 'ftp://server.com', 'gopher://127.0.0.1', 'javascript:alert(1)'];
    for (const url of dangerous) {
      const res = normalizeWebsiteUrl(url);
      assert.equal(res.isValid, false, `Expected ${url} to be rejected`);
      assert.equal(res.rejectReason, 'DISALLOWED_SCHEME');
    }
  });

  await test('URL Normalizer: accepts valid URLs and strips tracking parameters', () => {
    const res = normalizeWebsiteUrl('HTTP://Example.COM/services/?utm_source=ad&gclid=123#frag');
    assert.equal(res.isValid, true);
    assert.equal(res.domain, 'example.com');
    assert.equal(res.protocol, 'http');
    assert.equal(res.normalizedUrl.includes('utm_source'), false);
  });

  // 3. International Normalization & Phone
  await test('International: RTL language detection', () => {
    assert.equal(isRtlText('مرحبا بكم في مطعم دبي'), true); // Arabic
    assert.equal(isRtlText('لاہور میں ڈاکٹر کا کلینک'), true); // Urdu
    assert.equal(isRtlText('Dental Clinic in London'), false); // English
  });

  await test('International: Phone normalization', () => {
    const res = normalizePhoneNumber('+1 (212) 555-0199');
    assert.equal(res.e164, '+12125550199');
    assert.equal(res.countryCode, '+1');
  });

  // 4. Industry Taxonomy & Classification
  await test('Industry Engine: classifies diverse verticals accurately', () => {
    const indDental = classifyBusinessIndustry('Smile Orthodontics', 'dentist', ['dentist', 'health']);
    assert.equal(indDental.code, 'dental_medical');
    assert.ok(indDental.essentialFeatures.includes('Practice Areas & Treatments'));

    const indRest = classifyBusinessIndustry('Pizzeria Roma', 'restaurant', ['restaurant', 'food']);
    assert.equal(indRest.code, 'restaurant');
    assert.ok(indRest.essentialFeatures.includes('Digital Menu'));

    const indLaw = classifyBusinessIndustry('Smith Legal Counsel', 'lawyer', ['lawyer']);
    assert.equal(indLaw.code, 'legal');
    assert.ok(indLaw.essentialFeatures.includes('Consultation Request Form'));
  });

  // 5. Deduplication
  await test('Deduplication: matches on Place ID and prevents duplicates', () => {
    const match = findExistingBusiness({
      placeId: 'test_place_example_1',
      name: 'Any Random Name',
    });
    assert.equal(match.matchFound, true);
    assert.equal(match.matchTier, 1);
  });

  await test('Deduplication: keeps uncertain distinct names separate', () => {
    const match = findExistingBusiness({
      name: 'Unseen Unique Dental Service 999',
      formattedAddress: '999 North Blvd, Austin, TX, USA',
    });
    assert.equal(match.matchFound, false);
  });

  // 6. Lead CRM Persistence & Stage Transitions
  await test('Lead CRM: records and updates stages without destroying history', () => {
    const biz = db.getBusinesses()[0];
    assert.ok(biz, 'Expected at least one business in db');

    const leadId = 'test_unit_lead_crm';
    db.upsertLead({
      id: leadId,
      businessId: biz.id,
      status: 'NEW',
      priority: 'HIGH',
      tags: ['test'],
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalInteractions: 0,
    });

    db.addLeadNote({
      id: 'test_note_1',
      leadId,
      author: 'Tester',
      content: 'Initial assessment complete.',
      createdAt: new Date().toISOString(),
    });

    db.addLeadContact({
      id: 'test_cnt_1',
      leadId,
      businessId: biz.id,
      date: '2026-09-29',
      time: '12:00',
      method: 'phone',
      notes: 'Initial outreach call',
      outcome: 'INTERESTED',
      loggedAt: new Date().toISOString(),
    });

    const lead = db.getLeadById(leadId);
    assert.ok(lead);
    lead.status = 'PROPOSAL';
    db.upsertLead(lead);

    const notes = db.getNotesForLead(leadId);
    const contacts = db.getContactsForLead(leadId);

    assert.equal(db.getLeadById(leadId)?.status, 'PROPOSAL');
    assert.equal(notes.length, 1);
    assert.equal(contacts.length, 1);
  });

  // 7. Provider Failure Isolation
  await test('Provider Isolation: Google Places unconfigured returns safe status without throwing', async () => {
    // With no active key
    const res = await googlePlacesProvider.searchBusinesses({ query: 'test query' });
    assert.ok(res.error || res.places.length === 0);
    assert.equal(Array.isArray(res.places), true);
  });

  await test('Provider Isolation: YouTube unconfigured returns NOT_CHECKED without faking channels', async () => {
    const res = await youtubeProvider.searchChannel('Test Business', 'Chicago');
    assert.equal(res.status, 'NOT_CHECKED');
    assert.equal(res.channelId, undefined);
  });

  console.log(`\n--- TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
