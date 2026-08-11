import React from 'react';
import { Shield, LogOut, User, Building, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3" /> Global Admin
          </span>
        );
      case 'BASE_COMMANDER':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3" /> Base Commander
          </span>
        );
      case 'LOGISTICS_OFFICER':
        return (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3" /> Logistics Officer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#11141d]/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/10">
          <div className="w-full h-full bg-[#0c0e14] rounded-[10px] flex items-center justify-center">
            <span className="text-emerald-400 font-extrabold text-sm font-mono tracking-tighter">KB</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base text-slate-100 tracking-tight">KRISTALLBALL</h1>
            <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">
              v1.0 Enterprise
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Military Asset Management & Stock Control</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE DB SYNC
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 flex items-center justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {user.fullName || user.username}
              </div>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                {getRoleBadge(user.role)}
                {user.base && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-500" />
                    {user.base.name}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
