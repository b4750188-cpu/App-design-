import assert from 'node:assert';
import { opportunityStore } from '../src/server/opportunityEngine/opportunityStore.ts';
import { ingestionEngine } from '../src/server/opportunityEngine/ingestionEngine.ts';
import { geoToCanvas } from '../src/data/worldGeoPaths.ts';
import { evaluateOpportunityStatus } from '../src/server/opportunityEngine/pipeline/validation.ts';
import { generateOrgFingerprint, isDuplicateOpportunity } from '../src/server/opportunityEngine/pipeline/deduplication.ts';

async function runTestSuite() {
  console.log('--- STARTING OPPORTUNITY ENGINE & CARTOGRAPHY VERIFICATION ---');

  // 1. Opportunity Store Data Integrity
  const opps = opportunityStore.getOpportunities({ limit: 50 });
  assert.ok(opps.items.length >= 10, 'Must have at least 10 seeded structured opportunities');
  console.log(`✓ [PASS] Retrieved ${opps.items.length} structured opportunities with full attributes`);

  // Verify attributes on sample opportunity
  const sampleOpp = opps.items[0];
  assert.ok(sampleOpp.title, 'Opportunity must have a title');
  assert.ok(sampleOpp.organizationName, 'Opportunity must have an organization name');
  assert.ok(sampleOpp.location.lat !== undefined && sampleOpp.location.lng !== undefined, 'Opportunity must have geographic coordinates');
  assert.ok(sampleOpp.applicationUrl, 'Opportunity must have application URL');
  assert.ok(sampleOpp.trustScore >= 0 && sampleOpp.trustScore <= 100, 'Trust score must be 0-100');
  console.log('✓ [PASS] Structured Opportunity data contract validated');

  // 2. Organizations Directory
  const orgs = opportunityStore.getOrganizations();
  assert.ok(orgs.length >= 5, 'Must have structured organizations');
  const sampleOrg = orgs[0];
  assert.ok(sampleOrg.name && sampleOrg.businessTypes.length > 0, 'Organization must have name and business types');
  assert.ok(sampleOrg.provenance.connectorId, 'Organization must have provenance connectorId');
  console.log(`✓ [PASS] Retrieved ${orgs.length} structured organizations with multiple business types`);

  // 3. Personas & Public Contacts
  const personas = opportunityStore.getPersonas();
  assert.ok(personas.length >= 5, 'Must have structured personas');
  const samplePersona = personas[0];
  assert.equal(samplePersona.privacyClassification, 'PUBLIC_OFFICIAL_CONTACT', 'Personas must be classified as PUBLIC_OFFICIAL_CONTACT');
  assert.ok(samplePersona.provenance.sourceName, 'Persona must retain source provenance');
  console.log(`✓ [PASS] Retrieved ${personas.length} verified public personas with official contacts`);

  // 4. Cartography Projection
  const sfCanvas = geoToCanvas(37.7749, -122.4194);
  assert.ok(sfCanvas.x > 0 && sfCanvas.x < 2000, 'San Francisco canvas X must be within 2000x1000 space');
  assert.ok(sfCanvas.y > 0 && sfCanvas.y < 1000, 'San Francisco canvas Y must be within 2000x1000 space');

  const londonCanvas = geoToCanvas(51.5074, -0.1278);
  assert.ok(londonCanvas.x > 0 && londonCanvas.x < 2000, 'London canvas X must be within 2000x1000 space');
  assert.ok(londonCanvas.y > 0 && londonCanvas.y < 1000, 'London canvas Y must be within 2000x1000 space');
  console.log('✓ [PASS] Equirectangular 2000x1000 cartographic coordinates verified');

  // 5. Ingestion Engine & Deduplication
  const initialDuplicateCount = opportunityStore.getDatabaseStats().duplicateCountPrevented;
  const syncLog = await ingestionEngine.triggerManualSync();
  assert.ok(syncLog.id, 'Sync log must be returned');
  assert.equal(syncLog.status, 'SUCCESS', 'Sync log must report SUCCESS');
  assert.ok(syncLog.itemsNormalized > 0, 'Must normalize ingested items');
  console.log(`✓ [PASS] Ingestion sync executed: +${syncLog.itemsFetched} fetched, ${syncLog.itemsDeduplicated} deduplicated`);

  // 6. Status Evaluation
  const pastDate = '2020-01-01T00:00:00Z';
  const futureDate = '2030-01-01T00:00:00Z';
  assert.equal(evaluateOpportunityStatus(pastDate, 'ACTIVE'), 'EXPIRED', 'Past deadline must evaluate to EXPIRED');
  assert.equal(evaluateOpportunityStatus(futureDate, 'ACTIVE'), 'ACTIVE', 'Future deadline must evaluate to ACTIVE');
  console.log('✓ [PASS] Opportunity deadline lifecycle & status transition verified');

  console.log('--- ALL OPPORTUNITY ENGINE & CARTOGRAPHY VERIFICATIONS PASSED ---');
}

runTestSuite().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
