import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Plus } from 'lucide-react';

export const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    baseId: '',
    equipmentTypeId: '',
    quantity: '',
    unitCost: '',
    supplier: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resP, resB, resE] = await Promise.all([
        API.get('/purchases'),
        API.get('/assets/bases'),
        API.get('/assets/equipment-types')
      ]);
      setPurchases(resP.data);
      setBases(resB.data);
      setEquipments(resE.data);
      if (resB.data.length > 0) {
        setFormData(prev => ({ ...prev, baseId: user?.baseId || resB.data[0].id }));
      }
      if (resE.data.length > 0) {
        setFormData(prev => ({ ...prev, equipmentTypeId: resE.data[0].id }));
      }
    } catch (err) {
      console.error('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/purchases', formData);
      setShowModal(false);
      setFormData(prev => ({ ...prev, quantity: '', unitCost: '', supplier: '' }));
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between premium-card p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 font-mono flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            STOCK PURCHASES & PROCUREMENT LOG
          </h2>
          <p className="text-xs text-slate-400 font-mono">Record incoming inventory purchases from suppliers</p>
        </div>

        {['ADMIN', 'LOGISTICS_OFFICER'].includes(user?.role) && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-xs uppercase font-mono"
          >
            <Plus className="w-4 h-4" /> Log New Purchase
          </button>
        )}
      </div>

      <div className="premium-card p-5 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Base Destination</th>
                <th className="py-3 px-4 font-semibold">Equipment Item</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold text-right">Unit Cost</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">{p.baseName}</td>
                  <td className="py-3 px-4 text-blue-400 font-medium">{p.equipmentName}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">+{p.quantity.toLocaleString()} {p.unitOfMeasure}</td>
                  <td className="py-3 px-4 text-right text-slate-300">${p.unit_cost?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">{p.supplier}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{p.createdByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141721] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 font-mono mb-4">Record Stock Purchase</h3>
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Destination Military Base</label>
                <select
                  value={formData.baseId}
                  onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                >
                  {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Equipment Type</label>
                <select
                  value={formData.equipmentTypeId}
                  onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  required
                >
                  {equipments.map(e => <option key={e.id} value={e.id}>{e.name} ({e.category})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    placeholder="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supplier Vendor</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  placeholder="Colt Defense Inc."
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
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl"
                >
                  Confirm Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
