/**
 * Client-Side Geospatial Worker Client
 * Seamlessly manages the Web Worker thread for clustering and chunking,
 * falling back to optimized synchronous execution when Workers are unavailable.
 */

import {
  GeoPoint,
  ViewportBounds,
  ClusterResult,
  processSpatialClusters,
} from '../workers/geoWorker';

class GeoWorkerManager {
  private worker: Worker | null = null;
  private requestId = 0;
  private pendingCallbacks = new Map<number, (res: ClusterResult) => void>();

  constructor() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker(new URL('../workers/geoWorker.ts', import.meta.url), {
          type: 'module',
        });
        this.worker.onmessage = (e: MessageEvent) => {
          const { id, result } = e.data;
          const cb = this.pendingCallbacks.get(id);
          if (cb) {
            cb(result);
            this.pendingCallbacks.delete(id);
          }
        };
      } catch {
        // Fallback to direct thread if worker construction restricted by environment
        this.worker = null;
      }
    }
  }

  public computeClusters(
    points: GeoPoint[],
    bounds: ViewportBounds,
    zoom: number
  ): Promise<ClusterResult> {
    if (this.worker) {
      return new Promise<ClusterResult>((resolve) => {
        const id = ++this.requestId;
        this.pendingCallbacks.set(id, resolve);
        this.worker!.postMessage({ id, points, bounds, zoom });
      });
    }

    // Synchronous execution
    return Promise.resolve(processSpatialClusters(points, bounds, zoom));
  }
}

export const geoWorkerClient = new GeoWorkerManager();
