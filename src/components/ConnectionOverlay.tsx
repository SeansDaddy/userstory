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
  id: string; pathD: string;
  x1: number; y1: number; x2: number; y2: number;
  label?: string; style: 'solid' | 'dashed'; color: string;
}

/** 检测两条线段 (a1→a2, b1→b2) 在水平/垂直方向上是否有交叉趋势 */
function linesOverlap(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number,
): boolean {
  // 两条线如果源是同一个节点，肯定重叠
  // 这里检测路径矩形区域是否有交集
  const aMinX = Math.min(ax1, ax2), aMaxX = Math.max(ax1, ax2);
  const aMinY = Math.min(ay1, ay2), aMaxY = Math.max(ay1, ay2);
  const bMinX = Math.min(bx1, bx2), bMaxX = Math.max(bx1, bx2);
  const bMinY = Math.min(by1, by2), bMaxY = Math.max(by1, by2);
  return !(aMaxX < bMinX || aMinX > bMaxX || aMaxY < bMinY || aMinY > bMaxY);
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connections, containerRef, zoomLevel, onDeleteConnection, onToggleStyle,
}) => {
  const [paths, setPaths] = useState<PathCoords[]>([]);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const calculatePaths = () => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();

    // Step 1: collect all basic path info (center → center)
    interface RawPath {
      id: string; sx: number; sy: number; tx: number; ty: number;
      sourceId: string; targetId: string;
      label?: string; style: 'solid' | 'dashed'; color: string;
    }
    const raws: RawPath[] = [];

    connections.forEach(conn => {
      const se = document.getElementById(`node-card-${conn.sourceNodeId}`);
      const te = document.getElementById(`node-card-${conn.targetNodeId}`);
      if (!se || !te) return;

      const sr = se.getBoundingClientRect();
      const tr = te.getBoundingClientRect();

      const sx = (sr.left + sr.width / 2 - cr.left) / zoomLevel;
      const sy = (sr.top + sr.height / 2 - cr.top) / zoomLevel;
      const tx = (tr.left + tr.width / 2 - cr.left) / zoomLevel;
      const ty = (tr.top + tr.height / 2 - cr.top) / zoomLevel;

      raws.push({
        id: conn.id, sx, sy, tx, ty,
        sourceId: conn.sourceNodeId, targetId: conn.targetNodeId,
        label: conn.label, style: conn.style,
        color: conn.style === 'dashed' ? '#ec4899' : conn.color || '#3b82f6',
      });
    });

    // Step 2: build pathD with overlap detection
    const result: PathCoords[] = [];

    raws.forEach((r, i) => {
      let { sx, sy, tx, ty } = r;

      // Check if this line overlaps with any previous line
      const hasOverlap = raws.slice(0, i).some(prev => {
        return r.sourceId === prev.sourceId || r.targetId === prev.targetId ||
          linesOverlap(sx, sy, tx, ty, prev.sx, prev.sy, prev.tx, prev.ty);
      });

      // Direction: vertical flow (top to bottom) or horizontal flow
      const dy = ty - sy;
      const dx = tx - sx;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2;

      let pathD: string;

      if (hasOverlap) {
        // 重叠时，用弧形绕开，在中间点偏移垂直方向
        const bendDir = (i % 2 === 0) ? 1 : -1;
        const bendAmount = Math.min(Math.max(dist * 0.15, 20), 60);

        // 垂直方向主路径：控制点水平偏移
        const cpOffX = bendDir * bendAmount * 0.6;
        const cpOffY = bendDir * bendAmount * 0.3;

        pathD = `M ${sx} ${sy} C ${sx + cpOffX} ${sy + cpOffY}, ${tx + cpOffX} ${ty - cpOffY}, ${tx} ${ty}`;
      } else {
        // 没有重叠：优雅的 S 曲线
        const ctrlY = sy + dy * 0.4;
        const ctrlXOff = Math.min(Math.abs(dx) * 0.3, 50);
        pathD = `M ${sx} ${sy} C ${sx + ctrlXOff} ${ctrlY}, ${tx - ctrlXOff} ${ty - dy * 0.4}, ${tx} ${ty}`;
      }

      result.push({
        id: r.id, x1: sx, y1: sy, x2: tx, y2: ty,
        pathD, label: r.label, style: r.style, color: r.color,
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
