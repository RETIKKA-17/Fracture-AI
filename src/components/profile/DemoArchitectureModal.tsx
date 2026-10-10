import React from 'react';
import { X, ShieldCheck, Activity, Layers, Eye } from 'lucide-react';

interface DemoArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoArchitectureModal: React.FC<DemoArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">WristAI Clinical System Specification</h3>
              <p className="text-xs text-slate-400">Radiology Decision Support Workflow Overview</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 font-sans">
          
          {/* Stage 1: Quality Screening */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Eye className="w-4 h-4 text-amber-600" />
              1. Automated Image Quality Screening
            </div>
            <p className="text-slate-600 leading-relaxed">
              Screens incoming radiographs for motion blur, severe exposure anomalies, and missing anatomical regions prior to fracture evaluation. If image quality is unsuitable, automated analysis is paused and flagged for clinician review.
            </p>
          </div>

          {/* Stage 2: Feature Analysis */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Layers className="w-4 h-4 text-blue-600" />
              2. Cortical Discontinuity & Feature Extraction
            </div>
            <p className="text-slate-600 leading-relaxed">
              Analyzes bony cortical margins, trabecular alignment, and radiocarpal joint spaces. Pinpoints candidate regions with focal cortical disruption or abnormal osteopenia.
            </p>
          </div>

          {/* Stage 3: Visual Explainability */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Activity className="w-4 h-4 text-cyan-600" />
              3. Visual Saliency & Attention Maps
            </div>
            <p className="text-slate-600 leading-relaxed">
              Computes feature activation overlays to highlight candidate fracture zones for radiologist verification. All visual overlays are labeled as advisory decision-support content.
            </p>
          </div>

          {/* Stage 4: Clinician Review */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              4. Clinician Verification & Workstation Integration
            </div>
            <p className="text-slate-600 leading-relaxed">
              Radiologists review candidate findings, verify image quality, and record their final interpretation (Confirm, Edit, Overrule, or Request Secondary View).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
