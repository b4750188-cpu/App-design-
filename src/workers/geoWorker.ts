/**
 * Dedicated Geospatial Web Worker
 * Offloads expensive spatial clustering, viewport culling, and geographic chunk/tile calculations.
 */

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
  type: string;
  title: string;
  category?: string;
  extra?: any;
}

export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ClusterResult {
  clusters: {
    id: string;
    x: number;
    y: number;
    count: number;
    label: string;
    points: GeoPoint[];
  }[];
  discretePoints: (GeoPoint & { x: number; y: number })[];
  activeChunks: string[];
}

export function geoToCanvas(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 2000;
  const y = ((90 - lat) / 180) * 1000;
  return { x, y };
}

// 8 Geographic chunks for progressive tile loading
export const GEOGRAPHIC_CHUNKS: Record<string, { minX: number; maxX: number; minY: number; maxY: number }> = {
  chunk_na_north: { minX: 0, maxX: 750, minY: 0, maxY: 400 },
  chunk_na_south: { minX: 0, maxX: 750, minY: 400, maxY: 1000 },
  chunk_sa: { minX: 450, maxX: 950, minY: 450, maxY: 1000 },
  chunk_eu: { minX: 850, maxX: 1250, minY: 100, maxY: 450 },
  chunk_africa: { minX: 850, maxX: 1300, minY: 400, maxY: 850 },
  chunk_asia_west: { minX: 1150, maxX: 1550, minY: 200, maxY: 600 },
  chunk_asia_east: { minX: 1450, maxX: 2000, minY: 100, maxY: 600 },
  chunk_oceania: { minX: 1500, maxX: 2000, minY: 550, maxY: 1000 },
};

export function processSpatialClusters(
  points: GeoPoint[],
  bounds: ViewportBounds,
  zoom: number
): ClusterResult {
  // 1. Identify which geographic chunks intersect the viewport
  const activeChunks: string[] = [];
  for (const [chunkId, box] of Object.entries(GEOGRAPHIC_CHUNKS)) {
    const intersects = !(
      box.maxX < bounds.minX ||
      box.minX > bounds.maxX ||
      box.maxY < bounds.minY ||
      box.minY > bounds.maxY
    );
    if (intersects) {
      activeChunks.push(chunkId);
    }
  }

  // 2. Project points to canvas & cull outside viewport bounds with padding
  const projectedPoints = points
    .map((p) => {
      const { x, y } = geoToCanvas(p.lat, p.lng);
      return { ...p, x, y };
    })
    .filter((p) => {
      return (
        p.x >= bounds.minX - 60 &&
        p.x <= bounds.maxX + 60 &&
        p.y >= bounds.minY - 60 &&
        p.y <= bounds.maxY + 60
      );
    });

  // 3. If zoomed in (zoom >= 1.7), return discrete individual points
  if (zoom >= 1.7) {
    return {
      clusters: [],
      discretePoints: projectedPoints,
      activeChunks,
    };
  }

  // 4. Spatial Grid Clustering for low zoom (< 1.7)
  const clusterRadius = Math.max(45, 95 / Math.sqrt(zoom));
  const clusters: ClusterResult['clusters'] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < projectedPoints.length; i++) {
    const p1 = projectedPoints[i];
    if (assigned.has(p1.id)) continue;

    const clusterPoints: GeoPoint[] = [p1];
    assigned.add(p1.id);
    let sumX = p1.x;
    let sumY = p1.y;

    for (let j = i + 1; j < projectedPoints.length; j++) {
      const p2 = projectedPoints[j];
      if (assigned.has(p2.id)) continue;

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      if (dist <= clusterRadius) {
        clusterPoints.push(p2);
        assigned.add(p2.id);
        sumX += p2.x;
        sumY += p2.y;
      }
    }

    if (clusterPoints.length > 1) {
      clusters.push({
        id: `cluster_${p1.id}`,
        x: sumX / clusterPoints.length,
        y: sumY / clusterPoints.length,
        count: clusterPoints.length,
        label: p1.title.split(' ')[0],
        points: clusterPoints,
      });
    } else {
      clusters.push({
        id: `node_${p1.id}`,
        x: p1.x,
        y: p1.y,
        count: 1,
        label: p1.title,
        points: [p1],
      });
    }
  }

  return {
    clusters,
    discretePoints: [],
    activeChunks,
  };
}

// Web Worker message listener when running inside worker context
if (typeof self !== 'undefined' && typeof (self as any).postMessage === 'function' && typeof window === 'undefined') {
  self.onmessage = (e: MessageEvent) => {
    const { id, points, bounds, zoom } = e.data;
    const result = processSpatialClusters(points, bounds, zoom);
    (self as any).postMessage({ id, result });
  };
}
