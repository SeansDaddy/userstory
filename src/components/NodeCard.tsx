import React from 'react';
import { Star, CheckCircle2, Clock, AlertTriangle, ArrowRight, Smile, Meh, Frown } from 'lucide-react';
import { JourneyNode, Role } from '../types';

interface NodeCardProps {
  node: JourneyNode;
  role?: Role;
  onEdit: (node: JourneyNode) => void;
  onStartConnect?: (nodeId: string) => void;
  isConnectSource?: boolean;
  isConnectTarget?: boolean;
  onQuickAddAfter?: (node: JourneyNode) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  role,
  onEdit,
  onStartConnect,
  isConnectSource,
  isConnectTarget,
}) => {
  const roleColor = role?.color || '#3b82f6';

  const getStatusBadge = () => {
    switch (node.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            已完成
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            进行中
          </span>
        );
      case 'issue':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            体验卡点
          </span>
        );
      default:
        return null;
    }
  };

  const getEmotionIcon = () => {
    if (!node.emotion) return null;
    if (node.emotion >= 4) {
      return (
        <span className="inline-flex items-center text-emerald-600" title={`满意度评分: ${node.emotion}/5`}>
          <Smile className="w-4 h-4" />
        </span>
      );
    }
    if (node.emotion === 3) {
      return (
        <span className="inline-flex items-center text-amber-600" title={`满意度评分: ${node.emotion}/5`}>
          <Meh className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-rose-600" title={`满意度评分: ${node.emotion}/5`}>
        <Frown className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div
      id={`node-card-${node.id}`}
      onClick={() => onEdit(node)}
      className={`group relative bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none min-h-[95px] flex flex-col justify-between ${
        node.isKey
          ? 'border-amber-400/90 ring-2 ring-amber-400/20 bg-gradient-to-br from-amber-50/40 via-white to-white'
          : 'border-slate-200/90 hover:border-blue-400'
      } ${
        isConnectSource
          ? 'ring-2 ring-blue-500 border-blue-500 scale-[1.02]'
          : isConnectTarget
          ? 'ring-2 ring-emerald-500 border-emerald-500 animate-pulse'
          : ''
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: roleColor,
      }}
    >
      {/* Top row: Badge & Key indicator */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {node.isKey && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-white shadow-xs">
              <Star className="w-3.5 h-3.5 fill-white" />
              关键触点
            </span>
          )}
          {getStatusBadge()}
        </div>

        {/* Emotion icon */}
        <div className="flex items-center gap-1">{getEmotionIcon()}</div>
      </div>

      {/* Main Title */}
      <div className="text-sm font-bold text-slate-800 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
        {node.title}
      </div>

      {/* Sub Description */}
      {node.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1">
          {node.description}
        </p>
      )}

      {/* Bottom bar & connect trigger */}
      <div className="flex items-center justify-between pt-1 mt-auto border-t border-slate-100 text-xs text-slate-400">
        <span className="truncate max-w-[120px] font-medium">{role?.name}</span>

        {/* Quick Connect Link Trigger */}
        {onStartConnect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(node.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 text-slate-500 hover:text-blue-600 rounded transition-all flex items-center gap-0.5 font-medium"
            title="连线到其他节点"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>连线</span>
          </button>
        )}
      </div>
    </div>
  );
};
