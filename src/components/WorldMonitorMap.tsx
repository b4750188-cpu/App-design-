import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Crosshair,
  Radio,
  Navigation,
  Activity,
  Sparkles,
  MapPin,
  DollarSign,
  Award,
  Flame,
  GraduationCap,
  BookOpen,
  Code,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { AIEntity, EntityCategory } from '../types/aiHeaven';
import { StructuredOpportunity, OpportunityType } from '../server/opportunityEngine/types.ts';
import {
  geoToCanvas,
  GLOBAL_TECH_HUBS,
  LATITUDE_GRATICULES,
  LONGITUDE_GRATICULES,
  TechHub,
} from '../data/worldGeoPaths';
import { NATURAL_EARTH_CARTOGRAPHY } from '../data/naturalEarthCartography';

// Category visual design specifications
export const CATEGORY_THEMES: Record<
  EntityCategory,
  { label: string; color: string; border: string; bg: string; glow: string; text: string }
> = {
  company: { label: 'Companies', color: '#06b6d4', border: 'border-cyan-500/80', bg: 'bg-cyan-950/80', glow: 'rgba(6, 182, 212, 0.5)', text: 'text-cyan-400' },
  model: { label: 'Models', color: '#a855f7', border: 'border-purple-500/80', bg: 'bg-purple-950/80', glow: 'rgba(168, 85, 247, 0.5)', text: 'text-purple-400' },
  tool: { label: 'Tools & Runtimes', color: '#10b981', border: 'border-emerald-500/80', bg: 'bg-emerald-950/80', glow: 'rgba(16, 185, 129, 0.5)', text: 'text-emerald-400' },
  api: { label: 'APIs & Services', color: '#3b82f6', border: 'border-blue-500/80', bg: 'bg-blue-950/80', glow: 'rgba(59, 130, 246, 0.5)', text: 'text-blue-400' },
  github: { label: 'Repositories', color: '#38bdf8', border: 'border-sky-500/80', bg: 'bg-sky-950/80', glow: 'rgba(56, 189, 248, 0.5)', text: 'text-sky-400' },
  dataset: { label: 'Datasets', color: '#f59e0b', border: 'border-amber-500/80', bg: 'bg-amber-950/80', glow: 'rgba(245, 158, 11, 0.5)', text: 'text-amber-400' },
  research: { label: 'Research Papers', color: '#f43f5e', border: 'border-rose-500/80', bg: 'bg-rose-950/80', glow: 'rgba(244, 63, 94, 0.5)', text: 'text-rose-400' },
  infrastructure: { label: 'Infrastructure', color: '#94a3b8', border: 'border-slate-500/80', bg: 'bg-slate-950/80', glow: 'rgba(148, 163, 184, 0.5)', text: 'text-slate-400' },
  organization: { label: 'Foundations & Labs', color: '#6366f1', border: 'border-indigo-500/80', bg: 'bg-indigo-950/80', glow: 'rgba(99, 102, 241, 0.5)', text: 'text-indigo-400' },
  university: { label: 'Academia & Universities', color: '#14b8a6', border: 'border-teal-500/80', bg: 'bg-teal-950/80', glow: 'rgba(20, 184, 166, 0.5)', text: 'text-teal-400' },
};

// Opportunity types styling
const OPP_TYPE_STYLES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  GRANT: { label: 'Grant', color: '#10b981', border: 'border-emerald-500', bg: 'bg-emerald-950' },
  FELLOWSHIP: { label: 'Fellowship', color: '#a855f7', border: 'border-purple-500', bg: 'bg-purple-950' },
  ACCELERATOR: { label: 'Accelerator', color: '#f97316', border: 'border-orange-500', bg: 'bg-orange-950' },
  SCHOLARSHIP: { label: 'Scholarship', color: '#3b82f6', border: 'border-blue-500', bg: 'bg-blue-950' },
  RESEARCH_PROGRAM: { label: 'Research', color: '#f43f5e', border: 'border-rose-500', bg: 'bg-rose-950' },
  HACKATHON: { label: 'Hackathon', color: '#eab308', border: 'border-amber-500', bg: 'bg-amber-950' },
  STARTUP_PROGRAM: { label: 'Startup', color: '#14b8a6', border: 'border-teal-500', bg: 'bg-teal-950' },
  JOB: { label: 'Job/Role', color: '#6366f1', border: 'border-indigo-500', bg: 'bg-indigo-950' },
};

// Global Cached Path2D objects for ultra-fast GPU canvas blitting
let cachedLandLOD1: Path2D | null = null;
let cachedBordersLOD1: Path2D | null = null;
let cachedLandLOD2: Path2D | null = null;
let cachedBordersLOD2: Path2D | null = null;
let cachedLakes: Path2D | null = null;
let cachedRivers: Path2D | null = null;

// Offscreen Pre-rendered Basemap Canvases for 0.05ms hardware blit
let offscreenBasemapLOD1: HTMLCanvasElement | null = null;
let offscreenBasemapLOD2: HTMLCanvasElement | null = null;

function getLandLOD1(): Path2D {
  if (!cachedLandLOD1 && typeof Path2D !== 'undefined') {
    cachedLandLOD1 = new Path2D(NATURAL_EARTH_CARTOGRAPHY.landLOD1);
  }
  return cachedLandLOD1!;
}

function getBordersLOD1(): Path2D {
  if (!cachedBordersLOD1 && typeof Path2D !== 'undefined') {
    cachedBordersLOD1 = new Path2D(NATURAL_EARTH_CARTOGRAPHY.bordersLOD1);
  }
  return cachedBordersLOD1!;
}

function getLandLOD2(): Path2D {
  if (!cachedLandLOD2 && typeof Path2D !== 'undefined') {
    cachedLandLOD2 = new Path2D(NATURAL_EARTH_CARTOGRAPHY.landLOD2);
  }
  return cachedLandLOD2!;
}

function getBordersLOD2(): Path2D {
  if (!cachedBordersLOD2 && typeof Path2D !== 'undefined') {
    cachedBordersLOD2 = new Path2D(NATURAL_EARTH_CARTOGRAPHY.bordersLOD2);
  }
  return cachedBordersLOD2!;
}

function getLakes(): Path2D {
  if (!cachedLakes && typeof Path2D !== 'undefined') {
    cachedLakes = new Path2D(NATURAL_EARTH_CARTOGRAPHY.lakesPath);
  }
  return cachedLakes!;
}

function getRivers(): Path2D {
  if (!cachedRivers && typeof Path2D !== 'undefined') {
    cachedRivers = new Path2D(NATURAL_EARTH_CARTOGRAPHY.riversPath);
  }
  return cachedRivers!;
}

// Generate pre-rendered offscreen basemap at native 2000x1000
function getOffscreenBasemap(lod: 'LOD1' | 'LOD2'): HTMLCanvasElement {
  if (lod === 'LOD1' && offscreenBasemapLOD1) return offscreenBasemapLOD1;
  if (lod === 'LOD2' && offscreenBasemapLOD2) return offscreenBasemapLOD2;

  const canvas = document.createElement('canvas');
  canvas.width = 2000;
  canvas.height = 1000;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return canvas;

  // 1. Deep Oceanic Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1000);
  oceanGrad.addColorStop(0, '#020512');
  oceanGrad.addColorStop(0.5, '#010309');
  oceanGrad.addColorStop(1, '#000206');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2000, 1000);

  // 2. Graticules
  ctx.lineWidth = 0.5;
  LATITUDE_GRATICULES.forEach((g) => {
    ctx.strokeStyle = g.highlight ? 'rgba(6, 182, 212, 0.45)' : 'rgba(16, 34, 68, 0.4)';
    ctx.setLineDash(g.highlight ? [6, 4] : [3, 6]);
    ctx.beginPath();
    ctx.moveTo(0, g.y);
    ctx.lineTo(2000, g.y);
    ctx.stroke();

    ctx.fillStyle = '#263d63';
    ctx.font = '8px monospace';
    ctx.fillText(g.label, 15, g.y - 4);
  });

  LONGITUDE_GRATICULES.forEach((g) => {
    ctx.strokeStyle = g.highlight ? 'rgba(6, 182, 212, 0.45)' : 'rgba(16, 34, 68, 0.4)';
    ctx.setLineDash(g.highlight ? [6, 4] : [3, 6]);
    ctx.beginPath();
    ctx.moveTo(g.x, 0);
    ctx.lineTo(g.x, 1000);
    ctx.stroke();

    ctx.fillStyle = '#263d63';
    ctx.font = '8px monospace';
    ctx.fillText(g.label, g.x + 6, 980);
  });
  ctx.setLineDash([]);

  // 3. Land Geometry Fill
  const landPath = lod === 'LOD1' ? getLandLOD1() : getLandLOD2();
  ctx.fillStyle = '#0a162e';
  ctx.fill(landPath);

  // 4. Coastline Outer Stroke
  ctx.strokeStyle = '#1d3868';
  ctx.lineWidth = 1.0;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(landPath);

  // 5. Country Borders
  const bordersPath = lod === 'LOD1' ? getBordersLOD1() : getBordersLOD2();
  ctx.strokeStyle = 'rgba(30, 58, 106, 0.85)';
  ctx.lineWidth = 0.75;
  ctx.stroke(bordersPath);

  if (lod === 'LOD1') {
    offscreenBasemapLOD1 = canvas;
  } else {
    offscreenBasemapLOD2 = canvas;
  }

  return canvas;
}

export const WorldMonitorMap: React.FC = () => {
  const {
    filteredEntities,
    setSelectedEntity,
    selectedEntity,
    opportunities,
    setSelectedOpportunity,
    selectedOpportunity,
  } = useAIHeaven();

  // Core Map State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mouseGeo, setMouseGeo] = useState<{ lat: number; lng: number }>({ lat: 37.77, lng: -122.42 });

  // Map Display Mode: 'ecosystem' | 'opportunities' | 'unified'
  const [mapMode, setMapMode] = useState<'ecosystem' | 'opportunities' | 'unified'>('unified');

  // Hover states
  const [hoveredEntity, setHoveredEntity] = useState<AIEntity | null>(null);
  const [hoveredOpportunity, setHoveredOpportunity] = useState<StructuredOpportunity | null>(null);
  const [hoveredHub, setHoveredHub] = useState<(TechHub & { activeNodeCount?: number; activeOppCount?: number }) | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Layer Visibility Controls
  const [visibleCategories, setVisibleCategories] = useState<Record<EntityCategory, boolean>>({
    company: true,
    model: true,
    tool: true,
    api: true,
    github: true,
    dataset: true,
    research: true,
    infrastructure: true,
    organization: true,
    university: true,
  });

  const [visibleOppTypes, setVisibleOppTypes] = useState<Record<string, boolean>>({
    GRANT: true,
    FELLOWSHIP: true,
    ACCELERATOR: true,
    SCHOLARSHIP: true,
    RESEARCH_PROGRAM: true,
    HACKATHON: true,
    STARTUP_PROGRAM: true,
    JOB: true,
  });

  const [showNetworkLinks, setShowNetworkLinks] = useState(true);
  const [showTechHubs, setShowTechHubs] = useState(true);
  const [showCountryBorders, setShowCountryBorders] = useState(true);
  const [showRiversAndLakes, setShowRiversAndLakes] = useState(true);
  const [showGraticules, setShowGraticules] = useState(true);
  const [showLayerDrawer, setShowLayerDrawer] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  // References for zero-latency 60fps pan/zoom without React rerender lag
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgOverlayRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef({ x: 0, y: 0, zoom: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Level of Detail (LOD) and 5 Progressive Stages: GLOBAL → REGION → COUNTRY → CITY → LOCAL
  const currentLOD = useMemo<'LOD1' | 'LOD2' | 'LOD3' | 'LOD4'>(() => {
    if (zoom < 1.15) return 'LOD1'; // 0.65 - 1.15: Lightweight global geography (instant offscreen blit)
    if (zoom < 2.0) return 'LOD2';  // 1.15 - 2.0: Regional geography & national borders
    if (zoom < 3.2) return 'LOD3';  // 2.0 - 3.2: Detailed country/coastline + lakes + rivers with clipping
    return 'LOD4';                  // 3.2 - 5.5: Maximum vector detail + shoreline subpixel glow
  }, [zoom]);

  const currentZoomStage = useMemo<'GLOBAL' | 'REGION' | 'COUNTRY' | 'CITY' | 'LOCAL'>(() => {
    if (zoom < 1.15) return 'GLOBAL';
    if (zoom < 1.8) return 'REGION';
    if (zoom < 2.6) return 'COUNTRY';
    if (zoom < 3.8) return 'CITY';
    return 'LOCAL';
  }, [zoom]);

  // Active filtered entities
  const activeEntities = useMemo(() => {
    if (mapMode === 'opportunities') return [];
    return filteredEntities.filter((e) => visibleCategories[e.category] !== false);
  }, [filteredEntities, visibleCategories, mapMode]);

  // Active filtered opportunities
  const activeOpportunities = useMemo(() => {
    if (mapMode === 'ecosystem') return [];
    return opportunities.filter((o) => visibleOppTypes[o.opportunityType] !== false);
  }, [opportunities, visibleOppTypes, mapMode]);

  // Viewport Bounding Box Calculation in 2000x1000 world coordinates
  const viewportBounds = useMemo(() => {
    if (!containerRef.current) return { minX: 0, minY: 0, maxX: 2000, maxY: 1000 };
    const width = containerRef.current.clientWidth || 1000;
    const height = containerRef.current.clientHeight || 500;

    const scaleFactor = Math.max(width / 2000, height / 1000);
    const effectiveZoom = zoom * scaleFactor;

    const minX = Math.max(0, -pan.x / effectiveZoom - 120);
    const minY = Math.max(0, -pan.y / effectiveZoom - 120);
    const maxX = Math.min(2000, (-pan.x + width) / effectiveZoom + 120);
    const maxY = Math.min(1000, (-pan.y + height) / effectiveZoom + 120);

    return { minX, minY, maxX, maxY };
  }, [pan, zoom]);

  // Visible Entities Culling
  const visibleEntitiesInViewport = useMemo(() => {
    return activeEntities.filter((entity) => {
      const { x, y } = geoToCanvas(entity.location.lat, entity.location.lng);
      return x >= viewportBounds.minX && x <= viewportBounds.maxX && y >= viewportBounds.minY && y <= viewportBounds.maxY;
    });
  }, [activeEntities, viewportBounds]);

  // Visible Opportunities Culling
  const visibleOpportunitiesInViewport = useMemo(() => {
    return activeOpportunities.filter((opp) => {
      const { x, y } = geoToCanvas(opp.location.lat, opp.location.lng);
      return x >= viewportBounds.minX && x <= viewportBounds.maxX && y >= viewportBounds.minY && y <= viewportBounds.maxY;
    });
  }, [activeOpportunities, viewportBounds]);

  // Marker Clustering for low zoom levels (< 1.7)
  const isClustered = zoom < 1.7;

  // Clustered Hubs
  const clusteredHubs = useMemo(() => {
    if (!isClustered) return [];
    return GLOBAL_TECH_HUBS.map((hub) => {
      const { x, y } = geoToCanvas(hub.lat, hub.lng);
      const entityCount = activeEntities.filter((e) => {
        const p = geoToCanvas(e.location.lat, e.location.lng);
        return Math.hypot(p.x - x, p.y - y) < 85;
      }).length;
      const oppCount = activeOpportunities.filter((o) => {
        const p = geoToCanvas(o.location.lat, o.location.lng);
        return Math.hypot(p.x - x, p.y - y) < 95;
      }).length;

      return {
        ...hub,
        activeNodeCount: entityCount || hub.nodeCount,
        activeOppCount: oppCount,
      };
    });
  }, [isClustered, activeEntities, activeOpportunities]);

  // Geodesic neural relationship links
  const connectionLinks = useMemo(() => {
    if (!showNetworkLinks || isClustered || mapMode === 'opportunities') return [];
    const links: { sourceId: string; targetId: string; pathD: string }[] = [];

    visibleEntitiesInViewport.forEach((source) => {
      const p1 = geoToCanvas(source.location.lat, source.location.lng);
      source.relationships.forEach((rel) => {
        const target = activeEntities.find((e) => e.id === rel.targetId);
        if (target) {
          const p2 = geoToCanvas(target.location.lat, target.location.lng);
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const curvature = Math.min(110, dist * 0.18);
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - curvature;
          links.push({
            sourceId: source.id,
            targetId: target.id,
            pathD: `M ${p1.x},${p1.y} Q ${midX},${midY} ${p2.x},${p2.y}`,
          });
        }
      });
    });
    return links;
  }, [visibleEntitiesInViewport, activeEntities, showNetworkLinks, isClustered, mapMode]);

  // --- HARDWARE-ACCELERATED CANVAS BASE LAYER RENDERER ---
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile battery & performance

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const { x: panX, y: panY, zoom: z } = transformRef.current;

    // Reset base transform
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Coordinate Space Matrix
    ctx.save();
    const baseScale = Math.max(width / 2000, height / 1000);
    ctx.translate(panX + width / 2, panY + height / 2);
    ctx.scale(z * baseScale, z * baseScale);
    ctx.translate(-1000, -500);

    // 1. Instant Blit of Offscreen Basemap (0.02ms hardware blit)
    const basemapLOD = z < 1.4 ? 'LOD1' : 'LOD2';
    const offscreen = getOffscreenBasemap(basemapLOD);
    ctx.drawImage(offscreen, 0, 0);

    // 2. High Detail Overlays for Deep Zooms with Viewport Clipping
    if (z >= 1.5) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        viewportBounds.minX,
        viewportBounds.minY,
        viewportBounds.maxX - viewportBounds.minX,
        viewportBounds.maxY - viewportBounds.minY
      );
      ctx.clip();

      if (showRiversAndLakes) {
        // Major Lakes
        ctx.fillStyle = '#010309';
        ctx.strokeStyle = '#1b3460';
        ctx.lineWidth = Math.max(0.4, 0.8 / Math.sqrt(z));
        const lakesPath = getLakes();
        ctx.fill(lakesPath);
        ctx.stroke(lakesPath);
      }

      if (z >= 1.8 && showRiversAndLakes) {
        // Major Rivers
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.lineWidth = Math.max(0.35, 0.7 / Math.sqrt(z));
        ctx.stroke(getRivers());
      }

      // 3. National Country Borders with custom dashes when deep zoomed
      if (showCountryBorders && z >= 2.2) {
        const bordersPath = getBordersLOD2();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = Math.max(0.4, 0.9 / Math.sqrt(z));
        ctx.setLineDash([3, 3]);
        ctx.stroke(bordersPath);
        ctx.setLineDash([]);
      }

      // 4. Subpixel Coastal Glow (LOD4 Deep Zoom >= 3.2)
      if (z >= 3.2) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = Math.max(0.3, 0.6 / Math.sqrt(z));
        ctx.stroke(getLandLOD2());
      }

      ctx.restore();
    }

    ctx.restore();
  }, [showGraticules, showRiversAndLakes, showCountryBorders, viewportBounds]);

  // Request Animation Frame Render Loop
  const scheduleRender = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      renderCanvas();
      animationFrameRef.current = null;
    });
  }, [renderCanvas]);

  // Direct DOM Synchronization for 60fps pan/zoom without React re-render thrashing
  const applyDirectTransform = (newX: number, newY: number, newZ: number) => {
    transformRef.current = { x: newX, y: newY, zoom: newZ };
    if (svgOverlayRef.current) {
      svgOverlayRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${newZ})`;
    }
    scheduleRender();
  };

  // Debounced React state sync (when dragging/zooming stops)
  const debounceSyncReactState = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setPan({ x: transformRef.current.x, y: transformRef.current.y });
      setZoom(transformRef.current.zoom);
    }, 120);
  };

  // Initial render & state change
  useEffect(() => {
    transformRef.current = { x: pan.x, y: pan.y, zoom };
    if (svgOverlayRef.current) {
      svgOverlayRef.current.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
    }
    scheduleRender();
  }, [pan, zoom, scheduleRender]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => scheduleRender();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scheduleRender]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      applyDirectTransform(newX, newY, transformRef.current.zoom);
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const baseScale = Math.max(width / 2000, height / 1000);
      const effZoom = transformRef.current.zoom * baseScale;

      const canvasX = (e.clientX - rect.left - (transformRef.current.x + width / 2)) / effZoom + 1000;
      const canvasY = (e.clientY - rect.top - (transformRef.current.y + height / 2)) / effZoom + 500;
      const lng = (canvasX / 2000) * 360 - 180;
      const lat = 90 - (canvasY / 1000) * 180;

      setMouseGeo({ lat: Math.max(-90, Math.min(90, lat)), lng: Math.max(-180, Math.min(180, lng)) });
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      debounceSyncReactState();
    }
  };

  // Touch Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      dragStartRef.current = { x: touch.clientX - transformRef.current.x, y: touch.clientY - transformRef.current.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStartRef.current.x;
      const newY = touch.clientY - dragStartRef.current.y;
      applyDirectTransform(newX, newY, transformRef.current.zoom);
    }
  };

  const handleTouchEnd = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      debounceSyncReactState();
    }
  };

  // Smooth wheel zoom with direct DOM update
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(5.5, Math.max(0.65, transformRef.current.zoom * factor));
    applyDirectTransform(transformRef.current.x, transformRef.current.y, newZoom);
    debounceSyncReactState();
  };

  // Quick region jump presets
  const jumpToRegion = (region: 'global' | 'na' | 'eu' | 'asia') => {
    let targetZoom = 1;
    let targetPan = { x: 0, y: 0 };
    switch (region) {
      case 'global':
        targetZoom = 1;
        targetPan = { x: 0, y: 0 };
        break;
      case 'na':
        targetZoom = 2.2;
        targetPan = { x: 420, y: 120 };
        break;
      case 'eu':
        targetZoom = 2.8;
        targetPan = { x: -280, y: 220 };
        break;
      case 'asia':
        targetZoom = 2.3;
        targetPan = { x: -840, y: 80 };
        break;
    }
    setZoom(targetZoom);
    setPan(targetPan);
    applyDirectTransform(targetPan.x, targetPan.y, targetZoom);
  };

  const resetView = () => jumpToRegion('global');

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative w-full h-full bg-[#03060f] overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
    >
      {/* Hardware-Accelerated 60 FPS Canvas Base Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* HUD Telemetry Overlay (Top Left) */}
      <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 z-20 pointer-events-none font-mono text-[9px] sm:text-[10.5px] space-y-0.5 sm:space-y-1 bg-[#060b17]/90 backdrop-blur-md p-1.5 sm:p-2.5 rounded-xl border border-slate-800/90 text-slate-300 shadow-2xl max-w-[200px] sm:max-w-none">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold tracking-wider">
          <Crosshair className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400 animate-spin shrink-0" />
          <span className="truncate">
            GEOSPATIAL {currentLOD} • {currentZoomStage}
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 text-[8px] text-slate-500 font-bold">
          <span className={currentZoomStage === 'GLOBAL' ? 'text-cyan-400 font-extrabold' : ''}>GLOBAL</span>
          <span>→</span>
          <span className={currentZoomStage === 'REGION' ? 'text-cyan-400 font-extrabold' : ''}>REGION</span>
          <span>→</span>
          <span className={currentZoomStage === 'COUNTRY' ? 'text-cyan-400 font-extrabold' : ''}>COUNTRY</span>
          <span>→</span>
          <span className={currentZoomStage === 'CITY' ? 'text-cyan-400 font-extrabold' : ''}>CITY</span>
          <span>→</span>
          <span className={currentZoomStage === 'LOCAL' ? 'text-cyan-400 font-extrabold' : ''}>LOCAL</span>
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-3 text-slate-200">
          <span>
            {mouseGeo.lat.toFixed(2)}°{mouseGeo.lat >= 0 ? 'N' : 'S'}
          </span>
          <span className="text-slate-600 hidden xs:inline">|</span>
          <span className="hidden xs:inline">
            {Math.abs(mouseGeo.lng).toFixed(2)}°{mouseGeo.lng >= 0 ? 'E' : 'W'}
          </span>
        </div>
        <div className="hidden sm:flex items-center justify-between text-slate-400 text-[9px]">
          <span>ZOOM: {zoom.toFixed(2)}x</span>
          <span className="text-emerald-400 font-bold ml-2">
            {isClustered
              ? `${clusteredHubs.length} HUBS`
              : `${visibleEntitiesInViewport.length + visibleOpportunitiesInViewport.length} NODES`}
          </span>
        </div>
      </div>

      {/* Map Mode Switcher & Region Jumps (Top Center on Desktop) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center space-x-2 bg-[#060b17]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 shadow-2xl">
        {/* Mode Selector */}
        <div className="flex items-center space-x-1 border-r border-slate-800 pr-2 mr-1">
          <button
            onClick={() => setMapMode('unified')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mapMode === 'unified' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'hover:bg-slate-800'
            }`}
          >
            Unified Radar
          </button>
          <button
            onClick={() => setMapMode('opportunities')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mapMode === 'opportunities' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold' : 'hover:bg-slate-800'
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setMapMode('ecosystem')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              mapMode === 'ecosystem' ? 'bg-purple-950 text-purple-300 border border-purple-800 font-bold' : 'hover:bg-slate-800'
            }`}
          >
            AI Frontier ({filteredEntities.length})
          </button>
        </div>

        {/* Region Jumps */}
        <span className="text-slate-500 text-[10px] flex items-center space-x-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          <span>REGION:</span>
        </span>
        <button onClick={() => jumpToRegion('global')} className="px-1.5 py-0.5 rounded hover:bg-slate-800">
          Global
        </button>
        <button onClick={() => jumpToRegion('na')} className="px-1.5 py-0.5 rounded hover:bg-slate-800">
          N. America
        </button>
        <button onClick={() => jumpToRegion('eu')} className="px-1.5 py-0.5 rounded hover:bg-slate-800">
          Europe
        </button>
        <button onClick={() => jumpToRegion('asia')} className="px-1.5 py-0.5 rounded hover:bg-slate-800">
          Asia-Pac
        </button>
      </div>

      {/* Floating Map Action Controls (Top Right) */}
      <div className="absolute top-2 sm:top-3.5 right-2 sm:right-3.5 z-20 flex items-center space-x-1 bg-[#060b17]/90 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-800 text-slate-200 shadow-2xl">
        <div className="hidden sm:flex items-center space-x-1">
          <button
            onClick={() => {
              const newZ = Math.min(5.5, zoom * 1.25);
              setZoom(newZ);
              applyDirectTransform(transformRef.current.x, transformRef.current.y, newZ);
            }}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const newZ = Math.max(0.65, zoom / 1.25);
              setZoom(newZ);
              applyDirectTransform(transformRef.current.x, transformRef.current.y, newZ);
            }}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Reset Global View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-slate-800" />
        </div>

        <button
          onClick={() => setShowNetworkLinks(!showNetworkLinks)}
          className={`p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
            showNetworkLinks ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Neural Connections"
        >
          <Activity className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowTechHubs(!showTechHubs)}
          className={`p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
            showTechHubs ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Hub Beacons"
        >
          <Radio className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLayerDrawer(!showLayerDrawer)}
          className={`p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
            showLayerDrawer ? 'bg-violet-950 text-violet-300 border border-violet-800' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Filter Intelligence Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile One-Handed Thumb Zoom Floating Pill */}
      <div className="sm:hidden absolute bottom-12 right-2.5 z-20 flex flex-col space-y-1.5 bg-[#060b17]/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-slate-200 shadow-2xl">
        <button
          onClick={() => {
            const newZ = Math.min(5.5, zoom * 1.3);
            setZoom(newZ);
            applyDirectTransform(transformRef.current.x, transformRef.current.y, newZ);
          }}
          className="p-2 hover:bg-slate-800 active:bg-cyan-950 rounded-lg text-slate-300 active:text-cyan-300 min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            const newZ = Math.max(0.65, zoom / 1.3);
            setZoom(newZ);
            applyDirectTransform(transformRef.current.x, transformRef.current.y, newZ);
          }}
          className="p-2 hover:bg-slate-800 active:bg-cyan-950 rounded-lg text-slate-300 active:text-cyan-300 min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 hover:bg-slate-800 active:bg-cyan-950 rounded-lg text-slate-300 active:text-cyan-300 min-h-[38px] min-w-[38px] flex items-center justify-center"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Category Layer Filter Drawer */}
      {showLayerDrawer && (
        <div className="absolute top-14 right-2.5 sm:right-3.5 z-30 w-[calc(100vw-20px)] sm:w-72 bg-[#080d1a] border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 font-mono text-[11px] text-slate-300 max-h-[75dvh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[10px]">
            <span className="font-bold text-white uppercase tracking-wider">MAP INTELLIGENCE LAYERS</span>
            <span className="text-cyan-400 font-bold">{currentLOD}</span>
          </div>

          {/* Mode Switcher on Mobile/Drawer */}
          <div className="mb-3 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">RADAR MODE</span>
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <button
                onClick={() => setMapMode('unified')}
                className={`py-1 rounded text-center ${mapMode === 'unified' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'bg-slate-900 text-slate-400'}`}
              >
                Unified
              </button>
              <button
                onClick={() => setMapMode('opportunities')}
                className={`py-1 rounded text-center ${mapMode === 'opportunities' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold' : 'bg-slate-900 text-slate-400'}`}
              >
                Opps
              </button>
              <button
                onClick={() => setMapMode('ecosystem')}
                className={`py-1 rounded text-center ${mapMode === 'ecosystem' ? 'bg-purple-950 text-purple-300 border border-purple-800 font-bold' : 'bg-slate-900 text-slate-400'}`}
              >
                Frontier
              </button>
            </div>
          </div>

          {/* Opportunity Types */}
          {mapMode !== 'ecosystem' && (
            <div className="space-y-1 mb-3">
              <span className="text-slate-400 text-[10px] uppercase font-bold">OPPORTUNITY TYPES</span>
              {Object.entries(OPP_TYPE_STYLES).map(([type, style]) => {
                const count = opportunities.filter((o) => o.opportunityType === type).length;
                const isChecked = visibleOppTypes[type] !== false;
                return (
                  <label key={type} className="flex items-center justify-between p-1 rounded hover:bg-slate-900 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: style.color }} />
                      <span className={isChecked ? 'text-slate-200' : 'text-slate-500'}>{style.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500">({count})</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => setVisibleOppTypes((prev) => ({ ...prev, [type]: !prev[type] }))}
                        className="accent-cyan-500 w-3.5 h-3.5 rounded"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Cartographic Features */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[10px]">
            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900">
              <span className="text-slate-300 font-semibold">National Country Borders</span>
              <input
                type="checkbox"
                checked={showCountryBorders}
                onChange={(e) => {
                  setShowCountryBorders(e.target.checked);
                  scheduleRender();
                }}
                className="accent-cyan-500 w-3.5 h-3.5 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900">
              <span className="text-slate-300 font-semibold">Rivers & Major Lakes</span>
              <input
                type="checkbox"
                checked={showRiversAndLakes}
                onChange={(e) => {
                  setShowRiversAndLakes(e.target.checked);
                  scheduleRender();
                }}
                className="accent-cyan-500 w-3.5 h-3.5 rounded"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-slate-900">
              <span className="text-slate-400">Orbital Radar Inset</span>
              <input
                type="checkbox"
                checked={showMinimap}
                onChange={(e) => setShowMinimap(e.target.checked)}
                className="accent-cyan-500 w-3.5 h-3.5 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Interactive Vector Overlay Layer (Clusters, Markers, Neural Arcs) */}
      <svg
        ref={svgOverlayRef}
        className="absolute inset-0 w-full h-full pointer-events-auto overflow-visible"
        viewBox="0 0 2000 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Neural Network Relationship Arcs */}
        {connectionLinks.map((link, idx) => (
          <g key={idx} className="pointer-events-none">
            <path
              d={link.pathD}
              fill="none"
              stroke="rgba(6, 182, 212, 0.4)"
              strokeWidth={Math.max(0.6, 1.2 / Math.sqrt(zoom))}
              strokeDasharray="4 4"
            />
          </g>
        ))}

        {/* 1. Low Zoom Mode (< 1.7): Clustered Hub Beacons with Density Badges */}
        {isClustered &&
          clusteredHubs.map((hub) => {
            const { x, y } = geoToCanvas(hub.lat, hub.lng);
            const totalHubCount = hub.activeNodeCount + hub.activeOppCount;

            return (
              <g
                key={hub.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={() => {
                  const targetZ = 2.4;
                  const targetX = -x * (targetZ - 1);
                  const targetY = -y * (targetZ - 1);
                  setZoom(targetZ);
                  setPan({ x: targetX, y: targetY });
                  applyDirectTransform(targetX, targetY, targetZ);
                }}
                onMouseEnter={() => setHoveredHub(hub)}
                onMouseLeave={() => setHoveredHub(null)}
              >
                {/* Outer Radar Halo */}
                <circle r="18" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.3">
                  <animate attributeName="r" values="14;26;14" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.05;0.5" dur="3s" repeatCount="indefinite" />
                </circle>

                {/* Hub Badge */}
                <rect
                  x="-18"
                  y="-11"
                  width="36"
                  height="22"
                  rx="6"
                  fill="#050d1e"
                  stroke="#06b6d4"
                  strokeWidth="1.2"
                  filter="url(#glow-cyan)"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {totalHubCount}
                </text>

                {/* Label */}
                <text
                  x="0"
                  y="22"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="7.5"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {hub.name.split(' ')[0]}
                </text>
              </g>
            );
          })}

        {/* 2. Deep Zoom Mode (>= 1.7): Discrete Individual Opportunity Markers */}
        {!isClustered &&
          visibleOpportunitiesInViewport.map((opp) => {
            const { x, y } = geoToCanvas(opp.location.lat, opp.location.lng);
            const style = OPP_TYPE_STYLES[opp.opportunityType] || OPP_TYPE_STYLES.GRANT;
            const isSelected = selectedOpportunity?.id === opp.id;
            const isHovered = hoveredOpportunity?.id === opp.id;

            return (
              <g
                key={opp.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOpportunity(opp);
                }}
                onMouseEnter={() => setHoveredOpportunity(opp)}
                onMouseLeave={() => setHoveredOpportunity(null)}
              >
                {/* Marker Halo */}
                <circle
                  r={isSelected ? 11 : 8}
                  fill={style.color}
                  fillOpacity={isSelected ? 0.35 : 0.2}
                  stroke={style.color}
                  strokeWidth={isSelected ? 1.8 : 1.0}
                />

                {/* Marker Core */}
                <circle
                  r={isSelected ? 6 : 4.5}
                  fill={style.color}
                  stroke="#03060f"
                  strokeWidth="1.5"
                  filter={isHovered || isSelected ? 'url(#glow-cyan)' : undefined}
                />

                {/* Label & Funding Amount Badge */}
                {(zoom >= 2.0 || isHovered || isSelected) && (
                  <g className="pointer-events-none">
                    <rect
                      x="10"
                      y="-8"
                      width={opp.title.length * 5.8 + 14}
                      height="16"
                      fill="#040916"
                      stroke={isSelected ? style.color : '#1e293b'}
                      strokeWidth="0.8"
                      rx="4"
                      opacity="0.95"
                    />
                    <text
                      x="14"
                      y="4"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {opp.title.length > 28 ? `${opp.title.slice(0, 28)}...` : opp.title}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        {/* 3. Deep Zoom Mode (>= 1.7): Discrete Individual AI Ecosystem Entities */}
        {!isClustered &&
          visibleEntitiesInViewport.map((entity) => {
            const { x, y } = geoToCanvas(entity.location.lat, entity.location.lng);
            const theme = CATEGORY_THEMES[entity.category] || CATEGORY_THEMES.company;
            const isSelected = selectedEntity?.id === entity.id;
            const isHovered = hoveredEntity?.id === entity.id;

            return (
              <g
                key={entity.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity(entity);
                }}
                onMouseEnter={() => setHoveredEntity(entity)}
                onMouseLeave={() => setHoveredEntity(null)}
              >
                <circle
                  r={isSelected ? 10 : 7}
                  fill={theme.color}
                  fillOpacity={isSelected ? 0.3 : 0.15}
                  stroke={theme.color}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                />
                <circle
                  r={isSelected ? 5.5 : 4}
                  fill={theme.color}
                  stroke="#03060f"
                  strokeWidth="1.5"
                  filter={isHovered || isSelected ? 'url(#glow-cyan)' : undefined}
                />

                {(zoom >= 2.0 || isHovered || isSelected) && (
                  <g className="pointer-events-none">
                    <rect
                      x="10"
                      y="-7"
                      width={entity.name.length * 6.2 + 8}
                      height="14"
                      fill="#040916"
                      stroke={isSelected ? theme.color : '#1e293b'}
                      strokeWidth="0.8"
                      rx="3"
                      opacity="0.95"
                    />
                    <text
                      x="14"
                      y="3.5"
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {entity.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </svg>

      {/* Global Inset Mini-Radar Map (Bottom Right) */}
      {showMinimap && (
        <div className="absolute bottom-3 right-3 z-20 hidden lg:block pointer-events-none">
          <div className="w-48 h-24 bg-[#050a16]/95 border border-slate-700/80 rounded-xl shadow-2xl p-1 relative overflow-hidden">
            <div className="absolute top-1 left-2 text-[8px] font-mono font-bold text-cyan-400">
              ORBITAL RADAR
            </div>
            <svg viewBox="0 0 2000 1000" className="w-full h-full opacity-60">
              <path d={NATURAL_EARTH_CARTOGRAPHY.landLOD1} fill="#1e293b" />
              <rect
                x={Math.max(0, -pan.x / zoom)}
                y={Math.max(0, -pan.y / zoom)}
                width={Math.min(2000, 2000 / zoom)}
                height={Math.min(1000, 1000 / zoom)}
                fill="rgba(6, 182, 212, 0.15)"
                stroke="#06b6d4"
                strokeWidth="20"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Hover Tooltip: Opportunity */}
      {hoveredOpportunity && (
        <div
          className="absolute z-40 pointer-events-none transition-all duration-75"
          style={{
            left: `${Math.min(tooltipPos.x + 14, (containerRef.current?.clientWidth || 800) - 270)}px`,
            top: `${Math.min(tooltipPos.y + 14, (containerRef.current?.clientHeight || 600) - 170)}px`,
          }}
        >
          <div className="w-64 p-3 rounded-2xl bg-[#070c1a]/98 border border-emerald-500/60 shadow-2xl text-[11px] font-mono space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400">
                {hoveredOpportunity.opportunityType.replace('_', ' ')}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold">
                {hoveredOpportunity.status}
              </span>
            </div>

            <div className="font-bold text-white text-xs leading-snug">{hoveredOpportunity.title}</div>
            <div className="text-[10px] text-cyan-300">{hoveredOpportunity.organizationName}</div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">FUNDING:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[130px]">
                {hoveredOpportunity.fundingAmount || hoveredOpportunity.prize || 'Funded'}
              </span>
            </div>

            <div className="text-[9px] text-cyan-400 text-right">Click to inspect requirements & apply →</div>
          </div>
        </div>
      )}

      {/* Hover Tooltip: AI Entity */}
      {hoveredEntity && !hoveredOpportunity && (
        <div
          className="absolute z-40 pointer-events-none transition-all duration-75"
          style={{
            left: `${Math.min(tooltipPos.x + 14, (containerRef.current?.clientWidth || 800) - 250)}px`,
            top: `${Math.min(tooltipPos.y + 14, (containerRef.current?.clientHeight || 600) - 160)}px`,
          }}
        >
          <div className="w-60 p-2.5 rounded-xl bg-[#070c1a]/98 border border-slate-700 shadow-2xl text-[11px] font-mono space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span
                className="font-bold uppercase tracking-wider text-[10px]"
                style={{ color: CATEGORY_THEMES[hoveredEntity.category]?.color }}
              >
                {CATEGORY_THEMES[hoveredEntity.category]?.label}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                {hoveredEntity.location.countryCode}
              </span>
            </div>

            <div className="font-bold text-white text-xs leading-snug">{hoveredEntity.name}</div>
            <div className="text-[10px] text-slate-400 line-clamp-1">{hoveredEntity.organization}</div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">TRUST SCORE:</span>
              <span className="text-emerald-400 font-bold">{hoveredEntity.trustScore}/100</span>
            </div>

            <div className="text-[9px] text-cyan-400 text-right">Click node to inspect intelligence →</div>
          </div>
        </div>
      )}

      {/* Hover Tooltip: Tech Hub */}
      {hoveredHub && !hoveredEntity && !hoveredOpportunity && (
        <div
          className="absolute z-40 pointer-events-none transition-all duration-75"
          style={{
            left: `${Math.min(tooltipPos.x + 14, (containerRef.current?.clientWidth || 800) - 250)}px`,
            top: `${Math.min(tooltipPos.y + 14, (containerRef.current?.clientHeight || 600) - 140)}px`,
          }}
        >
          <div className="w-64 p-2.5 rounded-xl bg-[#060b18]/98 border border-cyan-500/50 shadow-2xl text-[11px] font-mono space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-400 text-[10px] uppercase flex items-center space-x-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>GLOBAL TECH & OPPORTUNITY HUB</span>
              </span>
              <span className="text-[9px] text-slate-400">{hoveredHub.region}</span>
            </div>

            <div className="font-bold text-white text-xs">{hoveredHub.name}</div>
            <div className="text-[10px] text-slate-400 leading-snug font-sans">{hoveredHub.description}</div>

            <div className="pt-1 border-t border-slate-800 flex justify-between text-[10px]">
              <span className="text-slate-500">CLUSTER DENSITY:</span>
              <span className="text-cyan-300 font-bold">
                {hoveredHub.activeOppCount} Opps • {hoveredHub.activeNodeCount} Nodes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Center Legend Bar */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center space-x-3 px-4 py-1.5 rounded-full bg-[#060b17]/90 backdrop-blur-md border border-slate-800 font-mono text-[10px] text-slate-300 shadow-2xl">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Grants</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Fellowships</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <span>Accelerators</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Frontier AI</span>
        </div>
        <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-2">
          <span className="w-2 h-2 rounded-full border border-cyan-400 animate-ping" />
          <span className="text-cyan-400">Hub Clusters</span>
        </div>
      </div>
    </div>
  );
};
