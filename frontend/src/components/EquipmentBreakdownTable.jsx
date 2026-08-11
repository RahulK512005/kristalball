import React from 'react';
import { Package, Activity } from 'lucide-react';

export const EquipmentBreakdownTable = ({ breakdown, loading }) => {
  const getCategoryBadge = (category) => {
    switch (category) {
      case 'WEAPON':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono">WEAPON</span>;
      case 'VEHICLE':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono">VEHICLE</span>;
      case 'AMMUNITION':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono">AMMUNITION</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[11px] font-semibold font-mono">EQUIPMENT</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        <Activity className="w-5 h-5 animate-spin mx-auto text-emerald-400 mb-2" />
        Calculating Equipment Stock Ledger...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-300 border-collapse">
        <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4 font-semibold">Equipment Item</th>
            <th className="py-3 px-4 font-semibold">Category</th>
            <th className="py-3 px-4 font-semibold text-right">Purchases</th>
            <th className="py-3 px-4 font-semibold text-right">Transfers In</th>
            <th className="py-3 px-4 font-semibold text-right">Transfers Out</th>
            <th className="py-3 px-4 font-semibold text-right">Net Movement</th>
            <th className="py-3 px-4 font-semibold text-right">Assigned</th>
            <th className="py-3 px-4 font-semibold text-right">Expended</th>
            <th className="py-3 px-4 font-semibold text-right text-emerald-400">Closing Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono">
          {breakdown.map((item) => (
            <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                {item.name}
              </td>
              <td className="py-3 px-4">{getCategoryBadge(item.category)}</td>
              <td className="py-3 px-4 text-right text-blue-400 font-medium">+{item.purchases.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-emerald-400 font-medium">+{item.transfersIn.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-rose-400 font-medium">-{item.transfersOut.toLocaleString()}</td>
              <td className="py-3 px-4 text-right font-bold text-slate-200">
                {item.netMovement >= 0 ? `+${item.netMovement.toLocaleString()}` : item.netMovement.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right text-amber-400">-{item.assigned.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-rose-400">-{item.expended.toLocaleString()}</td>
              <td className="py-3 px-4 text-right font-extrabold text-sm text-emerald-400 bg-emerald-500/5">
                {item.closingBalance.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unitOfMeasure}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
