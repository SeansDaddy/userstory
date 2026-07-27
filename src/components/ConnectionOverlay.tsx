import React, { useEffect, useState, useRef } from 'react';
import { Connection } from '../types';

interface ConnectionOverlayProps {
  connections: Connection[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoomLevel: number;
  onDeleteConnection?: (connId: string) => void;
  onToggleStyle?: (connId: string) => void;
  onUpdateConnection?: (connId: string, label: string, style: 'solid' | 'dashed') => void;
}

interface PathCoords {
  id: string; pathD: string;
  x1: number; y1: number; x2: number; y2: number;
  label?: string; style: 'solid' | 'dashed'; color: string;
}

function linesOverlap(
  ax1: number, ay1: number, ax2: number, ay2: number,
  bx1: number, by1: number, bx2: number, by2: number,
): boolean {
  const aMinX = Math.min(ax1, ax2), aMaxX = Math.max(ax1, ax2);
  const aMinY = Math.min(ay1, ay2), aMaxY = Math.max(ay1, ay2);
  const bMinX = Math.min(bx1, bx2), bMaxX = Math.max(bx1, bx2);
  const bMinY = Math.min(by1, by2), bMaxY = Math.max(by1, by2);
  return !(aMaxX < bMinX || aMinX > bMaxX || aMaxY < bMinY || aMinY > bMaxY);
}

export const ConnectionOverlay: React.FC<ConnectionOverlayProps> = ({
  connections, containerRef, zoomLevel, onDeleteConnection, onToggleStyle, onUpdateConnection,
}) => {
  const [paths, setPaths] = useState<PathCoords[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ connId: string; x: number; y: number } | null>(null);
  const [editingLabel, setEditingLabel] = useState<{ connId: string; label: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  const calculatePaths = () => {
    if (!containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();

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
      raws.push({
        id: conn.id, sx: (sr.left + sr.width / 2 - cr.left) / zoomLevel,
        sy: (sr.top + sr.height / 2 - cr.top) / zoomLevel,
        tx: (tr.left + tr.width / 2 - cr.left) / zoomLevel,
        ty: (tr.top + tr.height / 2 - cr.top) / zoomLevel,
        sourceId: conn.sourceNodeId, targetId: conn.targetNodeId,
        label: conn.label, style: conn.style,
        color: conn.style === 'dashed' ? '#ec4899' : conn.color || '#3b82f6',
      });
    });

    const result: PathCoords[] = [];
    raws.forEach((r, i) => {
      const { sx, sy, tx, ty } = r;
      const hasOverlap = raws.slice(0, i).some(prev =>
        r.sourceId === prev.sourceId || r.targetId === prev.targetId ||
        linesOverlap(sx, sy, tx, ty, prev.sx, prev.sy, prev.tx, prev.ty));

      const dy = ty - sy;
      const dx = tx - sx;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let pathD: string;
      if (hasOverlap) {
        const bendDir = (i % 2 === 0) ? 1 : -1;
        const bendAmount = Math.min(Math.max(dist * 0.15, 20), 60);
        const cpOffX = bendDir * bendAmount * 0.6;
        const cpOffY = bendDir * bendAmount * 0.3;
        pathD = `M ${sx} ${sy} C ${sx + cpOffX} ${sy + cpOffY}, ${tx + cpOffX} ${ty - cpOffY}, ${tx} ${ty}`;
      } else {
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

  const handleContextMenu = (e: React.MouseEvent, connId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ connId, x: e.clientX, y: e.clientY });
  };

  if (paths.length === 0) return null;

  return (
    <>
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
          const isHovered = hoveredId === p.id;

          const connObj = connections.find(c => c.id === p.id);

          return (
            <g key={p.id} className="pointer-events-auto">
              {/* Hit area */}
              <path d={p.pathD} fill="none" stroke="transparent" strokeWidth="18"
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onContextMenu={(e) => handleContextMenu(e, p.id)}
                onDoubleClick={() => {
                  setEditingLabel({ connId: p.id, label: connObj?.label || '' });
                }}
                onClick={() => onToggleStyle?.(p.id)}
              />
              {/* Visual line */}
              <path d={p.pathD} fill="none"
                stroke={isHovered ? '#f97316' : p.color}
                strokeWidth={isHovered ? 3 : 2}
                strokeDasharray={p.style === 'dashed' ? '6,6' : 'none'}
                markerEnd={p.style === 'dashed' ? 'url(#arrow-dashed)' : 'url(#arrow-solid)'}
                className="transition-all duration-150 pointer-events-none"
              />
              {p.label && (
                <g transform={`translate(${(p.x1 + p.x2) / 2}, ${(p.y1 + p.y2) / 2})`}>
                  <rect x={-p.label.length * 5 - 8} y="-10" width={p.label.length * 10 + 16} height="20" rx="10"
                    fill={isHovered ? '#fff7ed' : (p.style === 'dashed' ? '#fce7f3' : '#eff6ff')}
                    stroke={isHovered ? '#f97316' : p.color}
                    strokeWidth={isHovered ? 1.5 : 1}
                  />
                  <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="600"
                    fill={p.style === 'dashed' ? '#be185d' : '#1e40af'}>{p.label}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-[100] bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-sm min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {onUpdateConnection && (() => {
            const conn = paths.find(p => p.id === contextMenu.connId);
            return (
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                onClick={() => {
                  setEditingLabel({ connId: contextMenu.connId, label: conn?.label || '' });
                  setContextMenu(null);
                }}
              >
                <span className="text-base">✎</span>
                编辑标签文字
              </button>
            );
          })()}
          {onToggleStyle && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
              onClick={() => { onToggleStyle(contextMenu.connId); setContextMenu(null); }}
            >
              <span className="text-base">↻</span>
              切换线型（实线/虚线）
            </button>
          )}
          {onDeleteConnection && (
            <button
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
              onClick={() => { onDeleteConnection(contextMenu.connId); setContextMenu(null); }}
            >
              <span className="text-base">✕</span>
              删除连线
            </button>
          )}
        </div>
      )}

      {/* Edit label dialog */}
      {editingLabel && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={() => setEditingLabel(null)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800 mb-3">编辑连线标签</h3>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="输入标签文字..."
              autoFocus
              value={editingLabel.label}
              onChange={e => setEditingLabel(l => l ? { ...l, label: e.target.value } : null)}
              onKeyDown={e => {
                if (e.key === 'Enter' && onUpdateConnection) {
                  onUpdateConnection(editingLabel.connId, editingLabel.label, 'solid');
                  setEditingLabel(null);
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                onClick={() => setEditingLabel(null)}
              >取消</button>
              <button
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                onClick={() => {
                  if (onUpdateConnection) {
                    onUpdateConnection(editingLabel.connId, editingLabel.label, 'solid');
                    setEditingLabel(null);
                  }
                }}
              >保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
