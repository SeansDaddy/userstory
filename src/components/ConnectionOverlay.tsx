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
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pathD: string;
  label?: string;
  style: 'solid' | 'dashed';
  color: string;
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connections,
  containerRef,
  zoomLevel,
  onDeleteConnection,
  onToggleStyle,
}) => {
  const [paths, setPaths] = useState<PathCoords[]>([]);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  const calculatePaths = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const newPaths: PathCoords[] = [];

    connections.forEach((conn) => {
      const sourceEl = document.getElementById(`node-card-${conn.sourceNodeId}`);
      const targetEl = document.getElementById(`node-card-${conn.targetNodeId}`);

      if (sourceEl && targetEl) {
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // Calculate positions relative to container
        const x1 = (sourceRect.left + sourceRect.width / 2 - containerRect.left) / zoomLevel;
        const y1 = (sourceRect.top + sourceRect.height / 2 - containerRect.top) / zoomLevel;
        const x2 = (targetRect.left + targetRect.width / 2 - containerRect.left) / zoomLevel;
        const y2 = (targetRect.top + targetRect.height / 2 - containerRect.top) / zoomLevel;

        // Smooth cubic bezier curve calculation
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const controlOffset = Math.min(Math.max(dx * 0.4, 40), 120);

        let pathD = '';
        if (Math.abs(y2 - y1) < 20) {
          // Horizontal line
          pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
        } else if (x2 > x1) {
          // Forward flow
          pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
        } else {
          // Backward / vertical loop flow
          pathD = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1 + dy / 2}, ${x2 - controlOffset} ${y2 - dy / 2}, ${x2} ${y2}`;
        }

        newPaths.push({
          id: conn.id,
          sourceId: conn.sourceNodeId,
          targetId: conn.targetNodeId,
          x1,
          y1,
          x2,
          y2,
          pathD,
          label: conn.label,
          style: conn.style,
          color: conn.style === 'dashed' ? '#ec4899' : conn.color || '#3b82f6',
        });
      }
    });

    setPaths(newPaths);
  };

  useEffect(() => {
    calculatePaths();
    const handleResize = () => calculatePaths();
    window.addEventListener('resize', handleResize);
    const interval = setInterval(calculatePaths, 800); // Periodic sync for DOM changes

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, [connections, zoomLevel]);

  if (paths.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Solid Arrow Marker */}
        <marker
          id="arrow-solid"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
        </marker>

        {/* Dashed Arrow Marker */}
        <marker
          id="arrow-dashed"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
        </marker>
      </defs>

      {paths.map((p) => {
        const isHovered = hoveredConnId === p.id;
        const midX = (p.x1 + p.x2) / 2;
        const midY = (p.y1 + p.y2) / 2;

        return (
          <g key={p.id} className="pointer-events-auto">
            {/* Wider hit test path */}
            <path
              d={p.pathD}
              fill="none"
              stroke="transparent"
              strokeWidth="16"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredConnId(p.id)}
              onMouseLeave={() => setHoveredConnId(null)}
              onClick={() => onToggleStyle && onToggleStyle(p.id)}
            />

            {/* Visual Path Line */}
            <path
              d={p.pathD}
              fill="none"
              stroke={p.color}
              strokeWidth={isHovered ? 3 : 2}
              strokeDasharray={p.style === 'dashed' ? '6,6' : 'none'}
              markerEnd={p.style === 'dashed' ? 'url(#arrow-dashed)' : 'url(#arrow-solid)'}
              className="transition-all duration-150"
            />

            {/* Label badge if available */}
            {p.label && (
              <g
                transform={`translate(${midX}, ${midY})`}
                className="cursor-pointer group"
                onClick={() => onToggleStyle && onToggleStyle(p.id)}
                onMouseEnter={() => setHoveredConnId(p.id)}
                onMouseLeave={() => setHoveredConnId(null)}
              >
                <rect
                  x={-p.label.length * 5 - 8}
                  y="-10"
                  width={p.label.length * 10 + 16}
                  height="20"
                  rx="10"
                  fill={p.style === 'dashed' ? '#fce7f3' : '#eff6ff'}
                  stroke={p.color}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={p.style === 'dashed' ? '#be185d' : '#1e40af'}
                >
                  {p.label}
                </text>
              </g>
            )}

            {/* Hover Actions / Delete button */}
            {isHovered && onDeleteConnection && (
              <g
                transform={`translate(${midX + 25}, ${midY - 12})`}
                className="cursor-pointer"
                onClick={() => onDeleteConnection(p.id)}
              >
                <circle r="8" fill="#ef4444" />
                <text x="0" y="3" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  ×
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
