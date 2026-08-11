import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, Plus, ShieldCheck, AlertCircle } from 'lucide-react';

export const Transfers = () => {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    sourceBaseId: '',
    destinationBaseId: '',
    equipmentTypeId: '',
    quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resT, resB, resE] = await Promise.all([
        API.get('/transfers'),
        API.get('/assets/bases'),
        API.get('/assets/equipment-types')
      ]);
      setTransfers(resT.data);
      setBases(resB.data);
      setEquipments(resE.data);

      const defaultSource = user?.role === 'BASE_COMMANDER' ? user.baseId : (resB.data[0]?.id || '');
      const defaultDest = resB.data.find(b => b.id !== Number(defaultSource))?.id || '';

      setFormData({
        sourceBaseId: defaultSource,
        destinationBaseId: defaultDest,
        equipmentTypeId: resE.data[0]?.id || '',
        quantity: ''
      });
    } catch (err) {
      console.error('Error loading transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await API.post('/transfers', formData);
      setShowModal(false);
      setFormData(prev => ({ ...prev, quantity: '' }));
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transfer failed. Check stock levels.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between premium-card p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            CROSS-BASE ASSET TRANSFERS (ATOMIC DB TRANSACTIONS)
          </h2>
          <p className="text-xs text-slate-400 font-mono">Move assets atomically between bases with full ACID guarantees</p>
        </div>

        <button
          onClick={() => { setErrorMsg(''); setShowModal(true); }}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-xs uppercase font-mono"
        >
          <Plus className="w-4 h-4" /> Initiate Atomic Transfer
        </button>
      </div>

      <div className="premium-card p-5 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Source Base</th>
                <th className="py-3 px-4 font-semibold">Destination Base</th>
                <th className="py-3 px-4 font-semibold">Equipment Item</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-xs text-slate-400">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-rose-400">-{t.sourceBaseName}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-400">+{t.destinationBaseName}</td>
                  <td className="py-3 px-4 text-slate-200">{t.equipmentName}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">{t.quantity.toLocaleString()} {t.unitOfMeasure}</td>
                  <td className="py-3 px-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" /> {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{t.initiatedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl font-mono text-xs">
            <h3 className="text-base font-bold text-slate-100 mb-4">Initiate Cross-Base Transfer</h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Source Base (Sender)</label>
                  <select
                    disabled={user?.role === 'BASE_COMMANDER'}
                    value={formData.sourceBaseId}
                    onChange={(e) => setFormData({ ...formData, sourceBaseId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 disabled:opacity-75"
                    required
                  >
                    {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Destination Base (Receiver)</label>
                  <select
                    value={formData.destinationBaseId}
                    onChange={(e) => setFormData({ ...formData, destinationBaseId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    required
                  >
                    {bases.filter(b => b.id !== Number(formData.sourceBaseId)).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Item to Transfer</label>
                <select
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                >
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  Execute Atomic Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
