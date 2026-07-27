import React, { useRef } from 'react';
import {
  Grid,
  GitCommit,
  TrendingUp,
  Table as TableIcon,
  Plus,
  Bot,
  Download,
  Upload,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileJson,
  Eye,
  EyeOff,
  Sun,
  Edit2
} from 'lucide-react';
import { ActiveView } from '../types';

interface HeaderProps {
  title: string;
  setTitle: (t: string) => void;
  description: string;
  setDescription: (d: string) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onOpenAddCard: () => void;
  onOpenStructureModal: () => void;
  onOpenAiDrawer: () => void;
  onLoadPreset: (presetKey: string) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportImage: () => void;
  onImportJson: (file: File) => void;
  onResetDefault: () => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  showConnections: boolean;
  setShowConnections: (show: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  activeView,
  setActiveView,
  onOpenAddCard,
  onOpenStructureModal,
  onOpenAiDrawer,
  onLoadPreset,
  onExportJson,
  onExportCsv,
  onExportImage,
  onImportJson,
  onResetDefault,
  zoomLevel,
  setZoomLevel,
  showConnections,
  setShowConnections,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [showPresetMenu, setShowPresetMenu] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="max-w-[1920px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Map Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg text-white font-medium shadow-sm">
            <Layers className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wide">旅程地图编辑器</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Title & Editable Input */}
          <div className="group relative flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="bg-slate-800 border border-blue-500 rounded px-2 py-1 text-sm text-white focus:outline-none w-72"
                />
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                >
                  保存
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded transition-colors group"
                title="点击修改图表标题"
              >
                <h1 className="text-base font-bold text-slate-100 group-hover:text-blue-400 max-w-xs md:max-w-md truncate">
                  {title}
                </h1>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Center: View Switchers */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'matrix'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>矩阵视图</span>
          </button>

          <button
            onClick={() => setActiveView('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'flow'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>流程看板</span>
          </button>

          <button
            onClick={() => setActiveView('emotion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'emotion'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>情绪触点</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeView === 'table'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>清单表格</span>
          </button>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${
                !canUndo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="撤销 (Undo)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${
                !canRedo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="重做 (Redo)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Connections */}
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
              showConnections
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="显示/隐藏节点连线"
          >
            {showConnections ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{showConnections ? '隐藏连线' : '显示连线'}</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1.5 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-white text-[11px]"
              title="重置缩放"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-colors"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>预设模板</span>
            </button>
            {showPresetMenu && (
              <div
                className="absolute right-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs"
                onMouseLeave={() => setShowPresetMenu(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  选择预设旅程
                </div>
                <button
                  onClick={() => {
                    onLoadPreset('solar');
                    setShowPresetMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center justify-between"
                >
                  <span>☀️ 华为/光伏储能旅程 (默认)</span>
                </button>
                <button
                  onClick={() => {
                    onLoadPreset('ev');
                    setShowPresetMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center justify-between"
                >
                  <span>🚗 新能源汽车购车旅程</span>
                </button>
                <button
                  onClick={() => {
                    onLoadPreset('blank');
                    setShowPresetMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center justify-between border-t border-slate-700"
                >
                  <span>📝 空白旅程图 (自定义)</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Card & Structure buttons */}
          <button
            onClick={onOpenAddCard}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加节点</span>
          </button>

          <button
            onClick={onOpenStructureModal}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-colors"
            title="管理阶段、子场景与泳道角色"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">管理结构</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiDrawer}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all animate-pulse hover:animate-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 助手</span>
          </button>

          {/* Export / Import Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="导入/导出"
            >
              <Download className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 py-1 text-xs"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">数据导出</div>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
                >
                  <FileJson className="w-3.5 h-3.5 text-blue-400" />
                  <span>导出 JSON 文件</span>
                </button>

                <button
                  onClick={() => {
                    onExportCsv();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>导出 CSV 清单</span>
                </button>

                <div className="border-t border-slate-700 my-1" />
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400">文件导入</div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-200 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-400" />
                  <span>导入 JSON 数据</span>
                </button>

                <button
                  onClick={() => {
                    onResetDefault();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-700 text-slate-200 flex items-center gap-2 text-rose-300 hover:text-rose-200 border-t border-slate-700 mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置为默认数据</span>
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
