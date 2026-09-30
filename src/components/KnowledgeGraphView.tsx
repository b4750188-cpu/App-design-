import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Share2,
  Info,
  Filter,
} from 'lucide-react';
import { useAIHeaven } from '../context/AIHeavenContext';
import { CATEGORY_THEMES } from './WorldMonitorMap';
import { AIEntity, EntityCategory, RelationType } from '../types/aiHeaven';

interface GraphNode {
  id: string;
  name: string;
  category: EntityCategory;
  x: number;
  y: number;
  vx: number;
  vy: number;
  entity: AIEntity;
}

interface GraphEdge {
  sourceId: string;
  targetId: string;
  relation: RelationType;
}

export const KnowledgeGraphView: React.FC = () => {
  const { entities, setSelectedEntity, selectedEntity } = useAIHeaven();

  const [graphQuery, setGraphQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Draggable node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Initialize graph nodes in a radial layout
  const [nodes, setNodes] = useState<GraphNode[]>(() => {
    const width = 1000;
    const height = 650;
    const centerX = width / 2;
    const centerY = height / 2;
    const total = entities.length;

    return entities.map((e, index) => {
      // Spiral placement based on category
      const angle = (index / total) * 2 * Math.PI;
      const radius = 180 + (index % 3) * 90;
      return {
        id: e.id,
        name: e.name,
        category: e.category,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        entity: e,
      };
    });
  });

  // Extract edges
  const edges = useMemo<GraphEdge[]>(() => {
    const list: GraphEdge[] = [];
    entities.forEach((source) => {
      source.relationships.forEach((rel) => {
        if (entities.some((e) => e.id === rel.targetId)) {
          list.push({
            sourceId: source.id,
            targetId: rel.targetId,
            relation: rel.relation,
          });
        }
      });
    });
    return list;
  }, [entities]);

  // Gentle physics simulation loop
  useEffect(() => {
    let animId: number;
    const simulate = () => {
      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((node) => ({ ...node }));

        // Repulsion between nodes
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const dx = nextNodes[j].x - nextNodes[i].x;
            const dy = nextNodes[j].y - nextNodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 180) {
              const force = (180 - dist) / dist * 0.4;
              if (nextNodes[i].id !== draggedNodeId) {
                nextNodes[i].x -= dx * force * 0.05;
                nextNodes[i].y -= dy * force * 0.05;
              }
              if (nextNodes[j].id !== draggedNodeId) {
                nextNodes[j].x += dx * force * 0.05;
                nextNodes[j].y += dy * force * 0.05;
              }
            }
          }
        }

        // Attraction along edges
        edges.forEach((edge) => {
          const s = nextNodes.find((n) => n.id === edge.sourceId);
          const t = nextNodes.find((n) => n.id === edge.targetId);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const idealDist = 160;
            const force = (dist - idealDist) * 0.005;
            if (s.id !== draggedNodeId) {
              s.x += dx * force;
              s.y += dy * force;
            }
            if (t.id !== draggedNodeId) {
              t.x -= dx * force;
              t.y -= dy * force;
            }
          }
        });

        // Center gravity
        nextNodes.forEach((node) => {
          if (node.id === draggedNodeId) return;
          node.x += (500 - node.x) * 0.002;
          node.y += (325 - node.y) * 0.002;
        });

        return nextNodes;
      });

      animId = requestAnimationFrame(simulate);
    };

    animId = requestAnimationFrame(simulate);
    return () => cancelAnimationFrame(animId);
  }, [edges, draggedNodeId]);

  // Dragging single node
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggedNodeId) {
            return {
              ...n,
              x: (e.clientX - 260 - pan.x) / zoom,
              y: (e.clientY - 60 - pan.y) / zoom,
            };
          }
          return n;
        })
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  // Touch handlers for mobile and tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - panStart.x,
        y: touch.clientY - panStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const filteredNodeIds = useMemo(() => {
    if (!graphQuery.trim()) return null;
    return new Set(
      nodes
        .filter(
          (n) =>
            n.name.toLowerCase().includes(graphQuery.toLowerCase()) ||
            n.category.toLowerCase().includes(graphQuery.toLowerCase())
        )
        .map((n) => n.id)
    );
  }, [nodes, graphQuery]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full bg-[#050811] overflow-hidden select-none cursor-grab active:cursor-grabbing font-mono touch-none"
    >
      {/* Top Overlay Controls */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-20 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Search in Graph */}
        <div className="pointer-events-auto flex items-center space-x-1.5 sm:space-x-2 bg-[#080d19]/90 backdrop-blur-xs p-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 shadow-xl max-w-[calc(100vw-90px)]">
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 ml-1 shrink-0" />
          <span className="font-bold text-white text-[11px] sm:text-xs hidden xs:inline">GRAPH</span>
          <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5 sm:mx-1" />
          <div className="relative flex-1">
            <input
              type="text"
              value={graphQuery}
              onChange={(e) => setGraphQuery(e.target.value)}
              placeholder="Highlight nodes..."
              className="bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-[11px] sm:text-xs text-white placeholder-slate-500 w-28 xs:w-40 sm:w-56 focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        {/* View Controls */}
        <div className="pointer-events-auto flex items-center space-x-1 bg-[#080d19]/90 backdrop-blur-xs p-1 rounded-lg border border-slate-800 text-slate-300 shadow-xl">
          <button
            onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z / 1.2))}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:bg-slate-800 hover:text-cyan-300 rounded min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Reset Graph Position"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 650"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" opacity="0.6" />
          </marker>
        </defs>

        {/* Directed Edges */}
        {edges.map((edge, idx) => {
          const s = nodes.find((n) => n.id === edge.sourceId);
          const t = nodes.find((n) => n.id === edge.targetId);
          if (!s || !t) return null;

          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          const isHighlighted =
            filteredNodeIds && (filteredNodeIds.has(s.id) || filteredNodeIds.has(t.id));

          return (
            <g key={idx} className="transition-opacity">
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={isHighlighted ? '#06b6d4' : '#1e293b'}
                strokeWidth={isHighlighted ? 1.5 : 1}
                strokeDasharray="3 3"
                markerEnd="url(#graph-arrow)"
              />
              <rect
                x={midX - 35}
                y={midY - 7}
                width="70"
                height="14"
                fill="#090d18"
                rx="3"
                stroke="#1e293b"
                strokeWidth="0.5"
              />
              <text
                x={midX}
                y={midY + 3}
                fill="#64748b"
                fontSize="6.5"
                textAnchor="middle"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {edge.relation}
              </text>
            </g>
          );
        })}

        {/* Draggable Graph Nodes */}
        {nodes.map((node) => {
          const theme = CATEGORY_THEMES[node.category] || CATEGORY_THEMES.company;
          const isSelected = selectedEntity?.id === node.id;
          const isMatch = filteredNodeIds ? filteredNodeIds.has(node.id) : true;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer group"
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity(node.entity);
              }}
              opacity={isMatch ? 1 : 0.25}
            >
              {/* Outer Ring */}
              <circle
                r={isSelected ? 18 : 14}
                fill="#090d18"
                stroke={theme.color}
                strokeWidth={isSelected ? 2 : 1}
                className="transition-all"
              />

              {/* Inner Core */}
              <circle r={isSelected ? 6 : 4} fill={theme.color} />

              {/* Node Name Label */}
              <text
                x="0"
                y="26"
                fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                fontSize="8"
                fontWeight="600"
                textAnchor="middle"
                className="pointer-events-none drop-shadow"
              >
                {node.name}
              </text>

              <text
                x="0"
                y="34"
                fill="#64748b"
                fontSize="6"
                textAnchor="middle"
                className="pointer-events-none uppercase"
              >
                {node.category}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Graph Instructions HUD */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none text-[10px] text-slate-500 font-mono bg-[#090d18]/80 backdrop-blur-xs px-2.5 py-1.5 rounded border border-slate-800/80">
        <span>Click node to inspect intelligence • Drag nodes to reposition graph • Wheel to zoom</span>
      </div>
    </div>
  );
};
