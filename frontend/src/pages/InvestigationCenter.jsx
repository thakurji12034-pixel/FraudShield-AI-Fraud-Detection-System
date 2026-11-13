import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, ShieldAlert, CheckCircle2, AlertOctagon,
  FileText, Clock, UserCheck, MessageSquare, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export const InvestigationCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [txnDetails, setTxnDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts({ status: 'INVESTIGATING', size: 20 });
      setAlerts(res.content || []);
      if (res.content?.length > 0) {
        handleSelectCase(res.content[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleSelectCase = async (alertItem) => {
    setSelectedCase(alertItem);
    try {
      const txn = await api.getTransaction(alertItem.transactionId);
      setTxnDetails(txn);
    } catch (e) {
      setTxnDetails(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          Financial Crimes Forensic Investigation Center
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dedicated workspace for assigned analysts conducting forensic reviews of suspected fraud networks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Cases Docket (4 Cols) */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white">Active Case Docket</span>
            <span className="text-cyan-400 font-mono font-bold">{alerts.length} In-Review</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading open investigations...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active cases currently marked as INVESTIGATING.</div>
            ) : (
              alerts.map((c) => (
                <div
                  key={c.alertId}
                  onClick={() => handleSelectCase(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedCase?.alertId === c.alertId
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{c.alertId}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-bold">
                      {c.severity}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">Txn: {c.transactionId}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Assigned: {c.assignedTo || 'Unassigned'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Case File Deep-Dive (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {!selectedCase ? (
            <div className="glass-panel rounded-xl p-12 text-center text-slate-500 border-dashed border-slate-800">
              Select a case from the docket to examine transaction telemetry and forensic logs.
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-6 space-y-5 border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Forensic Dossier</span>
                  <div className="text-lg font-black text-white font-mono mt-0.5">{selectedCase.alertId}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    STATUS: {selectedCase.status}
                  </span>
                </div>
              </div>

              {/* Transaction Profile */}
              {txnDetails && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Underlying Financial Transaction</span>
                    <span className="font-mono text-cyan-400">{txnDetails.transactionId}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px]">Type</span>
                      <div className="text-white font-bold">{txnDetails.type}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Amount</span>
                      <div className="text-white font-bold">${txnDetails.amount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Sender</span>
                      <div className="text-slate-300 truncate">{txnDetails.nameOrig}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Recipient</span>
                      <div className="text-slate-300 truncate">{txnDetails.nameDest}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason & Heuristic Triggers */}
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <span className="font-bold text-red-400 block mb-1">Algorithmic Interception Reason</span>
                <p className="text-red-300 leading-relaxed font-sans">{selectedCase.reason}</p>
              </div>

              {/* Investigation Trail Notes */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Investigator Activity & Case Notes
                </span>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed min-h-[100px]">
                  {selectedCase.investigationNotes || 'No notes entered yet. Open Fraud Alerts to update case notes.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
