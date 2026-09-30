/**
 * Opportunity Ingestion Engine
 * Handles background automated collection, rate-limiting, retries, and scheduled syncs.
 */

import { opportunityStore } from './opportunityStore.ts';
import { IngestionLog } from './types.ts';

export class IngestionEngine {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  public start() {
    if (this.timer) return;
    // Check every 3 minutes in background
    this.timer = setInterval(() => {
      this.checkAndRunPendingSync();
    }, 180000);
    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
    console.log('[IngestionEngine] Background sync worker initialized.');
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async triggerManualSync(connectorId?: string): Promise<IngestionLog> {
    return opportunityStore.triggerIngestionSync(connectorId);
  }

  private checkAndRunPendingSync() {
    if (this.isRunning) return;
    const now = Date.now();
    const connectors = opportunityStore.getConnectors();

    const dueConnectors = connectors.filter((c) => {
      if (!c.enabled) return false;
      if (!c.nextRunAt) return true;
      return new Date(c.nextRunAt).getTime() <= now;
    });

    if (dueConnectors.length > 0) {
      this.isRunning = true;
      try {
        dueConnectors.forEach((conn) => {
          opportunityStore.triggerIngestionSync(conn.id);
        });
      } catch (e) {
        console.error('[IngestionEngine] Error running scheduled sync:', e);
      } finally {
        this.isRunning = false;
      }
    }
  }
}

export const ingestionEngine = new IngestionEngine();
ingestionEngine.start();
