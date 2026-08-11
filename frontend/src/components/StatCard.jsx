import React from 'react';
import { ArrowUpRight, ChevronRight, Info } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle, onClick, clickable = false }) => {
  const colorMap = {
    emerald: {
      border: 'border-l-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    blue: {
      border: 'border-l-blue-500',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    amber: {
      border: 'border-l-amber-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10'
    },
    rose: {
      border: 'border-l-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10'
    },
    cyan: {
      border: 'border-l-cyan-500',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    }
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <div
      onClick={onClick}
      className={`premium-card p-5 rounded-2xl border-l-4 ${style.border} ${
        clickable ? 'cursor-pointer premium-card-hover' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${style.bg} ${style.text}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {clickable && (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Info className="w-3 h-3" /> Breakdown
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 font-mono flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
