import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { NetMoveModal } from '../components/NetMoveModal';
import { EquipmentBreakdownTable } from '../components/EquipmentBreakdownTable';
import { MovementCharts } from '../components/MovementCharts';
import {
  Building,
  Filter,
  RefreshCw,
  Box,
  ArrowLeftRight,
  UserCheck,
  Flame,
  CheckCircle,
  Database
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();

  const [bases, setBases] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [selectedBase, setSelectedBase] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEquip, setSelectedEquip] = useState('ALL');

  const [metrics, setMetrics] = useState({
    openingBalance: 0,
    purchases: 0,
    transfersIn: 0,
    transfersOut: 0,
    netMovement: 0,
    assigned: 0,
    expended: 0,
    closingBalance: 0
  });

  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNetModalOpen, setIsNetModalOpen] = useState(false);

  useEffect(() => {
    fetchBasesAndEquipments();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBase, selectedCategory, selectedEquip, user]);

  const fetchBasesAndEquipments = async () => {
    try {
      const [resBases, resEquip] = await Promise.all([
        API.get('/assets/bases'),
        API.get('/assets/equipment-types')
      ]);
      setBases(resBases.data);
      setEquipments(resEquip.data);
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const baseFilter = user?.role === 'BASE_COMMANDER' ? user.baseId : selectedBase;

      const [resMetrics, resBreakdown] = await Promise.all([
        API.get('/assets/metrics', {
          params: {
            baseId: baseFilter,
            category: selectedCategory,
            equipmentTypeId: selectedEquip
          }
        }),
        API.get('/assets/breakdown', {
          params: {
            baseId: baseFilter
          }
        })
      ]);

      setMetrics(resMetrics.data);
      setBreakdown(resBreakdown.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 premium-card p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            ASSET CONTROL & INVENTORY METRICS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Formula: Closing Balance = Opening Balance + Net Movement - Assigned - Expended
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Base Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              disabled={user?.role === 'BASE_COMMANDER'}
              value={user?.role === 'BASE_COMMANDER' ? user.baseId : selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none disabled:opacity-80"
            >
              {user?.role !== 'BASE_COMMANDER' && <option value="ALL">All Bases (Global Ops)</option>}
              {bases.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="WEAPON">Weapons</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="AMMUNITION">Ammunition</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={Box}
          color="blue"
          subtitle="Baseline stock"
        />

        <StatCard
          title="Net Movement"
          value={metrics.netMovement >= 0 ? `+${metrics.netMovement.toLocaleString()}` : metrics.netMovement}
          icon={ArrowLeftRight}
          color="emerald"
          subtitle="Purchases + Transfers In - Out"
          clickable={true}
          onClick={() => setIsNetModalOpen(true)}
        />

        <StatCard
          title="Assigned to Personnel"
          value={metrics.assigned}
          icon={UserCheck}
          color="amber"
          subtitle="Active allocations"
        />

        <StatCard
          title="Expended / Consumed"
          value={metrics.expended}
          icon={Flame}
          color="rose"
          subtitle="Training & operational loss"
        />

        <StatCard
          title="Closing Balance"
          value={metrics.closingBalance}
          icon={CheckCircle}
          color="cyan"
          subtitle="Available inventory"
        />
      </div>

      {/* Recharts Analytics Section */}
      <MovementCharts breakdown={breakdown} />

      {/* Equipment Ledger Table */}
      <div className="premium-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 font-mono uppercase tracking-wider">Detailed Asset Ledger</h3>
          <span className="text-xs font-mono text-slate-400">Total Items: {breakdown.length}</span>
        </div>
        <EquipmentBreakdownTable breakdown={breakdown} loading={loading} />
      </div>

      {/* Net Movement Detail Modal */}
      <NetMoveModal
        isOpen={isNetModalOpen}
        onClose={() => setIsNetModalOpen(false)}
        metrics={metrics}
      />
    </div>
  );
};
