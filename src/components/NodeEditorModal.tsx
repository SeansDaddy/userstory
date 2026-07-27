import React, { useState, useEffect } from 'react';
import { X, Star, Trash2, Link, ArrowRight, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { JourneyMapData, JourneyNode, Connection, CardStatus } from '../types';

interface NodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: Partial<JourneyNode> | null;
  data: JourneyMapData;
  onSaveNode: (node: JourneyNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddConnection: (sourceId: string, targetId: string, label?: string, style?: 'solid' | 'dashed') => void;
  onDeleteConnection: (connId: string) => void;
}

export const NodeEditorModal: React.FC<NodeEditorModalProps> = ({
  isOpen,
  onClose,
  node,
  data,
  onSaveNode,
  onDeleteNode,
  onAddConnection,
  onDeleteConnection,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subStageId, setSubStageId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isKey, setIsKey] = useState(false);
  const [status, setStatus] = useState<CardStatus>('planned');
  const [emotion, setEmotion] = useState<number>(4);

  // New connection form inside inspector
  const [targetNodeId, setTargetNodeId] = useState('');
  const [connLabel, setConnLabel] = useState('');
  const [connStyle, setConnStyle] = useState<'solid' | 'dashed'>('solid');

  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setDescription(node.description || '');
      setSubStageId(node.subStageId || data.subStages[0]?.id || '');
      setRoleId(node.roleId || data.roles[0]?.id || '');
      setIsKey(!!node.isKey);
      setStatus(node.status || 'completed');
      setEmotion(node.emotion || 4);
    }
  }, [node, data]);

  if (!isOpen || !node) return null;

  const isNew = !node.id;
  const currentConnections = data.connections.filter((c) => c.sourceNodeId === node.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedNode: JourneyNode = {
      id: node.id || `n_${Date.now()}`,
      subStageId,
      roleId,
      title: title.trim(),
      description: description.trim(),
      isKey,
      status,
      emotion,
    };

    onSaveNode(savedNode);
    onClose();
  };

  const handleCreateConnection = () => {
    if (node.id && targetNodeId) {
      onAddConnection(node.id, targetNodeId, connLabel, connStyle);
      setTargetNodeId('');
      setConnLabel('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Star className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              {isNew ? '新建旅程卡片节点' : '编辑卡片节点与逻辑关系'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs text-slate-200">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              卡片标题 (Action Title) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：在线方案设计→工勘→刷新方案"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">详细描述 / 业务说明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="详细描述该节点的核心动作、交付产物或系统逻辑..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Substage & Role selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">所属场景 / 阶段</label>
              <select
                value={subStageId}
                onChange={(e) => setSubStageId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {data.subStages.map((ss) => {
                  const stage = data.stages.find((st) => st.id === ss.stageId);
                  return (
                    <option key={ss.id} value={ss.id}>
                      [{stage?.name || '阶段'}] {ss.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">所属角色泳道</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {data.roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Milestone & Status & Emotion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            {/* Key toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isKeyNode"
                checked={isKey}
                onChange={(e) => setIsKey(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
              />
              <label htmlFor="isKeyNode" className="font-semibold text-amber-400 cursor-pointer flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                标记为关键触点 (★)
              </label>
            </div>

            {/* Status select */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">执行状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CardStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value="completed">✅ 已完成</option>
                <option value="in_progress">⏱️ 进行中</option>
                <option value="planned">📅 规划中</option>
                <option value="issue">⚠️ 体验卡点</option>
              </select>
            </div>

            {/* Emotion score */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">满意度 (1~5分)</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              >
                <option value={5}>5分 - 极满意 (峰值)</option>
                <option value={4}>4分 - 满意</option>
                <option value={3}>3分 - 一般</option>
                <option value={2}>2分 - 不太满意</option>
                <option value={1}>1分 - 不满 (卡点)</option>
              </select>
            </div>
          </div>

          {/* Connection Arrows Section */}
          {!isNew && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-2">
                <Link className="w-4 h-4" />
                <span>指向其他节点的逻辑连线 (Output Arrows)</span>
              </div>

              {/* Current Connections List */}
              <div className="space-y-1.5 mb-3">
                {currentConnections.map((conn) => {
                  const targetNode = data.nodes.find((n) => n.id === conn.targetNodeId);

                  return (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-2 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        <span>指向：<b>{targetNode?.title || conn.targetNodeId}</b></span>
                        {conn.label && (
                          <span className="px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded text-[10px]">
                            {conn.label}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">({conn.style === 'dashed' ? '虚线' : '实线'})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteConnection(conn.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="删除关联线"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Connection inline controls */}
              <div className="p-2.5 bg-slate-800/50 border border-slate-700/80 rounded-xl space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
                  >
                    <option value="">选择目标卡片...</option>
                    {data.nodes
                      .filter((n) => n.id !== node.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.title}
                        </option>
                      ))}
                  </select>

                  <input
                    type="text"
                    placeholder="连线标签 (如: 专家远程协助)"
                    value={connLabel}
                    onChange={(e) => setConnLabel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
                  />

                  <select
                    value={connStyle}
                    onChange={(e) => setConnStyle(e.target.value as 'solid' | 'dashed')}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white"
                  >
                    <option value="solid">—— 实线 (Solid)</option>
                    <option value="dashed">- - - 虚线 (Dashed)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCreateConnection}
                  disabled={!targetNodeId}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                    targetNodeId
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新增指向连线</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {!isNew ? (
              <button
                type="button"
                onClick={() => {
                  if (node.id) {
                    onDeleteNode(node.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除节点</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md"
              >
                保存节点
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
