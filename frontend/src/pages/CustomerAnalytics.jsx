import React, { useState, useEffect } from 'react';
import {
  Users, Search, ShieldAlert, ShieldCheck, DollarSign,
  TrendingUp, ArrowRight, UserCheck, Activity, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export const CustomerAnalytics = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers({ query: searchQuery, page: 0, size: 30 });
      setCustomers(res.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInspect = async (accountId) => {
    try {
      setDetailsLoading(true);
      setSelectedCustomer(accountId);
      const data = await api.getCustomer(accountId);
      setCustomerDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Customer Account Behavioral Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detect account takeovers, mule accounts, and anomalous transaction frequencies
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-xl p-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search account identifier (e.g. C1231006815 or M1979787155)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Search
          </button>
        </form>
      </div>

      {/* Grid: Account List (7 Cols) and Inspector (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Account List Table */}
        <div className="lg:col-span-7 glass-panel rounded-xl overflow-hidden border border-slate-800">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white">Monitored Accounts ({customers.length})</span>
            <span className="text-slate-400">Click account to view forensic ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-950 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Account ID</th>
                  <th className="py-2.5 px-2">Type</th>
                  <th className="py-2.5 px-3">Total Volume</th>
                  <th className="py-2.5 px-2">Txns</th>
                  <th className="py-2.5 px-2">Risk</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                      Loading customer entities...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-sans">
                      No customer accounts found.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr
                      key={c.accountId}
                      onClick={() => handleInspect(c.accountId)}
                      className={`hover:bg-slate-850/60 cursor-pointer transition ${
                        selectedCustomer === c.accountId ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white">
                        {c.accountId}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.customerType === 'MERCHANT' ? 'bg-purple-500/15 text-purple-300' : 'bg-blue-500/15 text-blue-300'
                        }`}>
                          {c.customerType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">
                        ${c.totalVolume?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">
                        {c.totalTransactions}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          c.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                          c.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-300' :
                          c.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {c.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <ChevronRight className="w-4 h-4 inline text-slate-500" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Account Details Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {!customerDetails && !detailsLoading && (
            <div className="glass-panel rounded-xl p-8 text-center text-slate-500 border-dashed border-slate-800">
              Select an account from the ledger to inspect transaction profile and behavioral indicators.
            </div>
          )}

          {detailsLoading && (
            <div className="glass-panel rounded-xl p-8 text-center text-slate-400">
              Retrieving customer telemetry...
            </div>
          )}

          {customerDetails && !detailsLoading && (
            <div className="glass-panel rounded-xl p-5 space-y-4 border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Profile Dossier</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {customerDetails.profile?.accountId}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  customerDetails.profile?.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  customerDetails.profile?.riskLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  Risk: {customerDetails.profile?.riskLevel} ({customerDetails.profile?.riskScore}/100)
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Total Volume</span>
                  <div className="text-sm font-bold text-white mt-1">
                    ${customerDetails.profile?.totalVolume?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Average Amount</span>
                  <div className="text-sm font-bold text-cyan-400 mt-1">
                    ${customerDetails.profile?.averageAmount?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Recorded Frauds</span>
                  <div className="text-sm font-bold text-red-400 mt-1">
                    {customerDetails.profile?.fraudCount}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Entity Type</span>
                  <div className="text-sm font-bold text-slate-200 mt-1">
                    {customerDetails.profile?.customerType}
                  </div>
                </div>
              </div>

              {/* Outgoing Activity History */}
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Outgoing Transactions ({customerDetails.outgoingTransactions?.length || 0})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {customerDetails.outgoingTransactions?.slice(0, 5).map((t) => (
                    <div key={t.transactionId} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-xs flex justify-between items-center font-mono">
                      <div>
                        <div className="text-slate-200 font-bold">{t.type} → {t.nameDest}</div>
                        <div className="text-[10px] text-slate-400">${t.amount?.toLocaleString()} • Step {t.step}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.isFraud ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {t.riskCategory}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
