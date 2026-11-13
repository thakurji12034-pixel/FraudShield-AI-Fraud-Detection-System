import React, { useState } from 'react';
import {
  Cpu, Sparkles, TrendingUp, AlertTriangle, ShieldCheck,
  CheckCircle2, Info, ArrowRight, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell
} from 'recharts';

export const ExplainableAI = () => {
  const [selectedCase, setSelectedCase] = useState('drain');

  // Global feature importance weights from TreeExplainer
  const globalFeatureImportance = [
    { feature: 'amount', importance: 0.38, desc: 'Transaction value magnitude' },
    { feature: 'is_exact_balance_drain', importance: 0.28, desc: 'Balance emptied to exact zero' },
    { feature: 'oldbalanceOrg', importance: 0.16, desc: 'Sender pre-transaction balance' },
    { feature: 'type_TRANSFER', importance: 0.12, desc: 'Transfer channel vulnerability' },
    { feature: 'diff_orig_balance', importance: 0.08, desc: 'Net balance differential' },
    { feature: 'oldbalanceDest', importance: 0.06, desc: 'Recipient pre-existing balance' },
    { feature: 'type_CASH_OUT', importance: 0.05, desc: 'Cashout liquidation route' },
    { feature: 'hour_of_day', importance: 0.03, desc: 'Circadian off-peak timing' }
  ];

  const caseStudies = {
    drain: {
      title: 'Case Study: Account Liquidation via Wire Transfer',
      txnId: 'TXN-829104',
      type: 'TRANSFER',
      amount: '$740,000.00',
      origBalance: '$740,000.00 (Drained to $0.00)',
      destBalance: '$0.00 (Unverified Recipient)',
      score: 83,
      verdict: 'CRITICAL RISK (Fraud Confirmed)',
      shapContributions: [
        { feature: 'is_exact_balance_drain', impact: 0.42, direction: 'RISK_INCREASING' },
        { feature: 'amount', impact: 0.35, direction: 'RISK_INCREASING' },
        { feature: 'type_TRANSFER', impact: 0.22, direction: 'RISK_INCREASING' },
        { feature: 'is_zero_dest_balance', impact: 0.14, direction: 'RISK_INCREASING' },
        { feature: 'dest_is_merchant', impact: -0.05, direction: 'RISK_DECREASING' }
      ],
      explanation: 'The model identified a classic account compromise signature: an origin balance was entirely liquidated in a single massive wire transfer directed to a recipient account with no recorded operating history.'
    },
    genuine: {
      title: 'Case Study: Normal High-Volume Merchant Purchase',
      txnId: 'TXN-104928',
      type: 'PAYMENT',
      amount: '$1,250.00',
      origBalance: '$18,400.00 (Remaining: $17,150.00)',
      destBalance: '$0.00 (Verified Commercial Merchant)',
      score: 8,
      verdict: 'LOW RISK (Genuine Approved)',
      shapContributions: [
        { feature: 'dest_is_merchant', impact: -0.32, direction: 'RISK_DECREASING' },
        { feature: 'type_PAYMENT', impact: -0.28, direction: 'RISK_DECREASING' },
        { feature: 'diff_orig_balance', impact: -0.18, direction: 'RISK_DECREASING' },
        { feature: 'amount', impact: 0.08, direction: 'RISK_INCREASING' }
      ],
      explanation: 'Although the purchase amount is above retail median, the counterparty is a certified merchant (M-prefix identifier) and sender balance retained 93.2% of verified capital, precluding liquidation risk.'
    }
  };

  const activeCase = caseStudies[selectedCase];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Explainable AI (XAI) & SHAP Interpretability Center
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Eliminating black-box ambiguity: audit feature attributions, Shapley values, and domain causal drivers
        </p>
      </div>

      {/* Global Feature Importance Chart */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Global Feature Attribution (Mean |SHAP Value|)</h3>
            <p className="text-xs text-slate-400">Primary behavioral determinants across 365,000+ training instances</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            SHAP TreeExplainer
          </span>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={globalFeatureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Relative Impact']}
              />
              <Bar dataKey="importance" fill="#06b6d4" radius={[0, 4, 4, 0]}>
                {globalFeatureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : index < 5 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Case Study Deep Dive */}
      <div className="glass-panel rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Local Transaction Attribution Inspector</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCase('drain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCase === 'drain'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Flagged Fraud Case
            </button>
            <button
              onClick={() => setSelectedCase('genuine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCase === 'genuine'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Approved Genuine Case
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transaction Metadata (5 Cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">{activeCase.txnId}</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                activeCase.score >= 50 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {activeCase.verdict}
              </span>
            </div>

            <div className="space-y-1.5 text-slate-300 font-mono pt-2 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <strong>{activeCase.type}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <strong className="text-white">{activeCase.amount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Origin Account:</span>
                <span>{activeCase.origBalance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination Account:</span>
                <span>{activeCase.destBalance}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 mt-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Causal Synthesis</span>
              <p className="text-slate-300 leading-relaxed font-sans">{activeCase.explanation}</p>
            </div>
          </div>

          {/* Local Feature SHAP Waterfall (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Individual Feature Shapley Contribution (Base Score: 10 → Final Score: {activeCase.score})
            </span>
            <div className="space-y-2">
              {activeCase.shapContributions.map((fc, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-300">{fc.feature}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      {fc.direction === 'RISK_INCREASING' ? 'Pushes toward Fraud' : 'Pushes toward Genuine'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                      fc.impact > 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {fc.impact > 0 ? `+${(fc.impact * 100).toFixed(0)}%` : `${(fc.impact * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
