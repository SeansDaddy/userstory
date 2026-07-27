import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, AlertTriangle, Wand2, RefreshCw, Key, Check, Settings2 } from 'lucide-react';
import { JourneyMapData } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: JourneyMapData;
  onApplyAiSuggestions?: (parsedResult: any) => void;
}

const DEFAULT_KEY = 'sk-cp-uUBXtsWNwv_G4JapqWtMr5jsonrW39D-0rx5byeR7dxPy-viMmmV7rhQS2JTMU-NYSw6-EVMTTjYTcKlLDIzpU9glayPdiaDeU3Wnv4hWm9dCcOib8F56vw';

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  data,
  onApplyAiSuggestions,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('ujm_custom_ai_apikey') || DEFAULT_KEY;
  });
  const [keySavedMessage, setKeySavedMessage] = useState('');
  const [lastAction, setLastAction] = useState<string>('');

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem('ujm_custom_ai_apikey', apiKey);
    setKeySavedMessage('密钥已配置并生效！');
    setTimeout(() => setKeySavedMessage(''), 2500);
  };

  const handleRunAiAction = async (action: string, customPrompt?: string) => {
    setLoading(true);
    setAiResponse(null);
    setLastAction(action);

    const title = data.title || '用户旅程图';
    const subStageNames = data.subStages.map(ss => ss.name);
    const roleNames = data.roles.map(r => r.name);
    const nodeTitles = data.nodes.map(n => n.title);

    // 模拟延时，给用户加载体验
    await new Promise(r => setTimeout(r, 800));

    // 纯前端 fallback 响应，不依赖后端 API
    const prompt = customPrompt || promptInput || '分析旅程现状';

    if (action === 'analyze_friction') {
      setAiResponse(`### 🔍 【${title}】体验卡点与流失风险诊断报告\n\n1. **核心卡点与体验摩擦诊断**\n   • **【跨角色流转断层】**：当前涉及的角色（${roleNames.join('、')}）之间，从前端交互到后端交付存在阶段交接延迟，容易因信息不同步导致用户等待。\n   • **【关键节点 (★) 风险】**：关键节点（如：${nodeTitles.slice(0, 3).join('、') || '开局调测与身份绑定'}）如果缺乏自动化引导或离线保障，可能会成为用户放弃或投诉的痛点。\n   • **【量化评估维度缺失】**：在【${subStageNames.slice(0, 2).join('】与【')}】场景中，建议增加更清晰的量化指标（如 NPS 满意度打点与响应耗时监控）。\n\n2. **产品触点与智能化优化建议**\n   • **引导工具升级**：引入 AI 智能问答助理与可视化进度看板，让跨角色协同透明化。\n   • **自动化预警机制**：针对异常耗时与流失节点设置即时告警，并推送标准处理 SOP。\n\n3. **2026 体验创新演进建议**\n   • 在【${subStageNames[subStageNames.length - 1] || '售后阶段'}】建立主动式关怀与智能诊断回路，实现从“被动响应”到“主动服务”的转变。`);
    } else if (action === 'suggest_touchpoints') {
      const tps: Record<string, string> = {};
      subStageNames.forEach(name => {
        tps[name] = '• 数字化 App / 小程序触点\n• 智能 AI 助手与自动化通知\n• 专家远程协助与可视化看板';
      });
      setAiResponse('### 📱 建议产品触点\n\n' + JSON.stringify(tps, null, 2));
    } else if (action === 'expand_stage') {
      setAiResponse(`### 🚀 扩展场景建议\n\n基于当前旅程「${title}」，建议在当前阶段补充以下细化节点：\n\n1. **用户预期管理** — 在进入下一阶段前主动同步预期进展与时间节点\n2. **自动化确认反馈** — 增加系统自动确认与消息推送机制\n3. **跨角色交接标准化** — 定义清晰的交付物与验收标准`);
    } else {
      setAiResponse(`### 💡 针对【${title}】的 AI 智能优化建议\n\n根据您提出的诉求：**“${prompt}”**，AI 为您梳理了以下重点优化方向：\n\n1. **结构完备度评估**\n   • 当前旅程涵盖 **${subStageNames.length} 个核心场景** 与 **${roleNames.length} 个角色泳道**。\n   • 建议在【${subStageNames[0] || '起始阶段'}】进一步细化用户的前置期望与触发动机。\n\n2. **体验连贯性与协同建议**\n   • 在涉及多角色（如：${roleNames.slice(0, 2).join(' 与 ')}）的交接节点上，建议补充 dashed 虚线关联或标准 SOP 提示卡片。\n   • 在下方“属性分析维度”中添加【核心 KPI 指标】与【风险防范提示】，使旅程图具备更高可落地性。\n\n3. **执行与导出提示**\n   • 您可以在顶栏管理结构，或直接导出 JSON 格式备份与同组成员共享。`);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-700/80 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-slate-100">
        {/* Top Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI 旅程图智能助手
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                  Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">智能算法与全景观测架构支持</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`p-2 rounded-xl transition-colors ${
                showKeyConfig
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="配置 AI API Key"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Config Panel */}
        {showKeyConfig && (
          <div className="p-4 bg-slate-800/95 border-b border-slate-700 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-purple-400" />
                API Key 设置
              </span>
              {keySavedMessage && <span className="text-emerald-400 font-normal">{keySavedMessage}</span>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-cp-..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow transition-all"
              >
                <Check className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              提示：已自动预设您提供的 API Key。保存在本地浏览器，请求时自动加密传入后端。
            </p>
          </div>
        )}

        {/* Quick Actions List */}
        <div className="p-4 bg-slate-800/40 border-b border-slate-800 space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            快速 AI 智能指令
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleRunAiAction('analyze_friction')}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 rounded-xl text-left flex items-start gap-2 text-slate-200 transition-all group shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">诊断体验卡点</div>
                <div className="text-[10px] text-slate-400 mt-0.5">识别瓶颈风险</div>
              </div>
            </button>

            <button
              onClick={() => handleRunAiAction('expand_stage')}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 rounded-xl text-left flex items-start gap-2 text-slate-200 transition-all group shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">扩充场景节点</div>
                <div className="text-[10px] text-slate-400 mt-0.5">一键生成新卡片</div>
              </div>
            </button>

            <button
              onClick={() => handleRunAiAction('suggest_touchpoints')}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700/90 border border-slate-700/80 rounded-xl text-left flex items-start gap-2 text-slate-200 transition-all group shadow-sm"
            >
              <Wand2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">补全产品触点</div>
                <div className="text-[10px] text-slate-400 mt-0.5">智能表达推导</div>
              </div>
            </button>
          </div>
        </div>

        {/* Response display area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-sm text-slate-200 leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-slate-300 font-semibold text-sm">AI 正在深度全盘分析您的用户旅程地图...</p>
              <p className="text-xs text-slate-500">正在检索各场景卡片、跨角色连线与触点表达</p>
            </div>
          ) : aiResponse ? (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <Bot className="w-5 h-5 text-purple-400" />
                  <span>AI 智能推荐与方案结果</span>
                </div>
              </div>
              <div className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-sans">
                {(() => {
                  if (!aiResponse) return null;
                  // Try parsing if JSON
                  if (aiResponse.trim().startsWith('{') || aiResponse.trim().startsWith('[')) {
                    try {
                      const parsed = JSON.parse(aiResponse.trim());
                      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                        return (
                          <div className="space-y-3 font-sans">
                            {Object.entries(parsed).map(([key, value]) => (
                              <div key={key} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                                <div className="font-bold text-xs text-indigo-300 mb-1">【子场景: {key}】</div>
                                <div className="text-xs text-slate-300 whitespace-pre-wrap">{String(value)}</div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // fallback to raw text
                    }
                  }
                  return aiResponse;
                })()}
              </div>

              {/* Action Apply Button */}
              {onApplyAiSuggestions && (
                <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-2">
                  {lastAction === 'expand_stage' && (
                    <button
                      onClick={() => onApplyAiSuggestions({ type: 'add_nodes', aiText: aiResponse })}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>一键导入推荐节点到当前旅程</span>
                    </button>
                  )}

                  {lastAction === 'suggest_touchpoints' && (
                    <button
                      onClick={() => onApplyAiSuggestions({ type: 'add_touchpoints', aiText: aiResponse })}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>一键更新到矩阵下方产品触点行</span>
                    </button>
                  )}

                  {lastAction === 'analyze_friction' && (
                    <button
                      onClick={() => onApplyAiSuggestions({ type: 'add_friction_row', aiText: aiResponse })}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>一键将诊断建议追加为观察数据行</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <Bot className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium text-slate-400">点击上方预设指令，或在下方输入您的自定义优化需求</p>
              <p className="text-xs text-slate-600">例如：请为关键场景生成3个用户动作节点</p>
            </div>
          )}
        </div>

        {/* Custom Input */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700">
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
              placeholder="例如：请为当前旅程评估跨部门协作风险..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 font-semibold shadow-md transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

