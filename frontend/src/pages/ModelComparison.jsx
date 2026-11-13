import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, Cpu, Zap, Clock, ShieldCheck,
  TrendingUp, Award, BarChart3, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { api } from '../services/api';

export const ModelComparison = () => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [activeModel, setActiveModel] = useState('Random Forest');

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await api.getModels();
      setModelData(res);
      setActiveModel(res.active_model || 'Random Forest');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSelectModel = async (modelName) => {
    try {
      setSwitching(true);
      await api.selectActiveModel(modelName);
      setActiveModel(modelName);
      fetchModels();
    } catch (err) {
      alert(err.message || 'Failed to switch active model');
    } finally {
      setSwitching(false);
    }
  };

  const models = modelData?.models || {};
  const modelList = Object.values(models);

  // Chart comparison data
  const chartData = modelList.map(m => ({
    name: m.algorithm,
    Precision: (m.precision * 100).toFixed(1),
    Recall: (m.recall * 100).toFixed(1),
    F1: (m.f1_score * 100).toFixed(1),
    PRAUC: (m.pr_auc * 100).toFixed(1)
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Machine Learning Model Arena & Benchmark Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical evaluation of 5 algorithms trained with chronological splitting and class weighting on PaySim data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Current Active Model</span>
            <div className="text-sm font-bold text-cyan-400 font-mono">{activeModel}</div>
          </div>
          <button
            onClick={fetchModels}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {modelList.map((m) => {
          const isActive = m.algorithm === activeModel;
          return (
            <div
              key={m.algorithm}
              className={`glass-panel rounded-xl p-4 border transition flex flex-col justify-between ${
                isActive
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/15 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white leading-tight truncate">{m.algorithm}</span>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold shrink-0">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <div className="flex justify-between">
                    <span>F1 Score:</span>
                    <strong className="text-white">{(m.f1_score * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PR-AUC:</span>
                    <strong className="text-cyan-400">{(m.pr_auc * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Recall:</span>
                    <strong className="text-emerald-400">{(m.recall * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Precision:</span>
                    <strong className="text-blue-400">{(m.precision * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>FPR:</span>
                    <strong className="text-red-400">{(m.false_positive_rate * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>Latency:</span>
                    <span>{m.prediction_latency_ms?.toFixed(3)} ms</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectModel(m.algorithm)}
                disabled={isActive || switching}
                className={`mt-4 w-full py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isActive ? 'Current Engine' : 'Deploy Model'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Model Evaluation Metrics Comparison Chart */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Algorithm Benchmark Comparison (Chronological Test Holdout)</h3>
            <p className="text-xs text-slate-400">Evaluating fraud recall, precision, and PR-AUC under realistic imbalanced distributions</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="PRAUC" name="PR-AUC (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" name="Recall (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" name="Precision (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" name="F1 Score (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Confusion Matrix Table */}
      <div className="glass-panel rounded-xl p-5 overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-3">Audited Confusion Matrix & Latency Profiles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Algorithm</th>
                <th className="py-2.5 px-3">True Positives (TP)</th>
                <th className="py-2.5 px-3">False Positives (FP)</th>
                <th className="py-2.5 px-3">False Negatives (FN)</th>
                <th className="py-2.5 px-3">True Negatives (TN)</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">Train Time</th>
                <th className="py-2.5 px-3">Inference Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {modelList.map((m) => (
                <tr key={m.algorithm} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-bold text-white font-sans flex items-center gap-2">
                    {m.algorithm}
                    {m.algorithm === activeModel && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{m.confusion_matrix?.true_positive?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-red-400">{m.confusion_matrix?.false_positive?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-amber-400">{m.confusion_matrix?.false_negative?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-300">{m.confusion_matrix?.true_negative?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-cyan-400">{m.roc_auc?.toFixed(4)}</td>
                  <td className="py-3 px-3 text-slate-400">{m.training_time_seconds}s</td>
                  <td className="py-3 px-3 text-slate-400">{m.prediction_latency_ms?.toFixed(4)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
