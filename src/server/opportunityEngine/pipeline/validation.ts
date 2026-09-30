/**
 * Data Pipeline: Validation, Expiration & Stale Detection
 * Implements Opportunity Lifecycle State Machine:
 * DISCOVERED → VERIFIED → OPEN → DEADLINE_APPROACHING → CLOSED → ARCHIVED
 */

import { StructuredOpportunity, OpportunityLifecycleStatus, OpportunityStatus } from '../types.ts';

export function validateOpportunity(opp: Partial<StructuredOpportunity>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!opp.title || opp.title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters');
  }
  if (!opp.organizationName || opp.organizationName.trim().length < 2) {
    errors.push('Organization name is required');
  }
  if (!opp.applicationUrl && !opp.sourceUrl) {
    errors.push('Either application URL or source URL must be provided');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function evaluateOpportunityStatus(
  deadline?: string,
  currentStatus: OpportunityStatus = 'OPEN'
): OpportunityLifecycleStatus {
  if (currentStatus === 'ARCHIVED') return 'ARCHIVED';

  if (!deadline) {
    if (currentStatus === 'DISCOVERED' || currentStatus === 'VERIFIED') {
      return currentStatus;
    }
    return currentStatus === 'ACTIVE' ? ('OPEN' as any) : 'OPEN';
  }

  try {
    const deadlineTime = new Date(deadline).getTime();
    const now = Date.now();

    if (!isNaN(deadlineTime)) {
      if (deadlineTime < now) {
        return (currentStatus === 'ACTIVE' || currentStatus === 'EXPIRED') ? 'EXPIRED' : 'CLOSED';
      }

      // If within 14 days
      const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
      if (deadlineTime - now <= fourteenDaysMs) {
        return 'DEADLINE_APPROACHING';
      }

      if (currentStatus === 'ACTIVE') return 'ACTIVE' as any;
      return 'OPEN';
    }
  } catch {
    // Keep current
  }

  return (currentStatus === 'ACTIVE' ? ('ACTIVE' as any) : currentStatus === 'CLOSED' ? 'CLOSED' : 'OPEN');
}

export function isOpportunityActive(status: OpportunityStatus): boolean {
  return status === 'OPEN' || status === 'DEADLINE_APPROACHING' || status === 'ACTIVE' || status === 'VERIFIED';
}
