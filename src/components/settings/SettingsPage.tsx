import React, { useState } from 'react';
import { Sliders, User, ShieldCheck, HardDrive, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviewerName, setReviewerName] = useState(user?.name || 'Dr. Clinician');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workstation Settings & Environment Preferences</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure reviewer display identity, supported formats, prototype limits, and model connection parameters.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-xl border border-cyan-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          CDSS PROTOTYPE SETTINGS
        </span>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Settings saved successfully. Reviewer preferences updated.</span>
        </div>
      )}

      {/* Reviewer Profile Preferences */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Reviewer Identity & Workstation Display
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Local Session Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reviewer Display Name
            </label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Workspace Theme
            </label>
            <select
              value={themeMode}
              onChange={(e) => setThemeMode(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="light">Light Clinical Theme (Default)</option>
              <option value="dark">Dark Radiology Canvas Theme</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs uppercase tracking-wider font-mono"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Supported Image Formats & Technical Limits */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Supported Formats & Data Handling
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Workstation Specifications</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block uppercase text-[10px] font-mono">SUPPORTED FORMATS</span>
            <span className="text-slate-900 font-bold block">PNG, JPEG, JPG</span>
            <p className="text-slate-500 text-[11px]">Exported DICOM radiographs supported via standard web canvas format.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block uppercase text-[10px] font-mono">FILE SIZE LIMIT</span>
            <span className="text-slate-900 font-bold block">Max 15.0 MB per image</span>
            <p className="text-slate-500 text-[11px]">Recommended matrix dimensions &ge; 1024x1024 pixels.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block uppercase text-[10px] font-mono">STORAGE ARCHITECTURE</span>
            <span className="text-slate-900 font-bold block">Local Storage Repository</span>
            <p className="text-slate-500 text-[11px]">No patient-identifying data sent to external cloud servers in demo mode.</p>
          </div>
        </div>
      </div>

      {/* Analysis Engine Configuration & Status */}
      <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Clinical Decision Support System Status
            </h2>
          </div>
          <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/30">
            DEMO ANALYSIS ENGINE ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">ANALYSIS ENGINE</span>
            <span className="text-emerald-400 font-bold block">WristAI Core v1.0</span>
            <span className="text-slate-500 text-[9px] block">Distal radius feature screening</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">QUALITY SCREENING</span>
            <span className="text-emerald-400 font-bold block">Blur & Contrast Check</span>
            <span className="text-slate-500 text-[9px] block">Radiograph clarity verification</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">INTEGRATION STATUS</span>
            <span className="text-cyan-400 font-bold block">Local Decision Support</span>
            <span className="text-slate-500 text-[9px] block">Offline workstation mode</span>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase font-bold">VISUAL EXPLAINABILITY</span>
            <span className="text-emerald-400 font-bold block">Candidate Attention Map</span>
            <span className="text-slate-500 text-[9px] block">Focal region highlight</span>
          </div>
        </div>
      </div>

      {/* Prototype Limitations Banner */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider font-mono">
          <AlertCircle className="w-4 h-4" />
          <span>Research Prototype Limitations & Boundaries</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          WristAI is a clinical decision support prototype developed for academic research. It is not an autonomous diagnostic system and has not received regulatory clearance (e.g., FDA/CE mark). All predictions require verification by a qualified radiologist or medical clinician.
        </p>
      </div>

    </div>
  );
};
