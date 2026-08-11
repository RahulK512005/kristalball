import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

export const MovementCharts = ({ breakdown }) => {
  const chartData = breakdown.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    fullName: item.name,
    closing: item.closingBalance
  }));

  const categoryTotals = breakdown.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.closingBalance;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 premium-card p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4 font-mono">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Closing Balance Breakdown by Equipment Item
          </h3>
          <span className="text-xs text-slate-400">Available Stock</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141721', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
              />
              <Bar dataKey="closing" name="Closing Balance" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="premium-card p-5 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4 font-mono">
          Category Distribution
        </h3>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#141721', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
