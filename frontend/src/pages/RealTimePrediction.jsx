import React, { useState } from 'react';
import {
  Zap, AlertTriangle, ShieldCheck, ShieldAlert, Cpu, Sparkles,
  ArrowRight, RefreshCw, Info, CheckCircle2, AlertOctagon, TrendingUp
} from 'lucide-react';
import { api } from '../services/api';

const SCENARIOS = [
  {
    name: '🔴 High-Value Balance Drain (Fraud)',
    desc: 'Rapid TRANSFER of $650,000 completely draining origin balance to zero with new destination.',
    data: {
      type: 'TRANSFER',
      amount: 650000.0,
      step: 315,
      nameOrig: 'C817263541',
      oldbalanceOrg: 650000.0,
      nameDest: 'C192837465',
      oldbalanceDest: 0.0
    }
  },
  {
    name: '🟢 Normal Merchant Purchase (Genuine)',
    desc: 'Ordinary grocery PAYMENT of $62.50 to verified merchant with plenty of remaining funds.',
    data: {
      type: 'PAYMENT',
      amount: 62.50,
      step: 18,
      nameOrig: 'C451298730',
      oldbalanceOrg: 3420.0,
      nameDest: 'M982371625',
      oldbalanceDest: 0.0
    }
  },
  {
    name: '🔴 Off-Peak CASH_OUT Liquidation (Fraud)',
    desc: 'Early morning CASH_OUT of $410,000 from depleted origin account to intermediate account.',
    data: {
      type: 'CASH_OUT',
      amount: 410000.0,
      step: 291, // 3 AM
      nameOrig: 'C991827364',
      oldbalanceOrg: 410000.0,
      nameDest: 'C334455667',
      oldbalanceDest: 15000.0
    }
  },
  {
    name: '🟢 Domestic Peer Transfer (Genuine)',
    desc: 'Regular family TRANSFER of $250 with healthy pre-existing origin and destination balances.',
    data: {
      type: 'TRANSFER',
      amount: 250.0,
      step: 42,
      nameOrig: 'C771122334',
      oldbalanceOrg: 9500.0,
      nameDest: 'C882233445',
      oldbalanceDest: 4200.0
    }
  }
];

export const RealTimePrediction = () => {
  const [formData, setFormData] = useState({
    transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    step: 250,
    type: 'TRANSFER',
    amount: 500000.0,
    nameOrig: 'C102938475',
    oldbalanceOrg: 500000.0,
    nameDest: 'C987654321',
    oldbalanceDest: 0.0
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['step', 'amount', 'oldbalanceOrg', 'oldbalanceDest'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const loadScenario = (scenario) => {
    setFormData({
      transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      ...scenario.data
    });
    setResult(null);
    setError(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictTransaction(formData);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Scoring engine error');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-red-500 border-red-500 bg-red-500/10';
    if (score >= 50) return 'text-orange-500 border-orange-500 bg-orange-500/10';
    if (score >= 30) return 'text-amber-500 border-amber-500 bg-amber-500/10';
    return 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Real-Time Transaction Risk Scoring Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate inbound financial transactions against machine learning models and domain heuristic rules
          </p>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Test Bench Benchmark Scenarios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((sc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadScenario(sc)}
              className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition group"
            >
              <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                {sc.name}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                {sc.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Form & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form (7 Cols) */}
        <form onSubmit={handlePredict} className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Transaction Parameter Intake
            </h3>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}` }))}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> New Txn ID
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transaction ID</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Step (Hour: 1-744)</label>
              <input
                type="number"
                name="step"
                value={formData.step}
                onChange={handleChange}
                min="1"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="TRANSFER">TRANSFER (High Vulnerability)</option>
                <option value="CASH_OUT">CASH_OUT (High Vulnerability)</option>
                <option value="PAYMENT">PAYMENT (Standard)</option>
                <option value="CASH_IN">CASH_IN (Deposit)</option>
                <option value="DEBIT">DEBIT (Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Amount ($)</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Origin Account (Sender)</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Origin Account ID</label>
                <input
                  type="text"
                  name="nameOrig"
                  value={formData.nameOrig}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pre-Transaction Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="oldbalanceOrg"
                  value={formData.oldbalanceOrg}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Destination Account (Recipient)</span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination ID (M = Merchant)</label>
                <input
                  type="text"
                  name="nameDest"
                  value={formData.nameDest}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pre-Transaction Balance ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="oldbalanceDest"
                  value={formData.oldbalanceDest}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Running Inference & Rule Engine...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Evaluate Transaction Risk Score</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Prediction Results Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[460px] border-dashed border-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4">
                <Cpu className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-300 mb-1">Awaiting Transaction Parameters</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Fill the transaction values or select one of the benchmark scenarios above to score the transaction in real time.
              </p>
            </div>
          )}

          {result && (
            <div className="glass-panel rounded-2xl p-6 space-y-5 border border-slate-700 shadow-2xl relative overflow-hidden">
              {/* Risk Score Gauge Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 tracking-wider">DECISION RESULT</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wide border ${getScoreColor(result.riskScore)}`}>
                      {result.riskCategory}
                    </span>
                    {result.alertId && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-mono font-bold">
                        {result.alertId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black font-mono text-white tracking-tight">
                    {result.riskScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Composite Risk Score</span>
                </div>
              </div>

              {/* Probability & Model Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Fraud Probability</span>
                  <div className="font-mono font-bold text-base text-cyan-400 mt-0.5">
                    {(result.fraudProbability * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Active ML Model</span>
                  <div className="font-semibold text-slate-200 mt-0.5 truncate">
                    {result.activeModel}
                  </div>
                </div>
              </div>

              {/* Hybrid Rule Triggers */}
              <div>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                  Hybrid Rule Engine Triggers ({result.suspiciousIndicators?.length || 0})
                </span>
                {result.suspiciousIndicators && result.suspiciousIndicators.length > 0 ? (
                  <ul className="space-y-1.5">
                    {result.suspiciousIndicators.map((ind, i) => (
                      <li key={i} className="text-xs p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300 flex items-start gap-2">
                        <span className="text-red-400 font-bold shrink-0">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>No domain heuristic violations triggered.</span>
                  </div>
                )}
              </div>

              {/* Explainable AI (SHAP / Feature Impact) */}
              <div>
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Explainable AI (Feature Contributions)
                </span>
                <div className="space-y-1.5">
                  {result.featureContributions?.map((fc, i) => (
                    <div key={i} className="text-xs flex items-center justify-between p-1.5 rounded bg-slate-900/70 border border-slate-800">
                      <span className="font-mono text-slate-300 text-[11px]">{fc.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">{fc.value}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          fc.direction === 'RISK_INCREASING' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {fc.impact > 0 ? `+${fc.impact}` : fc.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Natural Language Explanation Text */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Synthesized Forensics Note
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "{result.explanationText}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
