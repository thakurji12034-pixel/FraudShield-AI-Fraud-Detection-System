import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, UserCheck,
  Search, Filter, MessageSquare, ArrowRight, X, AlertOctagon
} from 'lucide-react';
import { api } from '../services/api';

export const FraudAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Status Update Form State
  const [newStatus, setNewStatus] = useState('INVESTIGATING');
  const [assignedTo, setAssignedTo] = useState('analyst');
  const [investigationNote, setInvestigationNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchAlertData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.all([
        api.getAlerts({
          query: searchQuery,
          severity: severityFilter,
          status: statusFilter,
          page: 0,
          size: 50
        }),
        api.getAlertStats()
      ]);
      setAlerts(alertsRes.content || []);
      setStats(statsRes || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, [severityFilter, statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      setUpdating(true);
      const updated = await api.updateAlertStatus(selectedAlert.alertId, {
        status: newStatus,
        assignedTo,
        notes: investigationNote
      });
      setSelectedAlert(null);
      setInvestigationNote('');
      fetchAlertData();
    } catch (err) {
      alert(err.message || 'Failed to update alert');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Fraud Alert & Incident Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Triage, investigate, and resolve high-risk financial anomalies intercepted by the hybrid engine
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-red-500">
          <span className="text-[11px] text-slate-400 font-medium">Critical Alerts</span>
          <div className="text-2xl font-black text-red-400 mt-1 font-mono">{stats.critical || 0}</div>
          <span className="text-[10px] text-slate-500">Score &gt;= 75</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-orange-500">
          <span className="text-[11px] text-slate-400 font-medium">High Risk Alerts</span>
          <div className="text-2xl font-black text-orange-400 mt-1 font-mono">{stats.high || 0}</div>
          <span className="text-[10px] text-slate-500">Score 50 - 74</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-blue-500">
          <span className="text-[11px] text-slate-400 font-medium">Under Investigation</span>
          <div className="text-2xl font-black text-blue-400 mt-1 font-mono">{stats.investigating || 0}</div>
          <span className="text-[10px] text-slate-500">Assigned to analysts</span>
        </div>

        <div className="glass-panel rounded-xl p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] text-slate-400 font-medium">Resolved & Cleared</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{stats.resolved || 0}</div>
          <span className="text-[10px] text-slate-500">Case closed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                severityFilter === sev
                  ? 'bg-slate-700 text-white border border-slate-600 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Action</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed (False Positive)</option>
          </select>

          <form onSubmit={(e) => { e.preventDefault(); fetchAlertData(); }} className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search alert / txn ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </form>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-400">
            Loading incident alert queue...
          </div>
        ) : alerts.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            No alerts found matching current filter parameters.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.alertId}
              className={`glass-panel rounded-xl p-5 border transition flex flex-col justify-between ${
                alert.severity === 'CRITICAL' ? 'border-red-500/40 hover:border-red-400/60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{alert.alertId}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    alert.status === 'PENDING' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.status === 'INVESTIGATING' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono mb-2">
                  Transaction: <strong className="text-white">{alert.transactionId}</strong> • Risk Score: <strong className="text-red-400">{alert.riskScore}/100</strong>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  {alert.reason}
                </p>

                {alert.assignedTo && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Assigned to: <strong className="text-slate-300 font-mono">{alert.assignedTo}</strong></span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    setSelectedAlert(alert);
                    setNewStatus(alert.status === 'PENDING' ? 'INVESTIGATING' : alert.status);
                    setAssignedTo(alert.assignedTo || 'analyst');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition"
                >
                  Manage Investigation
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Investigation Management Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Investigate Security Incident</h3>
                <span className="font-mono text-xs text-cyan-400">{selectedAlert.alertId}</span>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="INVESTIGATING">Mark as INVESTIGATING (In Progress)</option>
                  <option value="RESOLVED">Mark as RESOLVED (Confirmed Fraud Actioned)</option>
                  <option value="DISMISSED">Mark as DISMISSED (False Positive Approved)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Assigned Investigator</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Forensic Investigation Notes</label>
                <textarea
                  rows="3"
                  value={investigationNote}
                  onChange={(e) => setInvestigationNote(e.target.value)}
                  placeholder="Document actions taken, customer callback confirmation, account freeze details..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {selectedAlert.investigationNotes && (
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Prior Activity History</span>
                  <div className="text-[11px] text-slate-300 whitespace-pre-line font-mono max-h-32 overflow-y-auto">
                    {selectedAlert.investigationNotes}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Commit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
