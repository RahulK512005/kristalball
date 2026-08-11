import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Flame, UserCheck } from 'lucide-react';

export const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipments, setEquipments] = useState([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showExpendModal, setShowExpendModal] = useState(false);

  const [assignForm, setAssignForm] = useState({ baseId: '', equipmentTypeId: '', assignedTo: '', quantity: '' });
  const [expendForm, setExpendForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resA, resE, resB, resEq] = await Promise.all([
        API.get('/assignments'),
        API.get('/expenditures'),
        API.get('/assets/bases'),
        API.get('/assets/equipment-types')
      ]);
      setAssignments(resA.data);
      setExpenditures(resE.data);
      setBases(resB.data);
      setEquipments(resEq.data);

      const defaultBase = user?.role === 'BASE_COMMANDER' ? user.baseId : (resB.data[0]?.id || '');
      setAssignForm(prev => ({ ...prev, baseId: defaultBase, equipmentTypeId: resEq.data[0]?.id || '' }));
      setExpendForm(prev => ({ ...prev, baseId: defaultBase, equipmentTypeId: resEq.data[0]?.id || '' }));
    } catch (err) {
      console.error('Error fetching assignments & expenditures:', err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/assignments', assignForm);
      setShowAssignModal(false);
      setAssignForm(prev => ({ ...prev, assignedTo: '', quantity: '' }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleExpendSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expenditures', expendForm);
      setShowExpendModal(false);
      setExpendForm(prev => ({ ...prev, quantity: '', reason: '' }));
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Expenditure log failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 premium-card p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            PERSONNEL ASSIGNMENTS & OPERATIONAL EXPENDITURES
          </h2>
          <p className="text-xs text-slate-400 font-mono">Track active unit allocations and consumed ammunition/retired gear</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 text-xs uppercase font-mono"
          >
            <UserCheck className="w-4 h-4" /> Assign Assets
          </button>
          <button
            onClick={() => setShowExpendModal(true)}
            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center gap-1.5 text-xs uppercase font-mono"
          >
            <Flame className="w-4 h-4" /> Record Expenditure
          </button>
        </div>
      </div>

      {/* Active Assignments Section */}
      <div className="premium-card p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-amber-400" /> Active Personnel & Unit Assignments
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Base</th>
                <th className="py-3 px-4 font-semibold">Assigned Unit / Personnel</th>
                <th className="py-3 px-4 font-semibold">Equipment Item</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-200">{a.baseName}</td>
                  <td className="py-3 px-4 text-amber-300 font-medium">{a.assigned_to}</td>
                  <td className="py-3 px-4 text-slate-100">{a.equipmentName}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-400">{a.quantity.toLocaleString()} {a.unitOfMeasure}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{new Date(a.assigned_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenditures Section */}
      <div className="premium-card p-5 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-100 font-mono flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" /> Operational Expenditures & Consumed Stock
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Base</th>
                <th className="py-3 px-4 font-semibold">Equipment Item</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity Consumed</th>
                <th className="py-3 px-4 font-semibold">Operational Reason</th>
                <th className="py-3 px-4 font-semibold">Logged By</th>
                <th className="py-3 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {expenditures.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-200">{e.baseName}</td>
                  <td className="py-3 px-4 text-rose-300 font-medium">{e.equipmentName}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-400">-{e.quantity.toLocaleString()} {e.unitOfMeasure}</td>
                  <td className="py-3 px-4 text-slate-400">{e.reason}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{e.expendedByName}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-4">Assign Assets to Unit / Personnel</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Base Location</label>
                <select
                  disabled={user?.role === 'BASE_COMMANDER'}
                  value={assignForm.baseId}
                  onChange={e => setAssignForm({ ...assignForm, baseId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 disabled:opacity-75"
                  required
                >
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Item</label>
                <select
                  value={assignForm.equipmentTypeId}
                  onChange={e => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                >
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Recipient Unit / Personnel Name</label>
                <input
                  type="text"
                  value={assignForm.assignedTo}
                  onChange={e => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="1st Infantry Strike Battalion"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={assignForm.quantity}
                  onChange={e => setAssignForm({ ...assignForm, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="50"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenditure Modal */}
      {showExpendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-4">Record Consumed / Expended Assets</h3>
            <form onSubmit={handleExpendSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1">Base Location</label>
                <select
                  disabled={user?.role === 'BASE_COMMANDER'}
                  value={expendForm.baseId}
                  onChange={e => setExpendForm({ ...expendForm, baseId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 disabled:opacity-75"
                  required
                >
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Item</label>
                <select
                  value={expendForm.equipmentTypeId}
                  onChange={e => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                >
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expended Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={expendForm.quantity}
                  onChange={e => setExpendForm({ ...expendForm, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="2000"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Reason / Details</label>
                <input
                  type="text"
                  value={expendForm.reason}
                  onChange={e => setExpendForm({ ...expendForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="Live-fire tactical training exercise"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowExpendModal(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-rose-500 text-slate-950 font-bold rounded-xl">Log Expenditure</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
