import React, { useEffect, useState } from 'react';
import { Connection } from '../types';

interface ConnectionOverlayProps {
  connections: Connection[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoomLevel: number;
  onDeleteConnection?: (connId: string) => void;
  onToggleStyle?: (connId: string) => void;
}

interface PathCoords {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number; y1: number;
  x2: number; y2: number;
  pathD: string;
  label?: string;
  style: 'solid' | 'dashed';
  color: string;
}

const FAN_SPACING = 14; // px between adjacent lines at exit/entry

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connections, containerRef, zoomLevel, onDeleteConnection, onToggleStyle,
}) => {
  const [paths, setPaths] = useState<PathCoords[]>([]);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const calculatePaths = () => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();

    // Group connections by source node
    const groups: Record<string, { conn: typeof connections[0]; targetEl: Element }[]> = {};
    connections.forEach(conn => {
      const se = document.getElementById(`node-card-${conn.sourceNodeId}`);
      const te = document.getElementById(`node-card-${conn.targetNodeId}`);
      if (!se || !te) return;
      if (!groups[conn.sourceNodeId]) groups[conn.sourceNodeId] = [];
      groups[conn.sourceNodeId].push({ conn, targetEl: te });
    });

    const result: PathCoords[] = [];

    Object.entries(groups).forEach(([sourceId, entries]) => {
      const sourceEl = document.getElementById(`node-card-${sourceId}`);
      if (!sourceEl) return;
      const sr = sourceEl.getBoundingClientRect();
      const count = entries.length;
      const mid = (count - 1) / 2;

      entries.forEach(({ conn, targetEl }, idx) => {
        const tr = targetEl.getBoundingClientRect();

        // Fan-out offset: lines spread out from center
        const offset = (idx - mid) * FAN_SPACING;

        // Source node: exit from bottom edge, fan horizontally
        const sLeft = (sr.left - cr.left) / zoomLevel;
        const sTop = (sr.top - cr.top) / zoomLevel;
        const sW = sr.width / zoomLevel;
        const sH = sr.height / zoomLevel;

        const tLeft = (tr.left - cr.left) / zoomLevel;
        const tTop = (tr.top - cr.top) / zoomLevel;
        const tW = tr.width / zoomLevel;
        const tH = tr.height / zoomLevel;

        // Source exit point: bottom edge with horizontal fan
        const x1 = sLeft + sW / 2 + offset * 0.6;
        const y1 = sTop + sH;

        // Target entry point: top edge with horizontal fan
        const x2 = tLeft + tW / 2 + offset * 0.4;
        const y2 = tTop;

        // Bezier control points
        const absDy = Math.abs(y2 - y1);
        const absDx = Math.abs(x2 - x1);
        const ctrlYOffset = Math.max(absDy * 0.4, 20);
        const ctrlXOffset = Math.min(absDx * 0.3, 50);

        const pathD = x2 > x1
          ? `M ${x1} ${y1} C ${x1 + ctrlXOffset} ${y1 + ctrlYOffset * 0.3}, ${x2 - ctrlXOffset} ${y2 - ctrlYOffset * 0.3}, ${x2} ${y2}`
          : `M ${x1} ${y1} C ${x1 - ctrlXOffset} ${y1 + ctrlYOffset * 0.3}, ${x2 + ctrlXOffset} ${y2 - ctrlYOffset * 0.3}, ${x2} ${y2}`;

        result.push({
          id: conn.id,
          sourceId: conn.sourceNodeId,
          targetId: conn.targetNodeId,
          x1, y1, x2, y2, pathD,
          label: conn.label,
          style: conn.style,
          color: conn.style === 'dashed' ? '#ec4899' : conn.color || '#3b82f6',
        });
      });
    });

    setPaths(result);
  };

  useEffect(() => {
    calculatePaths();
    const handle = () => calculatePaths();
    window.addEventListener('resize', handle);
    const interval = setInterval(calculatePaths, 800);
    return () => {
      window.removeEventListener('resize', handle);
      clearInterval(interval);
    };
  }, [connections, zoomLevel]);

  if (paths.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
      <defs>
        <marker id="arrow-solid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>
        <marker id="arrow-dashed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
        </marker>
      </defs>

      {paths.map(p => {
        const isHovered = hoveredConnId === p.id;
        const midX = (p.x1 + p.x2) / 2;
        const midY = (p.y1 + p.y2) / 2;

        return (
          <g key={p.id} className="pointer-events-auto">
            <path d={p.pathD} fill="none" stroke="transparent" strokeWidth="16" className="cursor-pointer"
              onMouseEnter={() => setHoveredConnId(p.id)}
              onMouseLeave={() => setHoveredConnId(null)}
              onClick={() => onToggleStyle?.(p.id)}
            />
            <path d={p.pathD} fill="none" stroke={p.color} strokeWidth={isHovered ? 3 : 2}
              strokeDasharray={p.style === 'dashed' ? '6,6' : 'none'}
              markerEnd={p.style === 'dashed' ? 'url(#arrow-dashed)' : 'url(#arrow-solid)'}
              className="transition-all duration-150"
            />
            {p.label && (
              <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer group"
                onClick={() => onToggleStyle?.(p.id)}
                onMouseEnter={() => setHoveredConnId(p.id)}
                onMouseLeave={() => setHoveredConnId(null)}
              >
                <rect x={-p.label.length * 5 - 8} y="-10" width={p.label.length * 10 + 16} height="20" rx="10"
                  fill={p.style === 'dashed' ? '#fce7f3' : '#eff6ff'} stroke={p.color} strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="600"
                  fill={p.style === 'dashed' ? '#be185d' : '#1e40af'}>{p.label}</text>
              </g>
            )}
            {isHovered && onDeleteConnection && (
              <g transform={`translate(${midX + 25}, ${midY - 12})`} className="cursor-pointer"
                onClick={() => onDeleteConnection(p.id)}>
                <circle r="8" fill="#ef4444" />
                <text x="0" y="3" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">×</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
