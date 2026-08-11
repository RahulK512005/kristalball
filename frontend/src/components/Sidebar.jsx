import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, ArrowLeftRight, Users, ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, login } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { name: 'Purchases', path: '/purchases', icon: ShoppingCart, roles: ['ADMIN', 'LOGISTICS_OFFICER'] },
    { name: 'Cross-Base Transfers', path: '/transfers', icon: ArrowLeftRight, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { name: 'Assignments & Spent', path: '/assignments', icon: Users, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] },
    { name: 'System Audit Logs', path: '/audit', icon: ClipboardList, roles: ['ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'] }
  ];

  const handleRolePresetSwitch = async (username, password) => {
    try {
      await login(username, password);
    } catch (e) {
      console.error('Role switch failed', e);
    }
  };

  return (
    <aside className="w-60 bg-[#11141d]/60 border-r border-white/[0.08] flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3.5 py-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">Assigned Scope</div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
            <span className="truncate">{user?.role === 'ADMIN' ? 'All Bases (Global)' : user?.base?.name || 'Assigned Base'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            if (user && !item.roles.includes(user.role)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-lg shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
          <span>Role Switcher</span>
          <RefreshCw className="w-3 h-3 text-slate-400" />
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => handleRolePresetSwitch('admin_user', 'AdminPass123!')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Global Admin
          </button>
          <button
            onClick={() => handleRolePresetSwitch('commander_alpha', 'CommandPass123!')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              user?.username === 'commander_alpha'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Base Commander (Fort Alpha)
          </button>
          <button
            onClick={() => handleRolePresetSwitch('logistics_officer', 'LogisticsPass123!')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              user?.username === 'logistics_officer'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-semibold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Logistics Officer
          </button>
        </div>
      </div>
    </aside>
  );
};
