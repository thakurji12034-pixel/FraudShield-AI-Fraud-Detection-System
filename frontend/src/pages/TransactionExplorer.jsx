import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Download, ArrowUpDown, Eye, ShieldAlert,
  ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight, X, ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const TransactionExplorer = ({ selectedTxnId, setSelectedTxnId }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [fraudFilter, setFraudFilter] = useState('');

  // Inspection Modal
  const [inspectTxn, setInspectTxn] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
        query: searchQuery,
        type: selectedType,
        riskCategory: selectedRisk,
        sortBy: 'createdAt',
        direction: 'desc'
      };
      if (fraudFilter !== '') {
        params.isFraud = fraudFilter === 'true';
      }

      const res = await api.getTransactions(params);
      setTransactions(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize, selectedType, selectedRisk, fraudFilter]);

  // Handle selectedTxnId from Dashboard
  useEffect(() => {
    if (selectedTxnId) {
      api.getTransaction(selectedTxnId)
        .then(t => setInspectTxn(t))
        .catch(console.error);
    }
  }, [selectedTxnId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTransactions();
  };

  const exportCsv = () => {
    window.open(api.exportCsvUrl(), '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            Financial Transaction Explorer & Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Query and inspect verified ledger transactions with granular risk scoring
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Scored Records (.CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-xl p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Transaction ID (e.g. TXN-...), Sender or Recipient account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
          >
            Apply Search
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Transaction Type</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Types</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="CASH_OUT">CASH_OUT</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="CASH_IN">CASH_IN</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Risk Category</label>
            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(e.target.value); setPage(0); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL RISK">CRITICAL RISK (75-100)</option>
              <option value="HIGH RISK">HIGH RISK (50-74)</option>
              <option value="MEDIUM RISK">MEDIUM RISK (30-49)</option>
              <option value="LOW RISK">LOW RISK (0-29)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Fraud Classification</label>
            <select
              value={fraudFilter}
              onChange={(e) => { setFraudFilter(e.target.value); setPage(0); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Transactions</option>
              <option value="true">Flagged Fraud Only</option>
              <option value="false">Genuine Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Rows Per Page</label>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(0); }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="15">15 records</option>
              <option value="25">25 records</option>
              <option value="50">50 records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-3">Step</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Sender (Orig)</th>
                <th className="py-3 px-4">Recipient (Dest)</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
                      <span>Retrieving transactions from database...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id || t.transactionId} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {t.transactionId}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {t.step}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        t.type === 'TRANSFER' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' :
                        t.type === 'CASH_OUT' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ${t.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {t.nameOrig}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {t.nameDest}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          t.riskScore >= 75 ? 'bg-red-500' :
                          t.riskScore >= 50 ? 'bg-orange-500' :
                          t.riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span className="font-mono font-bold text-slate-200">{t.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.isFraud
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {t.isFraud ? 'FRAUD' : 'GENUINE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectTxn(t)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] border border-slate-700 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{transactions.length}</strong> of{' '}
            <strong className="text-white">{totalElements}</strong> total records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Inspection Modal */}
      {inspectTxn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Forensic Transaction Audit</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {inspectTxn.transactionId}
                </span>
              </div>
              <button
                onClick={() => { setInspectTxn(null); if (setSelectedTxnId) setSelectedTxnId(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Verdict Summary Header */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Assigned Verdict</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-1 rounded text-xs font-black ${
                      inspectTxn.isFraud ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {inspectTxn.isFraud ? 'FRAUDULENT' : 'GENUINE'}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-bold">
                      {inspectTxn.riskCategory} (Score: {inspectTxn.riskScore}/100)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono">Model Evaluated</span>
                  <div className="text-xs font-semibold text-cyan-400 mt-1">{inspectTxn.modelUsed}</div>
                </div>
              </div>

              {/* Balances & Flow */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Origin Account Flow</span>
                  <div className="font-mono font-bold text-slate-200">{inspectTxn.nameOrig}</div>
                  <div className="text-slate-400">
                    Pre-Balance: <span className="text-white font-mono">${inspectTxn.oldbalanceOrg?.toLocaleString()}</span>
                  </div>
                  <div className="text-slate-400">
                    Post-Balance: <span className="text-white font-mono">${inspectTxn.newbalanceOrig?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Destination Account Flow</span>
                  <div className="font-mono font-bold text-slate-200">{inspectTxn.nameDest}</div>
                  <div className="text-slate-400">
                    Pre-Balance: <span className="text-white font-mono">${inspectTxn.oldbalanceDest?.toLocaleString()}</span>
                  </div>
                  <div className="text-slate-400">
                    Post-Balance: <span className="text-white font-mono">${inspectTxn.newbalanceDest?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Explanations & Indicators */}
              {inspectTxn.suspiciousIndicators && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Triggered Indicators</span>
                  <p className="text-red-300 text-xs font-mono">{inspectTxn.suspiciousIndicators}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Synthesized Reasoning</span>
                <p className="text-slate-300 leading-relaxed">"{inspectTxn.explanation}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
