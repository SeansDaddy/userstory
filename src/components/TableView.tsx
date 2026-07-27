import React, { useState } from 'react';
import { JourneyMapData, JourneyNode } from '../types';
import { Search, Filter, Plus, Edit2, Trash2, Star, CheckCircle2 } from 'lucide-react';

interface TableViewProps {
  data: JourneyMapData;
  onEditNode: (node: JourneyNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onOpenAddCard: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  data,
  onEditNode,
  onDeleteNode,
  onOpenAddCard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [onlyKey, setOnlyKey] = useState(false);

  const filteredNodes = data.nodes.filter((node) => {
    const subStage = data.subStages.find((s) => s.id === node.subStageId);
    const stage = subStage ? data.stages.find((st) => st.id === subStage.stageId) : undefined;
    const matchesSearch =
      (node.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || node.roleId === selectedRole;
    const matchesStage = selectedStage === 'all' || stage?.id === selectedStage;
    const matchesKey = !onlyKey || node.isKey;

    return matchesSearch && matchesRole && matchesStage && matchesKey;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Controls Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索卡片标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">所有阶段 (All Stages)</option>
              {data.stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.name}
                </option>
              ))}
            </select>

            {/* Role filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="all">所有角色泳道 (All Roles)</option>
              {data.roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* Only Key filter */}
            <button
              onClick={() => setOnlyKey(!onlyKey)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 font-medium transition-colors ${
                onlyKey
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>仅看关键触点 (★)</span>
            </button>

            {/* Add Node button */}
            <button
              onClick={onOpenAddCard}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建节点</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">阶段 / 场景</th>
                <th className="p-3">角色泳道</th>
                <th className="p-3">卡片标题</th>
                <th className="p-3">卡片描述</th>
                <th className="p-3 text-center">关键触点</th>
                <th className="p-3 text-center">状态</th>
                <th className="p-3 text-center">满意度</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => {
                  const subStage = data.subStages.find((s) => s.id === node.subStageId);
                  const stage = subStage ? data.stages.find((st) => st.id === subStage.stageId) : undefined;
                  const role = data.roles.find((r) => r.id === node.roleId);

                  return (
                    <tr key={node.id} className="hover:bg-slate-750 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{stage?.name}</div>
                        <div className="text-[11px] text-slate-400">{subStage?.name}</div>
                      </td>

                      <td className="p-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                          style={{ backgroundColor: role?.color || '#3b82f6' }}
                        >
                          {role?.name}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-white max-w-xs">{node.title}</td>

                      <td className="p-3 text-slate-400 max-w-sm truncate">{node.description || '-'}</td>

                      <td className="p-3 text-center">
                        {node.isKey ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            <Star className="w-3 h-3 fill-amber-400" />
                            ★ 关键
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span className="capitalize px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px]">
                          {node.status || 'planned'}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono text-amber-400 font-bold">
                        {node.emotion ? `${node.emotion}/5` : '-'}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditNode(node)}
                            className="p-1 hover:bg-slate-700 text-blue-400 rounded"
                            title="编辑"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteNode(node.id)}
                            className="p-1 hover:bg-slate-700 text-rose-400 rounded"
                            title="删除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    未找到匹配的卡片节点
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
