import React, { useState } from 'react';
import {
  Smartphone,
  MessageSquare,
  BarChart2,
  Compass,
  Edit2,
  Plus,
  Trash2,
  ShieldAlert,
  X,
} from 'lucide-react';
import { AttributeRow, SubStage } from '../types';

interface AttributeRowsProps {
  subStages: SubStage[];
  attributeRows: AttributeRow[];
  onUpdateAttributeCell: (rowId: string, subStageId: string, value: string) => void;
  onAddAttributeRow?: (name?: string, iconName?: string) => void;
  onDeleteAttributeRow?: (rowId: string) => void;
  onUpdateAttributeRow?: (rowId: string, name: string, iconName?: string) => void;
}

export const AttributeRows: React.FC<AttributeRowsProps> = ({
  subStages,
  attributeRows,
  onUpdateAttributeCell,
  onAddAttributeRow,
  onDeleteAttributeRow,
  onUpdateAttributeRow,
}) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; subStageId: string } | null>(null);
  const [cellText, setCellText] = useState('');

  // Modal state for adding a row
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Smartphone');

  // Modal state for editing a row
  const [editingRow, setEditingRow] = useState<AttributeRow | null>(null);
  const [editRowName, setEditRowName] = useState('');
  const [editRowIcon, setEditRowIcon] = useState('Smartphone');

  // Modal state for deleting a row
  const [deletingRow, setDeletingRow] = useState<AttributeRow | null>(null);

  const getRowIcon = (iconName?: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'BarChart2':
        return <BarChart2 className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Smartphone className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const handleStartEditCell = (rowId: string, subStageId: string, currentValue: string) => {
    setEditingCell({ rowId, subStageId });
    setCellText(currentValue || '');
  };

  const handleSaveEditCell = () => {
    if (editingCell) {
      onUpdateAttributeCell(editingCell.rowId, editingCell.subStageId, cellText);
      setEditingCell(null);
    }
  };

  const handleOpenAddModal = () => {
    setNewRowName('');
    setSelectedIcon('Smartphone');
    setIsAddModalOpen(true);
  };

  const handleConfirmAdd = () => {
    const finalName = newRowName.trim() || '新增属性维度';
    if (onAddAttributeRow) {
      onAddAttributeRow(finalName, selectedIcon);
    }
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (row: AttributeRow) => {
    setEditingRow(row);
    setEditRowName(row.name);
    setEditRowIcon(row.iconName || 'Smartphone');
  };

  const handleConfirmEditRow = () => {
    if (editingRow && onUpdateAttributeRow) {
      const finalName = editRowName.trim() || editingRow.name;
      onUpdateAttributeRow(editingRow.id, finalName, editRowIcon);
    }
    setEditingRow(null);
  };

  const handleConfirmDeleteRow = () => {
    if (deletingRow && onDeleteAttributeRow) {
      onDeleteAttributeRow(deletingRow.id);
    }
    setDeletingRow(null);
  };

  const presets = [
    { label: '触点与工具', icon: 'Smartphone' },
    { label: '客户声音 (VOC)', icon: 'MessageSquare' },
    { label: '核心指标 (KPI)', icon: 'BarChart2' },
    { label: '专项优化规划', icon: 'Compass' },
    { label: '体验卡点与风险', icon: 'ShieldAlert' },
  ];

  return (
    <div className="mt-4 border-t-2 border-slate-300 pt-3">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4.5 h-4.5 text-blue-600" />
          <span>扩展分析维度 (触点 / VOC / PV / 专项规划)</span>
        </h3>
        {onAddAttributeRow && (
          <button
            onClick={handleOpenAddModal}
            className="text-xs bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>新增属性维度行</span>
          </button>
        )}
      </div>

      {attributeRows.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-500 my-2">
          <p className="text-sm mb-2">暂无属性分析维度，您可自由新增如【产品触点】、【VOC反馈】、【考核KPI】等评估行。</p>
          {onAddAttributeRow && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新增第一个属性维度行</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {attributeRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[160px_1fr] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Left Row Header */}
              <div className="bg-slate-100 p-2.5 border-r border-slate-200 flex items-center justify-between group">
                <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0 pr-1">
                  {getRowIcon(row.iconName)}
                  <span
                    className="text-sm font-bold text-slate-800 truncate"
                    title={row.name}
                  >
                    {row.name}
                  </span>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {onUpdateAttributeRow && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(row)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="重命名或修改图标"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteAttributeRow && (
                    <button
                      type="button"
                      onClick={() => setDeletingRow(row)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="删除此维度行"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* SubStage Values Row */}
              <div
                className="grid gap-1.5 p-1 bg-white"
                style={{
                  gridTemplateColumns: `repeat(${subStages.length}, minmax(140px, 1fr))`,
                }}
              >
                {subStages.map((subStage) => {
                  const isEditing =
                    editingCell?.rowId === row.id && editingCell?.subStageId === subStage.id;
                  const value = row.values[subStage.id] || '';

                  return (
                    <div
                      key={subStage.id}
                      className="group relative bg-slate-50/70 border border-slate-100 hover:border-blue-300 rounded-lg p-2 transition-colors cursor-pointer text-sm flex flex-col justify-center min-h-[56px]"
                      onClick={() => !isEditing && handleStartEditCell(row.id, subStage.id, value)}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={cellText}
                            onChange={(e) => setCellText(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && !e.shiftKey && handleSaveEditCell()
                            }
                            autoFocus
                            rows={2}
                            className="w-full text-xs p-1 border border-blue-500 rounded bg-white text-slate-800 focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={handleSaveEditCell}
                              className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium"
                            >
                              确定
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-xs rounded"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">
                            {value || <span className="text-slate-300 italic">点击添加...</span>}
                          </div>
                          <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 absolute top-1 right-1 transition-opacity" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Adding Attribute Dimension Row */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">新增属性分析维度</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  维度名称 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newRowName}
                  onChange={(e) => setNewRowName(e.target.value)}
                  placeholder="例如：体验卡点 / 转化率KPI / 关键触点..."
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">快捷预设参考：</label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setNewRowName(p.label);
                        setSelectedIcon(p.icon);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">图标类型：</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'Smartphone', icon: <Smartphone className="w-4 h-4 text-blue-400" />, label: '触点' },
                    { id: 'MessageSquare', icon: <MessageSquare className="w-4 h-4 text-emerald-400" />, label: '反馈' },
                    { id: 'BarChart2', icon: <BarChart2 className="w-4 h-4 text-amber-400" />, label: '数据' },
                    { id: 'Compass', icon: <Compass className="w-4 h-4 text-purple-400" />, label: '规划' },
                    { id: 'ShieldAlert', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, label: '风险' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        selectedIcon === item.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-md"
              >
                确认添加维度
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Attribute Dimension Row */}
      {editingRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">修改属性分析维度</h3>
              </div>
              <button
                onClick={() => setEditingRow(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">维度名称</label>
                <input
                  type="text"
                  value={editRowName}
                  onChange={(e) => setEditRowName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirmEditRow()}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">更换图标：</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'Smartphone', icon: <Smartphone className="w-4 h-4 text-blue-400" />, label: '触点' },
                    { id: 'MessageSquare', icon: <MessageSquare className="w-4 h-4 text-emerald-400" />, label: '反馈' },
                    { id: 'BarChart2', icon: <BarChart2 className="w-4 h-4 text-amber-400" />, label: '数据' },
                    { id: 'Compass', icon: <Compass className="w-4 h-4 text-purple-400" />, label: '规划' },
                    { id: 'ShieldAlert', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, label: '风险' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEditRowIcon(item.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        editRowIcon === item.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmEditRow}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-md"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Row */}
      {deletingRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center space-y-3">
              <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">确认删除维度行？</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  您确定要删除 <span className="text-rose-400 font-semibold">【{deletingRow.name}】</span> 吗？此操作将清除该维度下填写的所有单元格数据。
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 border-t border-slate-700/80 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRow(null)}
                className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRow}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs shadow-md"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

