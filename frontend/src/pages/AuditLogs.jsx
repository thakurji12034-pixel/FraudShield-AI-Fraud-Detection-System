import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, Search, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({ page: 0, size: 50 });
      setLogs(res.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            System Security & Compliance Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of analyst decisions, model configuration overrides, and administrative actions
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-3">Entity ID</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-sans">
                    Loading security audit events...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-4 text-slate-400">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/20 font-bold">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white font-sans">
                      {l.performedBy}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">
                      {l.entityType}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">
                      {l.entityId}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans max-w-xs truncate">
                      {l.details}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {l.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
