/**
 * Data Pipeline: Deduplication & Change Tracking
 */

import { StructuredOpportunity, StructuredOrganization, StructuredPersona } from '../types.ts';
import { normalizeText, normalizeUrl } from './normalization.ts';

export function generateOpportunityFingerprint(opp: Partial<StructuredOpportunity>): string {
  const normUrl = normalizeUrl(opp.applicationUrl || opp.sourceUrl || '');
  const normTitle = normalizeText(opp.title || '');
  const normOrg = normalizeText(opp.organizationName || '');
  return `${normOrg}::${normTitle}::${normUrl}`;
}

export function generateOrgFingerprint(org: Partial<StructuredOrganization>): string {
  const normWeb = normalizeUrl(org.website || '');
  const normName = normalizeText(org.name || '');
  return `${normName}::${normWeb}`;
}

export function generatePersonaFingerprint(p: Partial<StructuredPersona>): string {
  const normName = normalizeText(p.name || '');
  const normOrg = normalizeText(p.organizationName || '');
  const normRole = normalizeText(p.roleTitle || '');
  return `${normName}::${normOrg}::${normRole}`;
}

export function isDuplicateOpportunity(
  candidate: Partial<StructuredOpportunity>,
  existingList: StructuredOpportunity[]
): StructuredOpportunity | undefined {
  const candidateFp = generateOpportunityFingerprint(candidate);
  const candidateUrl = normalizeUrl(candidate.applicationUrl || candidate.sourceUrl || '');

  return existingList.find((item) => {
    if (candidateUrl && candidateUrl === normalizeUrl(item.applicationUrl || item.sourceUrl || '')) {
      return true;
    }
    const itemFp = generateOpportunityFingerprint(item);
    return itemFp === candidateFp;
  });
}
