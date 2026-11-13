import React from 'react';
import { Bell, LogOut, Shield, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, onRefresh, alertCount = 0 }) => {
  const { user, logout } = useAuth();

  const titles = {
    dashboard: 'Executive Fraud Surveillance Dashboard',
    predict: 'Real-Time Transaction Risk Scoring Studio',
    transactions: 'Financial Transaction Explorer & Audit',
    alerts: 'Fraud Alert & Incident Management',
    xai: 'Explainable AI & Feature Contribution Inspector',
    models: 'Machine Learning Model Comparison & Deployment',
    customers: 'Customer Account Behavioral Analytics',
    dataset: 'PaySim Dataset & Ingestion Pipeline Manager',
    investigations: 'Case Management & Forensic Review',
    audit: 'System Security & Compliance Audit Trail',
    settings: 'Security Thresholds & System Configurations'
  };

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {titles[activeTab] || 'FraudShield AI'}
        </h1>
        <p className="text-xs text-slate-400">Continuous 24/7 transaction anomaly monitoring</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Telemetry Status Pills */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Spring Boot :8080</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">FastAPI :8000</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-slate-300 font-medium">DB Connected</span>
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Alerts Bell */}
        <div className="relative">
          <button
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700/50"
            title="Active Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-navy-900">
                {alertCount}
              </span>
            )}
          </button>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.fullName || user?.username || 'Administrator'}
            </div>
            <div className="text-[10px] font-medium text-cyan-400">
              {user?.role === 'ROLE_ADMIN' ? 'System Administrator' : 'Security Analyst'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
