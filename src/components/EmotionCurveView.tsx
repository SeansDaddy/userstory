import React from 'react';
import { JourneyMapData } from '../types';
import { Smile, Frown, Meh, Star, Sparkles, AlertCircle } from 'lucide-react';

interface EmotionCurveViewProps {
  data: JourneyMapData;
}

export const EmotionCurveView: React.FC<EmotionCurveViewProps> = ({ data }) => {
  // Calculate average emotion score per subStage
  const emotionData = data.subStages.map((subStage) => {
    const nodes = data.nodes.filter((n) => n.subStageId === subStage.id);
    const nodesWithEmotion = nodes.filter((n) => typeof n.emotion === 'number');
    const avgEmotion =
      nodesWithEmotion.length > 0
        ? nodesWithEmotion.reduce((acc, n) => acc + (n.emotion || 3), 0) / nodesWithEmotion.length
        : 3.5;

    const touchpointText =
      data.attributeRows.find((r) => r.type === 'touchpoint')?.values[subStage.id] || '无登记触点';

    return {
      subStage,
      avgEmotion: Math.round(avgEmotion * 10) / 10,
      nodes,
      touchpointText,
    };
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-64px)] text-slate-100">
      <div id="journey-export-canvas" className="journey-canvas-area max-w-6xl mx-auto space-y-6 p-4 bg-slate-900 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Smile className="w-5 h-5 text-emerald-400" />
            <span>📈 情绪分布与体验峰终分析 (Emotion & Peak-End Rule)</span>
          </h2>
          <p className="text-xs text-slate-400">
            可视化各场景下客户与伙伴的情绪曲线，精准识别体验“高峰 (Peak)” 与 “低谷卡点 (Drop-off)”
          </p>
        </div>

        {/* Emotion Chart Canvas */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
            <span className="text-xs font-bold text-slate-300">满意度评分 (1 ~ 5 分)</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <Smile className="w-3.5 h-3.5" /> 5分 (极满意)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Meh className="w-3.5 h-3.5" /> 3分 (一般)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <Frown className="w-3.5 h-3.5" /> 1分 (不满/卡点)
              </span>
            </div>
          </div>

          {/* Graph columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
            {emotionData.map(({ subStage, avgEmotion, nodes, touchpointText }) => {
              const heightPercent = ((avgEmotion - 1) / 4) * 100;
              const isPeak = avgEmotion >= 4.5;
              const isLow = avgEmotion <= 3.0;

              return (
                <div key={subStage.id} className="flex flex-col items-center group">
                  {/* Score badge */}
                  <div
                    className={`mb-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isPeak
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isLow
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {avgEmotion}分
                  </div>

                  {/* Vertical bar container */}
                  <div className="w-full h-40 bg-slate-900 rounded-xl p-1 relative flex items-end justify-center border border-slate-700/80">
                    <div
                      className={`w-full rounded-lg transition-all duration-300 relative ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/20'
                          : isLow
                          ? 'bg-gradient-to-t from-rose-600 to-amber-500'
                          : 'bg-gradient-to-t from-blue-600 to-indigo-400'
                      }`}
                      style={{ height: `${Math.max(15, heightPercent)}%` }}
                    >
                      {subStage.isKey && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white p-1 rounded-full shadow-md">
                          <Star className="w-3 h-3 fill-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                      {subStage.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{nodes.length} 个动作</div>
                  </div>

                  {/* Touchpoint Card */}
                  <div className="mt-3 p-2 bg-slate-900/80 border border-slate-700 rounded-lg text-[10px] text-slate-300 w-full text-center min-h-[50px] flex items-center justify-center">
                    {touchpointText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
