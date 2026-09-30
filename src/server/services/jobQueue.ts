/**
 * Background Scan Job & Queue Manager
 * Processes batch discovery, audits, and social lookups asynchronously
 * Prevents blocking HTTP connections, tracks job progress, and handles errors
 */

import crypto from 'crypto';
import { ScanJob, ScanItem, ScanError, JobStatus } from '../types.ts';
import { db } from '../db/storage.ts';

export class BackgroundJobQueue {
  private activeJobId: string | null = null;
  private isProcessing = false;

  public createJob(searchQuery: ScanJob['searchQuery']): ScanJob {
    const job: ScanJob = {
      id: `job_${crypto.randomUUID()}`,
      searchQuery,
      status: 'QUEUED',
      totalItems: searchQuery.quantityRequested,
      processedItems: 0,
      successItems: 0,
      errorItems: 0,
      startedAt: new Date().toISOString(),
    };

    db.upsertScanJob(job);
    return job;
  }

  public getJob(jobId: string): { job: ScanJob | undefined; items: ScanItem[]; errors: ScanError[] } {
    const job = db.getScanJob(jobId);
    const items = db.getScanItems(jobId);
    const errors = db.getScanErrors(jobId);
    return { job, items, errors };
  }

  public updateJobProgress(
    jobId: string,
    update: {
      status?: JobStatus;
      processedIncrement?: number;
      successIncrement?: number;
      errorIncrement?: number;
      finished?: boolean;
    }
  ) {
    const job = db.getScanJob(jobId);
    if (!job) return;

    if (update.status) job.status = update.status;
    if (update.processedIncrement) job.processedItems += update.processedIncrement;
    if (update.successIncrement) job.successItems += update.successIncrement;
    if (update.errorIncrement) job.errorItems += update.errorIncrement;
    if (update.finished) {
      job.finishedAt = new Date().toISOString();
      if (job.status === 'RUNNING') {
        job.status = job.errorItems > 0 && job.successItems > 0 ? 'PARTIAL' : job.errorItems > 0 ? 'FAILED' : 'COMPLETED';
      }
    }

    db.upsertScanJob(job);
  }
}

export const jobQueue = new BackgroundJobQueue();
