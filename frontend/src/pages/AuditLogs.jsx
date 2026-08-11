import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { ClipboardList, Search } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'PURCHASE':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">PURCHASE</span>;
      case 'TRANSFER':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">TRANSFER</span>;
      case 'ASSIGNMENT':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">ASSIGNMENT</span>;
      case 'EXPENDITURE':
        return <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">EXPENDITURE</span>;
      default:
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold">{action}</span>;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.details.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 premium-card p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            SYSTEM AUDIT TRAIL LOGS
          </h2>
          <p className="text-xs text-slate-400 font-mono">Automated immutable log recording every inventory mutation</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="premium-card p-5 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{log.userFullName} <span className="text-[11px] text-slate-400 font-normal">({log.username})</span></td>
                  <td className="py-3 px-4 text-xs text-slate-400">{log.userRole}</td>
                  <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                  <td className="py-3 px-4 text-slate-300">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
