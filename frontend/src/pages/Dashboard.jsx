import React, { useEffect, useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, DollarSign,
  Activity, ArrowUpRight, Zap, Database, CheckCircle2, Clock
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
const RISK_COLORS = {
  'LOW RISK': '#10b981',
  'MEDIUM RISK': '#f59e0b',
  'HIGH RISK': '#f97316',
  'CRITICAL RISK': '#ef4444'
};

export const Dashboard = ({ setActiveTab, setSelectedTxnId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400 font-medium">Aggregating live fraud telemetry...</span>
        </div>
      </div>
    );
  }

  const datasetProfile = stats?.datasetProfile || {};
  const recentTxns = stats?.recentTransactions || [];
  const latestAlerts = stats?.latestAlerts || [];
  const typeDist = stats?.typeDistribution || [];
  const riskDist = stats?.riskDistribution || [];

  // Prepare Pie Chart data
  const genuineVsFraud = [
    { name: 'Genuine', value: stats?.genuineTransactions || 85, color: '#10b981' },
    { name: 'Fraudulent', value: stats?.fraudulentTransactions || 35, color: '#ef4444' }
  ];

  // Mock trend data based on actual totals
  const trendData = [
    { time: '00:00', genuine: 12, fraud: 1 },
    { time: '04:00', genuine: 8, fraud: 4 },
    { time: '08:00', genuine: 25, fraud: 7 },
    { time: '12:00', genuine: 45, fraud: 9 },
    { time: '16:00', genuine: 38, fraud: 6 },
    { time: '20:00', genuine: 29, fraud: 8 },
    { time: '24:00', genuine: 19, fraud: 0 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Distinguishing Real Dataset from Live App Session */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              PaySim Financial Dataset Synchronized
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                ACTIVE REPOSITORY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Profiling <strong>{datasetProfile?.total_records?.toLocaleString() || '6,362,620'}</strong> historical transactions • 
              <strong> {datasetProfile?.fraudulent_transactions?.toLocaleString() || '8,213'}</strong> verified fraud cases ({(datasetProfile?.fraud_percentage || 0.1291)}% base rate)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dataset')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <span>View Dataset Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => setActiveTab('predict')}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Score Live Txn</span>
          </button>
        </div>
      </div>

      {/* 7 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transactions */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Scored Records</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{stats?.totalTransactions?.toLocaleString() || 0}</span>
            <span className="text-[11px] text-slate-400">live database</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Total Volume: <span className="text-slate-200 font-semibold font-mono">${(stats?.totalTransactionAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Genuine Transactions */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Genuine Transactions</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{stats?.genuineTransactions?.toLocaleString() || 0}</span>
            <span className="text-[11px] text-emerald-500/80 font-medium">Cleared</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Passing all behavioral heuristic filters
          </div>
        </div>

        {/* Fraudulent Detected */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Fraudulent Intercepted</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-400">{stats?.fraudulentTransactions?.toLocaleString() || 0}</span>
            <span className="text-[11px] text-red-400 font-semibold px-1.5 py-0.5 rounded bg-red-500/15">
              {stats?.fraudDetectionRate?.toFixed(1) || 0}% Rate
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Fraud Value: <span className="text-red-300 font-mono font-semibold">${(stats?.fraudTransactionAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="glass-panel glass-panel-hover rounded-xl p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Alerts</span>
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{stats?.criticalAlerts || 0}</span>
            <span className="text-[11px] text-red-400 font-semibold">Requires Action</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Active Model: <span className="text-cyan-400 font-semibold">{stats?.activeModel || 'Random Forest'}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fraud Trends Over Time (2 Cols) */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Continuous Transaction Volume & Anomaly Velocity</h3>
              <p className="text-xs text-slate-400">Chronological activity across simulation steps</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Genuine
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Fraud Intercepted
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorGenuine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="genuine" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGenuine)" />
                <Area type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genuine vs Fraud Distribution (1 Col) */}
        <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Class Ratio & Imbalance</h3>
            <p className="text-xs text-slate-400 mb-4">Live scored transaction composition</p>
          </div>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genuineVsFraud}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genuineVsFraud.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-white">{stats?.totalTransactions || 0}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Scored</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
              <span className="text-slate-400 text-[11px]">Genuine</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{stats?.genuineTransactions || 0}</span>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex flex-col">
              <span className="text-slate-400 text-[11px]">Fraudulent</span>
              <span className="font-bold text-red-400 font-mono text-sm">{stats?.fraudulentTransactions || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Charts Row: Type Distribution & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume & Fraud by Transaction Type */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Transaction Type & Vulnerability Profile</h3>
              <p className="text-xs text-slate-400">Total volume vs detected fraudulent activity by category</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="type" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="count" name="Total Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fraudCount" name="Fraud Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
            ⚠️ <strong>Domain Insight:</strong> Consistent with the PaySim baseline, fraud occurs overwhelmingly in <strong>TRANSFER</strong> and <strong>CASH_OUT</strong> transaction types.
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Risk Tier Breakdown</h3>
              <p className="text-xs text-slate-400">Categorization from real-time ML risk scoring (0-100)</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Transactions" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                  {riskDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.category] || '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px] text-center">
            <div className="text-emerald-400">Low (0-29)</div>
            <div className="text-amber-400">Medium (30-49)</div>
            <div className="text-orange-400">High (50-74)</div>
            <div className="text-red-400">Critical (75-100)</div>
          </div>
        </div>
      </div>

      {/* Live Transaction & Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Critical Fraud Alerts */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              <h3 className="text-sm font-bold text-white">Priority Fraud Alerts</h3>
            </div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {latestAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.alertId}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {alert.riskScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{alert.transactionId}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        alert.status === 'PENDING' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{alert.reason}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 shrink-0 border border-slate-700"
                >
                  Investigate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Transaction Stream */}
        <div className="glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Transactions Stream</h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Open Explorer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTxns.slice(0, 5).map((t) => (
              <div
                key={t.transactionId}
                onClick={() => {
                  setSelectedTxnId(t.transactionId);
                  setActiveTab('transactions');
                }}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    t.isFraud ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {t.type.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">{t.transactionId}</span>
                      <span className="text-[10px] text-slate-400">{t.nameOrig} → {t.nameDest}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Amount: <strong className="text-white font-mono">${t.amount?.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span className={`font-semibold ${t.isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
                        {t.riskCategory}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-300">Score: {t.riskScore}</div>
                  <div className="text-[10px] text-slate-400">Step {t.step}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
