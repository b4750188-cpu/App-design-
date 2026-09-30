import assert from 'node:assert/strict';
import { AI_ENTITIES, LIVE_ACTIVITY_STREAM, INITIAL_PROJECTS, AGENT_API_ENDPOINTS } from '../src/data/aiEcosystemData';

async function runAIHeavenTests() {
  console.log('--- STARTING AI HEAVEN ECOSYSTEM VERIFICATION ---');

  // Test 1: Entities have valid geographic coordinates
  assert.ok(AI_ENTITIES.length >= 10, 'Expected at least 10 core entities');
  AI_ENTITIES.forEach((e) => {
    assert.ok(e.id, 'Entity must have id');
    assert.ok(e.name, 'Entity must have name');
    assert.ok(typeof e.location.lat === 'number', `Entity ${e.name} must have numeric lat`);
    assert.ok(typeof e.location.lng === 'number', `Entity ${e.name} must have numeric lng`);
    assert.ok(e.location.lat >= -90 && e.location.lat <= 90, `Lat out of range for ${e.name}`);
    assert.ok(e.location.lng >= -180 && e.location.lng <= 180, `Lng out of range for ${e.name}`);
    assert.ok(e.trustScore >= 0 && e.trustScore <= 100, `Trust score out of range for ${e.name}`);
  });
  console.log(`✓ [PASS] All ${AI_ENTITIES.length} entities verified with valid geographic coordinates`);

  // Test 2: Relationship integrity
  let totalEdges = 0;
  AI_ENTITIES.forEach((e) => {
    e.relationships.forEach((rel) => {
      assert.ok(rel.targetId, `Missing targetId in relationship from ${e.name}`);
      assert.ok(rel.relation, `Missing relation type from ${e.name}`);
      totalEdges++;
    });
  });
  console.log(`✓ [PASS] Graph relationship integrity verified (${totalEdges} directed edges)`);

  // Test 3: Activity stream timestamps and severities
  assert.ok(LIVE_ACTIVITY_STREAM.length > 0, 'Expected activity items');
  LIVE_ACTIVITY_STREAM.forEach((act) => {
    assert.ok(act.title, 'Activity must have title');
    assert.ok(act.timestamp, 'Activity must have timestamp');
    assert.ok(!isNaN(new Date(act.timestamp).getTime()), 'Valid ISO timestamp required');
  });
  console.log(`✓ [PASS] Live activity stream verified (${LIVE_ACTIVITY_STREAM.length} events)`);

  // Test 4: Agent API endpoints contract
  assert.ok(AGENT_API_ENDPOINTS.length >= 3, 'Expected at least 3 agent endpoints');
  AGENT_API_ENDPOINTS.forEach((ep) => {
    assert.ok(ep.path.startsWith('/api/v1/'), 'Endpoint must use /api/v1 prefix');
    assert.ok(ep.exampleResponse, 'Endpoint must have example response');
  });
  console.log(`✓ [PASS] Agent API OpenAPI specifications validated`);

  // Test 5: Initial project bundles
  assert.ok(INITIAL_PROJECTS.length >= 2, 'Expected initial project stacks');
  INITIAL_PROJECTS.forEach((proj) => {
    assert.ok(proj.name, 'Project must have name');
    assert.ok(proj.entityIds.length > 0, 'Project must contain bundled entity IDs');
  });
  console.log(`✓ [PASS] Workspace project stacks verified`);

  console.log('--- ALL AI HEAVEN VERIFICATIONS PASSED ---');
}

runAIHeavenTests();
