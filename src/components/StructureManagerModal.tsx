import React, { useState } from 'react';
import { X, Plus, Trash2, Layers, Users, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { JourneyMapData, Stage, SubStage, Role } from '../types';

interface StructureManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: JourneyMapData;
  onUpdateStructure: (updatedData: JourneyMapData) => void;
}

export const StructureManagerModal: React.FC<StructureManagerModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateStructure,
}) => {
  const [activeTab, setActiveTab] = useState<'stages' | 'subStages' | 'roles'>('stages');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Local state copy
  const [stages, setStages] = useState<Stage[]>(data.stages);
  const [subStages, setSubStages] = useState<SubStage[]>(data.subStages);
  const [roles, setRoles] = useState<Role[]>(data.roles);

  // Sync local state with current data every time modal opens
  const prevDataRef = React.useRef(data);
  if (isOpen && prevDataRef.current !== data) {
    prevDataRef.current = data;
    setStages(data.stages);
    setSubStages(data.subStages);
    setRoles(data.roles);
  }

  if (!isOpen) return null;

  const handleSaveAll = () => {
    onUpdateStructure({
      ...data,
      stages,
      subStages,
      roles,
    });
    onClose();
  };

  // Stage operations
  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stg_${Date.now()}`,
      name: '新阶段',
      color: '#3b82f6',
      description: '阶段描述...',
      order: stages.length + 1,
    };
    // 如果有选中的阶段，插入到它后面；否则追加到末尾
    if (selectedStageId) {
      const idx = stages.findIndex(s => s.id === selectedStageId);
      if (idx !== -1) {
        const copy = [...stages];
        copy.splice(idx + 1, 0, newStage);
        setStages(copy);
        return;
      }
    }
    setStages([...stages, newStage]);
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
    setSubStages(subStages.filter((ss) => ss.stageId !== id));
  };

  // SubStage operations
  const handleAddSubStage = (stageId: string) => {
    const newSubStage: SubStage = {
      id: `sstg_${Date.now()}`,
      stageId,
      name: '新场景/子阶段',
      isKey: false,
      order: subStages.length + 1,
    };
    setSubStages([...subStages, newSubStage]);
  };

  const handleDeleteSubStage = (id: string) => {
    setSubStages(subStages.filter((ss) => ss.id !== id));
  };

  // Role operations
  const handleAddRole = () => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: '新角色泳道',
      subtitle: '角色描述',
      category: 'partner',
      color: '#059669',
      order: roles.length + 1,
    };
    setRoles([...roles, newRole]);
  };

  const handleDeleteRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">架构与泳道自定义管理</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-6 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'stages'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            主阶段 (Stages - {stages.length})
          </button>

          <button
            onClick={() => setActiveTab('subStages')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'subStages'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            场景/子阶段 (Scenarios - {subStages.length})
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            角色泳道 (Swimlane Roles - {roles.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-200">
          {/* TAB 1: STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">编辑大阶段名称与配色</span>
                <button
                  onClick={handleAddStage}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加主阶段</span>
                </button>
              </div>

              {stages.map((stg) => (
                <div
                  key={stg.id}
                  className={`p-3 rounded-xl space-y-2 cursor-pointer transition-colors ${
                    selectedStageId === stg.id
                      ? 'bg-blue-900/40 border-2 border-blue-500'
                      : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedStageId(stg.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={stg.color || '#3b82f6'}
                      onChange={(e) =>
                        setStages(
                          stages.map((s) => (s.id === stg.id ? { ...s, color: e.target.value } : s))
                        )
                      }
                      className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={stg.name}
                      onChange={(e) =>
                        setStages(
                          stages.map((s) => (s.id === stg.id ? { ...s, name: e.target.value } : s))
                        )
                      }
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                    <button
                      onClick={() => handleDeleteStage(stg.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="删除阶段"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={stg.description || ''}
                    placeholder="阶段描述..."
                    onChange={(e) =>
                      setStages(
                        stages.map((s) =>
                          s.id === stg.id ? { ...s, description: e.target.value } : s
                        )
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SUBSTAGES / SCENARIOS */}
          {activeTab === 'subStages' && (
            <div className="space-y-4">
              {stages.map((stg) => {
                const stageSubStages = subStages.filter((ss) => ss.stageId === stg.id);

                return (
                  <div key={stg.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-700">
                      <span className="font-bold text-blue-400">{stg.name} 包含的场景</span>
                      <button
                        onClick={() => handleAddSubStage(stg.id)}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>在此阶段加场景</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {stageSubStages.map((ss) => (
                        <div
                          key={ss.id}
                          className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700/80 rounded-lg"
                        >
                          <input
                            type="text"
                            value={ss.name}
                            onChange={(e) =>
                              setSubStages(
                                subStages.map((item) =>
                                  item.id === ss.id ? { ...item, name: e.target.value } : item
                                )
                              )
                            }
                            className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                          <label className="flex items-center gap-1 text-amber-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!ss.isKey}
                              onChange={(e) =>
                                setSubStages(
                                  subStages.map((item) =>
                                    item.id === ss.id ? { ...item, isKey: e.target.checked } : item
                                  )
                                )
                              }
                              className="rounded text-amber-500"
                            />
                            <span>★ 关键场景</span>
                          </label>
                          <button
                            onClick={() => handleDeleteSubStage(ss.id)}
                            className="text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">编辑角色泳道名称、副标题与主题色</span>
                <button
                  onClick={handleAddRole}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加泳道角色</span>
                </button>
              </div>

              {roles.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={r.color || '#3b82f6'}
                      onChange={(e) =>
                        setRoles(
                          roles.map((item) =>
                            item.id === r.id ? { ...item, color: e.target.value } : item
                          )
                        )
                      }
                      className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) =>
                        setRoles(
                          roles.map((item) =>
                            item.id === r.id ? { ...item, name: e.target.value } : item
                          )
                        )
                      }
                      placeholder="角色名称"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold"
                    />
                    <select
                      value={r.category}
                      onChange={(e) =>
                        setRoles(
                          roles.map((item) =>
                            item.id === r.id ? { ...item, category: e.target.value as any } : item
                          )
                        )
                      }
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300"
                    >
                      <option value="customer">Customer (客户)</option>
                      <option value="partner">Partner (伙伴)</option>
                      <option value="vendor">Vendor (厂商)</option>
                      <option value="internal">Internal (内部团队)</option>
                    </select>
                    <button onClick={() => handleDeleteRole(r.id)} className="text-rose-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={r.subtitle || ''}
                    placeholder="副标题/岗位描述 (例如：销售, 安装, 运维)..."
                    onChange={(e) =>
                      setRoles(
                        roles.map((item) =>
                          item.id === r.id ? { ...item, subtitle: e.target.value } : item
                        )
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md"
          >
            保存并应用架构
          </button>
        </div>
      </div>
    </div>
  );
};
