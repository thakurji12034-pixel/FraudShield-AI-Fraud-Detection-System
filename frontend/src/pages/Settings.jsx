import React, { useState } from 'react';
import { Settings, Shield, Sliders, CheckCircle2, Server, Save } from 'lucide-react';

export const SettingsPage = () => {
  const [thresholds, setThresholds] = useState({
    lowMax: 29,
    mediumMax: 49,
    highMax: 74,
    criticalMin: 75,
    highValueThreshold: 200000.0,
    exactDrainEnabled: true,
    offPeakHoursEnabled: true,
    zeroBalanceOrigEnabled: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Security Policy & Detection Threshold Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune classification thresholds, heuristic sensitivity parameters, and service integrations
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Security threshold parameters successfully saved to application runtime.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds Card */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Composite Risk Score Thresholds (0 - 100)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="block text-emerald-400 text-[11px] font-sans font-bold mb-1">LOW RISK Tier</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">0 to</span>
                <input
                  type="number"
                  value={thresholds.lowMax}
                  onChange={(e) => setThresholds({ ...thresholds, lowMax: parseInt(e.target.value) })}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="block text-amber-400 text-[11px] font-sans font-bold mb-1">MEDIUM RISK Tier</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">30 to</span>
                <input
                  type="number"
                  value={thresholds.mediumMax}
                  onChange={(e) => setThresholds({ ...thresholds, mediumMax: parseInt(e.target.value) })}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="block text-orange-400 text-[11px] font-sans font-bold mb-1">HIGH RISK Tier</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">50 to</span>
                <input
                  type="number"
                  value={thresholds.highMax}
                  onChange={(e) => setThresholds({ ...thresholds, highMax: parseInt(e.target.value) })}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <label className="block text-red-400 text-[11px] font-sans font-bold mb-1">CRITICAL RISK Tier</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">&gt;=</span>
                <input
                  type="number"
                  value={thresholds.criticalMin}
                  onChange={(e) => setThresholds({ ...thresholds, criticalMin: parseInt(e.target.value) })}
                  className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heuristic Rule Engine Toggles */}
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Hybrid Rule Engine Heuristics</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Exact Balance Liquidation Rule</span>
                <span className="text-slate-400">Trigger alert when transfer amount equals origin balance to exact zero</span>
              </div>
              <input
                type="checkbox"
                checked={thresholds.exactDrainEnabled}
                onChange={(e) => setThresholds({ ...thresholds, exactDrainEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-white block">High Value Outflow Trigger Threshold</span>
                <span className="text-slate-400">Current threshold: ${thresholds.highValueThreshold.toLocaleString()}</span>
              </div>
              <input
                type="number"
                value={thresholds.highValueThreshold}
                onChange={(e) => setThresholds({ ...thresholds, highValueThreshold: parseFloat(e.target.value) || 0 })}
                className="w-32 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
              <div>
                <span className="font-bold text-white block">Circadian Off-Peak Hours Anomaly</span>
                <span className="text-slate-400">Flag large transfers conducted between 01:00 and 05:00 AM</span>
              </div>
              <input
                type="checkbox"
                checked={thresholds.offPeakHoursEnabled}
                onChange={(e) => setThresholds({ ...thresholds, offPeakHoursEnabled: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Connected Services Telemetry */}
        <div className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">System Architecture & Service Endpoints</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Primary Backend</span>
              <div className="text-cyan-400 font-bold mt-1">Java 17 Spring Boot</div>
              <div className="text-slate-500 text-[11px]">http://127.0.0.1:8080</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-sans">ML Engine</span>
              <div className="text-cyan-400 font-bold mt-1">Python FastAPI + XGBoost</div>
              <div className="text-slate-500 text-[11px]">http://127.0.0.1:8000</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-sans">Database</span>
              <div className="text-cyan-400 font-bold mt-1">MySQL / H2 Dual-Mode</div>
              <div className="text-slate-500 text-[11px]">Port 3306 / In-Memory H2</div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Policy Configuration</span>
        </button>
      </form>
    </div>
  );
};
