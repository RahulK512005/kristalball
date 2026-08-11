import React from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ShoppingCart, Calculator } from 'lucide-react';

export const NetMoveModal = ({ isOpen, onClose, metrics }) => {
  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-emerald-500/5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Net Movement Calculation</h3>
              <p className="text-xs text-slate-400 font-mono">Mathematical Formula Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              <span>Purchases (+)</span>
            </div>
            <span className="font-bold text-blue-400">+{metrics.purchases.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>Transfers In (+)</span>
            </div>
            <span className="font-bold text-emerald-400">+{metrics.transfersIn.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-300">
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>Transfers Out (-)</span>
            </div>
            <span className="font-bold text-rose-400">-{metrics.transfersOut.toLocaleString()}</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">Net Movement</span>
            <span className="font-extrabold text-lg text-emerald-400">
              {metrics.netMovement >= 0 ? `+${metrics.netMovement.toLocaleString()}` : metrics.netMovement.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 font-mono">
          <p className="text-[11px] text-slate-400">
            Formula: <span className="text-emerald-400">Net Movement = Purchases + Transfers In - Transfers Out</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition text-xs font-mono"
        >
          Close Window
        </button>
      </div>
    </div>
  );
};
