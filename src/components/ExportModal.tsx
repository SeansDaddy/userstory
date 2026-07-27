import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, FileImage, FileJson, FileSpreadsheet, ExternalLink, RefreshCw, Info } from 'lucide-react';
import { JourneyMapData } from '../types';
import { generateJourneyPngDataUrl, getCsvContent, copyToClipboard, openDataUrlInNewWindow, triggerDownload } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: JourneyMapData;
  initialTab?: 'png' | 'json' | 'csv';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  initialTab = 'png',
}) => {
  const [activeTab, setActiveTab] = useState<'png' | 'json' | 'csv'>(initialTab);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [isGeneratingPng, setIsGeneratingPng] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'png' && !pngDataUrl) {
      loadPngPreview();
    }
  }, [isOpen, activeTab]);

  const loadPngPreview = async () => {
    setIsGeneratingPng(true);
    try {
      const url = await generateJourneyPngDataUrl('journey-export-canvas');
      setPngDataUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  if (!isOpen) return null;

  const sanitizeName = (str: string) => (str || 'journey').replace(/[/\\?%*:|"<>]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  const pngFileName = `${sanitizeName(data.title)}_${dateStr}.png`;
  const jsonFileName = `${sanitizeName(data.title)}_${dateStr}.json`;
  const csvFileName = `${sanitizeName(data.title)}_nodes.csv`;

  const jsonText = JSON.stringify(data, null, 2);
  const csvText = getCsvContent(data);

  const jsonBlobUrl = URL.createObjectURL(new Blob([jsonText], { type: 'application/json;charset=utf-8;' }));
  const csvBlobUrl = URL.createObjectURL(new Blob([csvText], { type: 'text/csv;charset=utf-8;' }));

  const handleCopy = async (text: string, typeName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setDownloadNotice(`已成功复制 ${typeName} 到剪贴板！可以直接粘贴使用。`);
      setTimeout(() => {
        setCopied(false);
        setDownloadNotice(null);
      }, 4000);
    }
  };

  const handleDownloadBlob = (url: string, filename: string, contentStr?: string) => {
    try {
      triggerDownload(url, filename);
      setDownloadNotice(`已尝试触发 ${filename} 文件下载！`);
    } catch (e) {
      console.error(e);
      if (contentStr) {
        openDataUrlInNewWindow('data:text/plain;charset=utf-8,' + encodeURIComponent(contentStr), filename);
      }
    }
  };

  const isIframe = window.self !== window.top;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">数据与图表导出中心</h3>
              <p className="text-xs text-slate-400">支持保存高清 PNG 图片、JSON 完整结构与 CSV 表格文件</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        {downloadNotice && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2.5 font-semibold text-center flex items-center justify-center gap-2 shadow-inner">
            <Check className="w-4 h-4" />
            <span>{downloadNotice}</span>
          </div>
        )}

        {isIframe && (
          <div className="bg-blue-950/80 border-b border-blue-800/60 px-6 py-2.5 text-xs text-blue-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>当前处于内嵌预览框中。若浏览器拦截弹出文件，可直接使用<b>【一键复制】</b>或点击<b>【新标签页中打开】</b>。</span>
            </div>
            <a
              href={window.location.href}
              target="_blank"
              rel="noreferrer"
              className="text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>在新标签页打开应用</span>
            </a>
          </div>
        )}

        {/* Nav Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-3">
          <button
            onClick={() => setActiveTab('png')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl border-t border-x transition-all ${
              activeTab === 'png'
                ? 'bg-slate-800 border-slate-700 text-amber-400 border-b-transparent'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileImage className="w-4 h-4 text-amber-400" />
            <span>PNG 高清图片</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl border-t border-x transition-all ${
              activeTab === 'json'
                ? 'bg-slate-800 border-slate-700 text-blue-400 border-b-transparent'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4 text-blue-400" />
            <span>JSON 数据文件</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm rounded-t-xl border-t border-x transition-all ${
              activeTab === 'csv'
                ? 'bg-slate-800 border-slate-700 text-emerald-400 border-b-transparent'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV 表格数据</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-900/60">
          {/* PNG Tab */}
          {activeTab === 'png' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/90 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-200">高清矢量渲染图片 (PNG)</div>
                  <div className="text-xs text-slate-400">双倍超采样生成，完整包含全部阶段、场景与节点</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={loadPngPreview}
                    disabled={isGeneratingPng}
                    className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPng ? 'animate-spin' : ''}`} />
                    <span>重新生成</span>
                  </button>

                  {pngDataUrl && (
                    <button
                      onClick={() => handleDownloadBlob(pngDataUrl, pngFileName)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>直接下载 PNG</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[260px] relative">
                {isGeneratingPng ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                    <span className="text-sm">正在将当前用户旅程渲染为超高清图片...</span>
                  </div>
                ) : pngDataUrl ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="max-h-[380px] overflow-auto border border-slate-800 rounded-lg p-2 bg-slate-900/80 w-full flex justify-center">
                      <img
                        src={pngDataUrl}
                        alt="旅程图导出预览"
                        className="max-w-full h-auto object-contain rounded shadow-lg"
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => openDataUrlInNewWindow(pngDataUrl, pngFileName)}
                        className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>在新窗口独立打开大图（右键另存为）</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-sm">未找到可用画布，请点击右上角【重新生成】按钮。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/90 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-200">标准 JSON 结构数据</div>
                  <div className="text-xs text-slate-400">完整包含旅程阶段、子场景、泳道角色及全部卡片节点</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleCopy(jsonText, 'JSON 结构')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '已复制成功' : '一键复制 JSON'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadBlob(jsonBlobUrl, jsonFileName, jsonText)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载 .json 文件</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={jsonText}
                className="w-full h-80 bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none resize-none leading-relaxed select-all"
              />
            </div>
          )}

          {/* CSV Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-800/90 p-4 rounded-xl border border-slate-700">
                <div>
                  <div className="text-sm font-bold text-slate-200">CSV 电子表格清单</div>
                  <div className="text-xs text-slate-400">适配 Microsoft Excel、WPS、Apple Numbers 及飞书/钉钉文档</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleCopy(csvText, 'CSV 文本')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? '已复制成功' : '一键复制 CSV'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadBlob(csvBlobUrl, csvFileName, csvText)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载 .csv 文件</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={csvText}
                className="w-full h-80 bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl border border-slate-800 focus:outline-none resize-none leading-relaxed select-all"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>当前用户旅程: <strong className="text-slate-200">{data.title}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
