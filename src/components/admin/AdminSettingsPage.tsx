import React, { useState } from 'react';
import { Sliders, ShieldCheck, Cpu, Database, CheckCircle2, Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [minConfidence, setMinConfidence] = useState(75);
  const [qualityScreeningStrictness, setQualityScreeningStrictness] = useState('Standard');
  const [requireDoubleSignoff, setRequireDoubleSignoff] = useState(false);
  const [demoAuthMode, setDemoAuthMode] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Policies</h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              ADMIN SETTINGS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure system security, clinical decision support thresholds, and backend integration settings.
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration parameters saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Clinical Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              1. Clinical Decision Support Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Minimum Confidence Flag Threshold ({minConfidence}%)</label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Cases with model confidence below {minConfidence}% are flagged as "Uncertain — Review Recommended".
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">Image Quality Screening Strictness</label>
              <select
                value={qualityScreeningStrictness}
                onChange={(e) => setQualityScreeningStrictness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Permissive">Permissive (Log warnings only)</option>
                <option value="Standard">Standard (Pause automated inference on severe blur/contrast)</option>
                <option value="Strict">Strict (Require high resolution & zero blur)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Section 2: Security & Authentication Policy */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              2. Authentication & Access Governance
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Development Demo Authentication Mode</span>
                <span className="text-[11px] text-slate-500">Enable quick one-click demo login buttons for Doctor & Admin testing</span>
              </div>
              <input
                type="checkbox"
                checked={demoAuthMode}
                onChange={(e) => setDemoAuthMode(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Require Senior Radiologist Dual Sign-off</span>
                <span className="text-[11px] text-slate-500">Require two independent doctor reviews before archiving high-risk fracture cases</span>
              </div>
              <input
                type="checkbox"
                checked={requireDoubleSignoff}
                onChange={(e) => setRequireDoubleSignoff(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Integration Endpoint Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              3. Production Service Integration Interface
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-sans">OAuth2 / OIDC Auth Provider URL</label>
              <input
                type="text"
                readOnly
                value="https://auth.hospital-pacs.org/realms/radiology"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] font-sans">PyTorch Model Inference Endpoint</label>
              <input
                type="text"
                readOnly
                value="http://localhost:8000/api/v1/infer/wrist-fracture"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-600 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
