import React, { useState, useEffect } from 'react';
import { X, Link, ArrowRight, Trash2, Check } from 'lucide-react';
import { LineStyle } from '../types';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTitle?: string;
  targetTitle?: string;
  initialLabel?: string;
  initialStyle?: LineStyle;
  isEditing?: boolean;
  onConfirm: (label: string, style: LineStyle) => void;
  onDelete?: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  sourceTitle = '起点节点',
  targetTitle = '目标节点',
  initialLabel = '',
  initialStyle = 'solid',
  isEditing = false,
  onConfirm,
  onDelete,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [style, setStyle] = useState<LineStyle>(initialStyle);

  useEffect(() => {
    setLabel(initialLabel || '');
    setStyle(initialStyle || 'solid');
  }, [initialLabel, initialStyle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(label.trim(), style);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-base">
            <Link className="w-5 h-5" />
            <span>{isEditing ? '编辑节点连线信息' : '创建节点连线与流转'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nodes flow preview */}
        <div className="my-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <div className="truncate max-w-[140px] font-semibold text-white" title={sourceTitle}>
            {sourceTitle}
          </div>
          <div className="flex items-center gap-1 text-indigo-400 shrink-0">
            <span className="text-[10px] font-mono">{style === 'dashed' ? '- - -' : '───'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="truncate max-w-[140px] font-semibold text-white" title={targetTitle}>
            {targetTitle}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              连线说明 / 动作标签 <span className="text-slate-500 font-normal">(选填)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例如：流转 / 数据同步 / 触发审批 / 线下交接"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-medium"
              autoFocus
            />
          </div>

          {/* Line Style Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">线条样式</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStyle('solid')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  style === 'solid'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>实线 (直接流转)</span>
                {style === 'solid' && <Check className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => setStyle('dashed')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  style === 'dashed'
                    ? 'bg-pink-600/30 border-pink-500 text-pink-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>虚线 (关联/异步)</span>
                {style === 'dashed' && <Check className="w-4 h-4 text-pink-400" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="px-3.5 py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除连线</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                {isEditing ? '保存修改' : '确认建立连线'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
