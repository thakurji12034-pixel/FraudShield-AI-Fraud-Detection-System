import React from 'react';
import {
  ShieldAlert, LayoutDashboard, Zap, Search, AlertTriangle,
  Cpu, Users, Database, FileText, Settings, ShieldCheck,
  Briefcase, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'Real-Time Detection', icon: Zap, badge: 'LIVE' },
    { id: 'transactions', label: 'Transactions', icon: Search },
    { id: 'alerts', label: 'Fraud Alerts', icon: AlertTriangle, badgeColor: 'bg-red-500/20 text-red-400' },
    { id: 'xai', label: 'Explainable AI', icon: Cpu },
    { id: 'models', label: 'ML Model Arena', icon: Activity },
    { id: 'customers', label: 'Customer Analytics', icon: Users },
    { id: 'dataset', label: 'Dataset Management', icon: Database },
    { id: 'investigations', label: 'Investigation Center', icon: Briefcase },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80 bg-navy-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wider text-white">FRAUD<span className="text-cyan-400">SHIELD</span></span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">AI</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wide font-medium">Fintech Sentinel v1.0</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Financial Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.badgeColor || 'bg-cyan-500/20 text-cyan-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Engine Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Hybrid Engine</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Model: <span className="text-slate-300 font-mono">Random Forest</span>
          </p>
          <div className="mt-2 text-[10px] text-slate-400">
            PaySim Data • 6.36M records
          </div>
        </div>
      </div>
    </aside>
  );
};
