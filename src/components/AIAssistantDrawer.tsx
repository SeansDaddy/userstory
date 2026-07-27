import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, AlertTriangle, Layers, Wand2, RefreshCw } from 'lucide-react';
import { JourneyMapData } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: JourneyMapData;
  onApplyAiSuggestions?: (parsedResult: any) => void;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  data,
  onApplyAiSuggestions,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAction = async (action: string, customPrompt?: string) => {
    setLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai-journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          prompt: customPrompt || promptInput || '分析旅程现状',
          currentJourney: data,
        }),
      });

      const json = await res.json();
      if (json.success && json.result) {
        setAiResponse(json.result);
      } else {
        setAiResponse('AI 处理失败，请重试。');
      }
    } catch (err: any) {
      setAiResponse('与 AI 服务通信超时，请检查网络设置。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Top Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI 旅程图智能助手</h3>
              <p className="text-[10px] text-slate-400">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions List */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-800 space-y-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            快速 AI 智能指令
          </span>

          <button
            onClick={() => handleRunAiAction('analyze_friction')}
            disabled={loading}
            className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center gap-2 text-slate-200 transition-all group"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-white">诊断体验卡点与流失风险</div>
              <div className="text-[10px] text-slate-400">分析全旅程中的高摩擦节点与优化契机</div>
            </div>
          </button>

          <button
            onClick={() => handleRunAiAction('suggest_touchpoints')}
            disabled={loading}
            className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left flex items-center gap-2 text-slate-200 transition-all group"
          >
            <Wand2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="font-semibold text-white">补全各场景产品触点建议</div>
              <div className="text-[10px] text-slate-400">为全场景匹配合适的数字化工具与 App 触点</div>
            </div>
          </button>
        </div>

        {/* Response display area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs text-slate-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-3">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              <p className="text-slate-400 font-medium">Gemini AI 正在深度分析您的旅程地图...</p>
            </div>
          ) : aiResponse ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs border-b border-slate-700 pb-2">
                <Bot className="w-4 h-4" />
                <span>AI 诊断与建议结果</span>
              </div>
              <div className="whitespace-pre-wrap text-slate-300 text-xs font-sans">
                {aiResponse}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Bot className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">点击上方预设指令，或在下方输入您的自定义优化诉求</p>
            </div>
          )}
        </div>

        {/* Custom Input */}
        <div className="p-3 bg-slate-800 border-t border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (promptInput.trim()) {
                handleRunAiAction('custom', promptInput);
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="例如：请为【安装/调测】阶段增加2个智能化开局步骤..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
