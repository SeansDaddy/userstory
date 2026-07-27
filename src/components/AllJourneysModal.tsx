import React, { useState } from 'react';
import { JourneyMapData } from '../types';
import {
  FolderKanban,
  Plus,
  Save,
  Copy,
  Trash2,
  Check,
  Search,
  Sparkles,
  Edit3,
  Download,
  Calendar,
  X,
  Compass,
  ArrowRight
} from 'lucide-react';

interface AllJourneysModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentJourney: JourneyMapData;
  savedJourneys: JourneyMapData[];
  onSelectJourney: (journey: JourneyMapData) => void;
  onSaveCurrentJourney: () => void;
  onCreateNewJourney: () => void;
  onDuplicateJourney: (journeyId: string) => void;
  onDeleteJourney: (journeyId: string) => void;
  onRenameJourney: (journeyId: string, newTitle: string) => void;
  onExportJourneyJson: (journey: JourneyMapData) => void;
}

export const AllJourneysModal: React.FC<AllJourneysModalProps> = ({
  isOpen,
  onClose,
  currentJourney,
  savedJourneys,
  onSelectJourney,
  onSaveCurrentJourney,
  onCreateNewJourney,
  onDuplicateJourney,
  onDeleteJourney,
  onRenameJourney,
  onExportJourneyJson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  if (!isOpen) return null;

  const filteredJourneys = savedJourneys.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.description && j.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStartRename = (j: JourneyMapData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(j.id);
    setEditingTitle(j.title);
  };

  const handleConfirmRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameJourney(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md text-white">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                所有用户旅程
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-normal border border-blue-500/30">
                  {savedJourneys.length} 个地图
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                管理并快速切换您的所有预设与自定义保存的用户旅程地图
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSaveCurrentJourney}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow transition-all"
              title="将当前工作台的最新修改保存到旅程库"
            >
              <Save className="w-4 h-4" />
              <span>保存当前旅程</span>
            </button>

            <button
              onClick={onCreateNewJourney}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>新建空白旅程</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索旅程标题或描述关键字..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            当前激活：<strong className="text-slate-200">{currentJourney.title}</strong>
          </div>
        </div>

        {/* Journeys Grid / List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJourneys.map((j) => {
            const isActive = j.id === currentJourney.id || (j.title === currentJourney.title && j.id.startsWith('solar'));
            const isPreset = j.id.includes('preset') || j.id.includes('solar') || j.id.includes('ev');

            return (
              <div
                key={j.id}
                onClick={() => {
                  onSelectJourney(j);
                  onClose();
                }}
                className={`group relative bg-slate-800/80 hover:bg-slate-800 border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      {editingId === j.id ? (
                        <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename(j.id, e as any)}
                            autoFocus
                            className="bg-slate-900 border border-blue-500 rounded px-2 py-1 text-sm text-white w-full"
                          />
                          <button
                            onClick={(e) => handleConfirmRename(j.id, e)}
                            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          {j.title}
                          <button
                            onClick={(e) => handleStartRename(j, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-300 p-0.5 rounded transition-opacity"
                            title="重命名旅程"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </h3>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> 当前使用
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          isPreset
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isPreset ? '内置预设' : '自定义保存'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {j.description || '暂无说明描述...'}
                  </p>
                </div>

                {/* Footer metrics & actions */}
                <div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 py-2 border-t border-slate-700/60 mb-3">
                    <span>阶段: <strong className="text-slate-200">{j.stages?.length || 0}</strong></span>
                    <span>场景: <strong className="text-slate-200">{j.subStages?.length || 0}</strong></span>
                    <span>角色: <strong className="text-slate-200">{j.roles?.length || 0}</strong></span>
                    <span>卡片: <strong className="text-slate-200">{j.nodes?.length || 0}</strong></span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{j.updatedAt || '最近更新'}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDuplicateJourney(j.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        title="复制为新副本"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onExportJourneyJson(j)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors"
                        title="导出 JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {!isPreset && (
                        <button
                          onClick={() => {
                            if (confirm(`确定要删除自定义旅程“${j.title}”吗？`)) {
                              onDeleteJourney(j.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="删除旅程"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectJourney(j);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-blue-600/90 hover:bg-blue-500 text-white rounded-lg font-medium text-xs flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <span>载入视图</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredJourneys.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <FolderKanban className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">未查找到匹配的用户旅程</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
