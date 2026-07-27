import React, { useRef } from 'react';
import {
  Grid,
  GitCommit,
  TrendingUp,
  Table as TableIcon,
  Plus,
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
  FileImage,
  Eye,
  EyeOff,
  Compass,
  FolderKanban,
  Edit2,
  Save,
  Copy,
  Check
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
  onOpenAllJourneys: () => void;
  onSaveCurrentJourney: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onExportImage: () => void;
  onCopyImage: () => void;
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
  onOpenAllJourneys,
  onSaveCurrentJourney,
  onExportJson,
  onExportCsv,
  onExportImage,
  onCopyImage,
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
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-lg w-full">
      {/* Top Bar - Edge to Edge Single Line without scrollbars */}
      <div className="w-full px-3 sm:px-4 flex items-center justify-between gap-2.5 whitespace-nowrap h-16">
        {/* Left: Brand & Map Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-3 py-1.5 rounded-xl text-white font-medium shadow-md">
            <Compass className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="text-sm font-bold tracking-wide">用户旅程地图</span>
            <span className="text-xs bg-white/20 text-white px-1.5 py-0.2 rounded font-mono">2026</span>
          </div>

          <div className="h-6 w-[1px] bg-slate-700/80 hidden sm:block" />

          {/* Title & Editable Input */}
          <div className="group relative flex items-center gap-1.5">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="bg-slate-800 border border-blue-500 rounded-lg px-2.5 py-1 text-sm text-white focus:outline-none w-56 font-semibold"
                />
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-medium shadow-sm"
                >
                  保存
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-slate-800/90 px-2.5 py-1 rounded-lg transition-colors group border border-transparent hover:border-slate-700/60"
                title="点击修改图表标题"
              >
                <h1 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-blue-300 max-w-[160px] sm:max-w-[220px] xl:max-w-xs truncate">
                  {title}
                </h1>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        </div>

        {/* Center: View Switchers */}
        <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 shadow-inner shrink-0">
          <button
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'matrix'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>矩阵视图</span>
          </button>

          <button
            onClick={() => setActiveView('flow')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'flow'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            <span>流程看板</span>
          </button>

          <button
            onClick={() => setActiveView('emotion')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'emotion'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>情绪触点</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeView === 'table'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>清单表格</span>
          </button>
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700/80 p-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${
                !canUndo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="撤销 (Undo)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${
                !canRedo ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              title="重做 (Redo)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle Connections */}
          <button
            onClick={() => setShowConnections(!showConnections)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all ${
              showConnections
                ? 'bg-indigo-600/30 border-indigo-500/80 text-indigo-200'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="显示/隐藏节点连线"
          >
            {showConnections ? <Eye className="w-4 h-4 text-indigo-400" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden xl:inline">{showConnections ? '隐藏连线' : '显示连线'}</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-slate-800/90 rounded-xl border border-slate-700/80 px-1.5 py-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-slate-200 px-1.5 min-w-[38px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 text-xs font-medium"
              title="重置缩放"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* All Journeys Button */}
          <button
            onClick={onOpenAllJourneys}
            className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600/80 text-slate-100 text-sm rounded-xl flex items-center gap-1.5 font-semibold shadow-sm transition-all group"
            title="查看所有预设与自定义保存的用户旅程"
          >
            <FolderKanban className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">所有用户旅程</span>
          </button>

          {/* Save Journey Quick Button */}
          <button
            onClick={onSaveCurrentJourney}
            className="px-3 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-600/80 text-white text-sm font-semibold rounded-xl flex items-center gap-1 shadow-sm transition-all"
            title="快速保存当前旅程修改"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">保存</span>
          </button>

          {/* Add Card & Structure buttons */}
          <button
            onClick={onOpenAddCard}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>添加节点</span>
          </button>

          <button
            onClick={onOpenStructureModal}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm rounded-xl flex items-center gap-1.5 font-semibold transition-colors"
            title="管理阶段、子场景与泳道角色"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">结构管理</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAiDrawer}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 animate-bounce" />
            <span>AI 助手</span>
          </button>

          {/* Export / Import Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="导出与保存数据"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">导出/保存</span>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl z-50 py-1.5 text-sm"
                >
                <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">数据与图表导出</div>
                <button
                  onClick={() => onExportImage()}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium"
                >
                  <FileImage className="w-4 h-4 text-amber-400" />
                  <span>导出 PNG 图片</span>
                </button>

                <button
                  onClick={() => {
                    onCopyImage();
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium"
                >
                  {copySuccess
                    ? <Check className="w-4 h-4 text-emerald-400" />
                    : <Copy className="w-4 h-4 text-purple-400" />}
                  <span>{copySuccess ? '已复制 JSON！' : '复制 JSON 源码'}</span>
                </button>

                <button
                  onClick={() => onExportJson()}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium"
                >
                  <FileJson className="w-4 h-4 text-blue-400" />
                  <span>下载 JSON 文件</span>
                </button>

                <button
                  onClick={() => onExportCsv()}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>下载 CSV 清单</span>
                </button>

                <div className="border-t border-slate-700 my-1.5" />
                <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">文件导入</div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>导入 JSON 数据</span>
                </button>

                <button
                  onClick={() => {
                    onResetDefault();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-700/80 text-slate-200 flex items-center gap-2.5 font-medium text-rose-300 hover:text-rose-200 border-t border-slate-700 mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重置为华为/光伏预设</span>
                </button>
              </div>
            </>
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

