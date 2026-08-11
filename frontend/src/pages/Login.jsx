import React, { useState } from 'react';
import { Shield, Lock, User, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [username, setUsername] = useState('admin_user');
  const [password, setPassword] = useState('AdminPass123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Invalid military credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectPreset = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/10 mx-auto mb-4">
            <div className="w-full h-full bg-[#0c0e14] rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 font-mono">
            KRISTALLBALL
          </h1>
          <p className="text-xs text-slate-400 font-mono uppercase tracking-widest mt-1">
            Enterprise Military Asset Management System
          </p>
        </div>

        <div className="premium-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 mb-1 font-mono">Military Command Sign-In</h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">Select role preset or enter military credentials</p>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Service Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide font-mono mt-6"
            >
              {submitting ? <Activity className="w-4 h-4 animate-spin" /> : <>Authenticate Command <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">Quick Test Accounts</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => selectPreset('admin_user', 'AdminPass123!')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition flex items-center justify-between ${
                  username === 'admin_user' ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200">Global Admin</div>
                  <div className="text-[10px] text-slate-400">admin_user / AdminPass123!</div>
                </div>
                {username === 'admin_user' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>

              <button
                type="button"
                onClick={() => selectPreset('commander_alpha', 'CommandPass123!')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition flex items-center justify-between ${
                  username === 'commander_alpha' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200">Base Commander (Fort Alpha)</div>
                  <div className="text-[10px] text-slate-400">commander_alpha / CommandPass123!</div>
                </div>
                {username === 'commander_alpha' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => selectPreset('logistics_officer', 'LogisticsPass123!')}
                className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition flex items-center justify-between ${
                  username === 'logistics_officer' ? 'bg-blue-500/10 border-blue-500/40 text-blue-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-200">Logistics Officer</div>
                  <div className="text-[10px] text-slate-400">logistics_officer / LogisticsPass123!</div>
                </div>
                {username === 'logistics_officer' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
