import React from 'react';
import { JourneyMapData, JourneyNode } from '../types';
import { Star, CheckCircle2, ArrowRight } from 'lucide-react';

interface FlowBoardViewProps {
  data: JourneyMapData;
  onEditNode: (node: JourneyNode) => void;
}

export const FlowBoardView: React.FC<FlowBoardViewProps> = ({ data, onEditNode }) => {
  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-64px)] text-slate-100 overflow-x-auto">
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <span>🔀 看板流程视图 (Sequential Flow)</span>
          </h2>
          <p className="text-xs text-slate-400">
            按【阶段】与【场景】时序排列的全流程流向看板，方便逐一审视用户体验闭环
          </p>
        </div>

        <div className="flex items-start gap-6 pb-6">
          {data.stages.map((stage) => {
            const stageSubStages = data.subStages.filter((ss) => ss.stageId === stage.id);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg"
              >
                {/* Stage Header */}
                <div
                  className="p-3 rounded-xl text-white font-bold text-sm mb-4 shadow-sm flex items-center justify-between"
                  style={{ backgroundColor: stage.color || '#3b82f6' }}
                >
                  <span>{stage.name}</span>
                  <span className="text-xs bg-black/20 px-2 py-0.5 rounded">
                    {stageSubStages.length} 场景
                  </span>
                </div>

                {/* SubStage Groups */}
                <div className="space-y-4">
                  {stageSubStages.map((subStage) => {
                    const subStageNodes = data.nodes.filter((n) => n.subStageId === subStage.id);

                    return (
                      <div
                        key={subStage.id}
                        className="bg-slate-900/90 border border-slate-700 rounded-xl p-3"
                      >
                        <div className="text-xs font-semibold text-blue-400 mb-2.5 pb-1 border-b border-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            {subStage.isKey && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                            {subStage.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{subStageNodes.length} 个动作</span>
                        </div>

                        {/* Node Cards */}
                        <div className="space-y-2">
                          {subStageNodes.length > 0 ? (
                            subStageNodes.map((node) => {
                              const role = data.roles.find((r) => r.id === node.roleId);

                              return (
                                <div
                                  key={node.id}
                                  onClick={() => onEditNode(node)}
                                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-blue-500 rounded-lg p-2.5 cursor-pointer transition-all shadow-xs"
                                >
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span
                                      className="px-1.5 py-0.5 rounded text-white font-medium"
                                      style={{ backgroundColor: role?.color || '#3b82f6' }}
                                    >
                                      {role?.name}
                                    </span>
                                    {node.isKey && (
                                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                        ★ 关键触点
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-xs font-bold text-slate-100 mb-1">{node.title}</div>

                                  {node.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2">
                                      {node.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-xs text-slate-500 italic p-2 text-center">暂无节点</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
