import React, { useRef, useState } from 'react';
import { Plus, Star, Link, HelpCircle } from 'lucide-react';
import { JourneyMapData, JourneyNode, Role, SubStage, Connection, LineStyle } from '../types';
import { NodeCard } from './NodeCard';
import { ConnectionOverlay } from './ConnectionOverlay';
import { AttributeRows } from './AttributeRows';
import { ConnectionModal } from './ConnectionModal';

interface JourneyMatrixProps {
  data: JourneyMapData;
  onEditNode: (node: JourneyNode) => void;
  onQuickAddCellNode: (subStageId: string, roleId: string) => void;
  onUpdateAttributeCell: (rowId: string, subStageId: string, value: string) => void;
  onAddAttributeRow: (name?: string, iconName?: string) => void;
  onDeleteAttributeRow: (rowId: string) => void;
  onUpdateAttributeRow?: (rowId: string, name: string, iconName?: string) => void;
  onAddConnection: (sourceId: string, targetId: string, label?: string, style?: LineStyle) => void;
  onDeleteConnection: (connId: string) => void;
  onToggleConnectionStyle: (connId: string) => void;
  onUpdateConnection?: (connId: string, label: string, style: LineStyle) => void;
  showConnections: boolean;
  zoomLevel: number;
}

export const JourneyMatrix: React.FC<JourneyMatrixProps> = ({
  data,
  onEditNode,
  onQuickAddCellNode,
  onUpdateAttributeCell,
  onAddAttributeRow,
  onDeleteAttributeRow,
  onUpdateAttributeRow,
  onAddConnection,
  onDeleteConnection,
  onToggleConnectionStyle,
  onUpdateConnection,
  showConnections,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Connection Modal State
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
    targetId: string;
  } | null>(null);

  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(null);

  const handleStartConnect = (nodeId: string) => {
    if (connectingSourceId === nodeId) {
      setConnectingSourceId(null);
    } else if (connectingSourceId) {
      // Complete connection: open label modal
      setPendingConnection({
        sourceId: connectingSourceId,
        targetId: nodeId,
      });
      setConnectingSourceId(null);
    } else {
      setConnectingSourceId(nodeId);
    }
  };

  const currentEditingConn = data.connections.find((c) => c.id === editingConnectionId);
  const pendingSourceNode = data.nodes.find((n) => n.id === pendingConnection?.sourceId);
  const pendingTargetNode = data.nodes.find((n) => n.id === pendingConnection?.targetId);

  const editingSourceNode = data.nodes.find((n) => n.id === currentEditingConn?.sourceNodeId);
  const editingTargetNode = data.nodes.find((n) => n.id === currentEditingConn?.targetNodeId);

  return (
    <div className="relative w-full overflow-x-auto bg-slate-100 p-4 min-h-[calc(100vh-64px)]">
      {/* Connecting Active Banner */}
      {connectingSourceId && (
        <div className="sticky top-16 z-40 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg mb-3 flex items-center justify-between text-xs animate-bounce">
          <div className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            <span>
              已选中起点节点！请在图中点击 <b>目标节点</b> 以建立箭头连线。
            </span>
          </div>
          <button
            onClick={() => setConnectingSourceId(null)}
            className="px-2 py-1 bg-indigo-800 hover:bg-indigo-900 text-white rounded font-medium"
          >
            取消连线
          </button>
        </div>
      )}

      {/* Main Matrix Board Canvas */}
      <div
        id="journey-export-canvas"
        ref={containerRef}
        className="journey-canvas-area relative min-w-[1200px] bg-white border border-slate-300 rounded-2xl shadow-sm p-4 transition-transform duration-100 origin-top-left"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }}
      >
        {/* SVG Connection Lines */}
        {showConnections && (
          <ConnectionOverlay
            connections={data.connections}
            containerRef={containerRef}
            zoomLevel={zoomLevel}
            onDeleteConnection={onDeleteConnection}
            onToggleStyle={onToggleConnectionStyle}
            onEditConnection={(connId) => setEditingConnectionId(connId)}
          />
        )}

        {/* TOP ROW 1: Stages (阶段) */}
        <div
          className="grid gap-2 mb-2"
          style={{
            gridTemplateColumns: `160px ${data.subStages
              .map(() => 'minmax(150px, 1fr)')
              .join(' ')}`,
          }}
        >
          {/* Header Corner Tile */}
          <div className="bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs">
            阶段与角色矩阵
          </div>

          {/* Render Stage Headers spanning across subStages */}
          {data.stages.map((stage) => {
            const stageSubStages = data.subStages.filter((ss) => ss.stageId === stage.id);
            const colSpan = stageSubStages.length || 1;

            return (
              <div
                key={stage.id}
                className="p-3 rounded-xl text-white font-bold text-sm flex flex-col justify-between shadow-xs border-b-4 border-black/20"
                style={{
                  gridColumn: `span ${colSpan}`,
                  backgroundColor: stage.color || '#3b82f6',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base tracking-wide font-bold">{stage.name}</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-normal">
                    {colSpan} 个场景
                  </span>
                </div>
                {stage.description && (
                  <span className="text-xs font-normal opacity-90 truncate mt-1">
                    {stage.description}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* TOP ROW 2: SubStages / Scenarios (场景) */}
        <div
          className="grid gap-2 mb-3"
          style={{
            gridTemplateColumns: `160px ${data.subStages
              .map(() => 'minmax(150px, 1fr)')
              .join(' ')}`,
          }}
        >
          {/* Label */}
          <div className="bg-slate-200 text-slate-700 p-2.5 rounded-xl flex items-center justify-center font-bold text-sm">
            场景 (Scenarios)
          </div>

          {/* Substage Columns */}
          {data.subStages.map((subStage) => (
            <div
              key={subStage.id}
              className={`p-2.5 rounded-xl border text-center text-sm font-semibold flex items-center justify-center gap-1.5 shadow-2xs ${
                subStage.isKey
                  ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-bold'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {subStage.isKey && <Star className="w-4 h-4 text-amber-600 fill-amber-500" />}
              <span>{subStage.name}</span>
            </div>
          ))}
        </div>

        {/* SWIMLANE ROWS: Roles (角色) */}
        <div className="space-y-2">
          {data.roles.map((role) => (
            <div
              key={role.id}
              className="grid gap-2 min-h-[110px]"
              style={{
                gridTemplateColumns: `160px ${data.subStages
                  .map(() => 'minmax(150px, 1fr)')
                  .join(' ')}`,
              }}
            >
              {/* Left Role Swimlane Header */}
              <div
                className="p-3 rounded-xl border flex flex-col justify-between shadow-2xs text-white"
                style={{ backgroundColor: role.color || '#3b82f6' }}
              >
                <div>
                  <div className="text-sm font-bold tracking-wide">{role.name}</div>
                  {role.subtitle && (
                    <div className="text-xs opacity-90 mt-1 leading-tight">{role.subtitle}</div>
                  )}
                </div>
                <div className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded uppercase self-start mt-2 font-medium">
                  {role.category}
                </div>
              </div>

              {/* Grid Cells for this Role */}
              {data.subStages.map((subStage) => {
                const cellNodes = data.nodes.filter(
                  (n) => n.subStageId === subStage.id && n.roleId === role.id
                );

                return (
                  <div
                    key={`${role.id}-${subStage.id}`}
                    onDoubleClick={() => onQuickAddCellNode(subStage.id, role.id)}
                    className="group relative bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-1.5 transition-colors flex flex-col gap-2 min-h-[100px]"
                  >
                    {cellNodes.length > 0 ? (
                      cellNodes.map((node) => (
                        <NodeCard
                          key={node.id}
                          node={node}
                          role={role}
                          onEdit={onEditNode}
                          onStartConnect={handleStartConnect}
                          isConnectSource={connectingSourceId === node.id}
                        />
                      ))
                    ) : (
                      <button
                        onClick={() => onQuickAddCellNode(subStage.id, role.id)}
                        className="w-full h-full min-h-[80px] rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                        title="双击或点击新增节点卡片"
                      >
                        <Plus className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">添加节点</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* BOTTOM ROWS: Attribute Extensions */}
        <AttributeRows
          subStages={data.subStages}
          attributeRows={data.attributeRows}
          onUpdateAttributeCell={onUpdateAttributeCell}
          onAddAttributeRow={onAddAttributeRow}
          onDeleteAttributeRow={onDeleteAttributeRow}
          onUpdateAttributeRow={onUpdateAttributeRow}
        />
      </div>

      {/* Connection Modal: New Connection */}
      <ConnectionModal
        isOpen={!!pendingConnection}
        onClose={() => setPendingConnection(null)}
        sourceTitle={pendingSourceNode?.title}
        targetTitle={pendingTargetNode?.title}
        initialLabel="流转"
        initialStyle="solid"
        isEditing={false}
        onConfirm={(label, style) => {
          if (pendingConnection) {
            onAddConnection(pendingConnection.sourceId, pendingConnection.targetId, label, style);
          }
        }}
      />

      {/* Connection Modal: Edit Connection */}
      <ConnectionModal
        isOpen={!!editingConnectionId}
        onClose={() => setEditingConnectionId(null)}
        sourceTitle={editingSourceNode?.title}
        targetTitle={editingTargetNode?.title}
        initialLabel={currentEditingConn?.label}
        initialStyle={currentEditingConn?.style}
        isEditing={true}
        onConfirm={(label, style) => {
          if (editingConnectionId && onUpdateConnection) {
            onUpdateConnection(editingConnectionId, label, style);
          }
        }}
        onDelete={() => {
          if (editingConnectionId) {
            onDeleteConnection(editingConnectionId);
            setEditingConnectionId(null);
          }
        }}
      />
    </div>
  );
};
