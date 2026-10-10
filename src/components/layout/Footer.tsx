import React from 'react';
import { ShieldAlert, Activity, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left: Project title */}
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              WristAI Clinical Support System
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              An AI-Based Clinical Decision Support System for Wrist Fracture Detection. Academic Research & Medical Demo Prototype.
            </p>
          </div>

          {/* Center: Disclaimer Callout */}
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-semibold text-amber-200 block mb-0.5">Clinical Disclaimer</span>
              AI outputs provide supportive decision data for radiologist evaluation. Final diagnosis and treatment decisions belong solely to qualified clinical professionals.
            </div>
          </div>

          {/* Right: Technical Features */}
          <div className="text-right md:text-right text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-end gap-1.5 text-slate-300 font-medium">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Grad-CAM Explainability + Confidence Awareness
            </div>
            <p>© 2026 Academic AI Project Review</p>
            <p className="text-slate-500 text-[10px]">Built with React, TypeScript & Medical AI Guidelines</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
