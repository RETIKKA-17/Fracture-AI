import React from 'react';
import { ArrowRight, Cpu, Sparkles, CheckCircle2, FileSearch } from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onStartNewAnalysis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard, onStartNewAnalysis }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Academic Clinical Decision Support Prototype</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Wrist<span className="text-blue-600">AI</span> <br />
              <span className="text-slate-800 font-bold text-2xl sm:text-4xl block mt-1">
                Clinical Decision Support System
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl">
              Analyse wrist X-ray images with AI-assisted fracture candidate detection, visual evidence mapping, and calibrated confidence for clinician verification.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterDashboard}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group uppercase tracking-wider"
              >
                <span>ENTER CLINICAL WORKSPACE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onStartNewAnalysis}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs hover:border-slate-400 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <FileSearch className="w-4 h-4 text-blue-600" />
                <span>+ ANALYSE NEW X-RAY</span>
              </button>
            </div>

            {/* Key Checklist */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                Grad-CAM Saliency
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                Confidence Aware
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                Human-in-the-Loop
              </div>
            </div>
          </div>

          {/* Right Visual: X-Ray Scanner Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-slate-950 p-3 shadow-2xl border border-slate-800 overflow-hidden">
              
              {/* Header Badges */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>XRAY_CANVAS // AP_VIEW</span>
                </div>
                <span className="text-cyan-400 font-bold">CONF: 94.2%</span>
              </div>

              {/* Image Container with Laser Scanner */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#080C14] flex items-center justify-center">
                <img
                  src="/assets/wrist_fracture.jpg"
                  alt="Medical Wrist X-Ray Scan"
                  className="w-full h-full object-cover filter contrast-125 opacity-90"
                />

                {/* Candidate Bounding Box Overlay */}
                <div className="absolute top-[35%] left-[38%] w-[26%] h-[26%] border-2 border-cyan-400 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.6)] bg-cyan-500/20 backdrop-blur-[1px] flex flex-col justify-between p-1.5 pointer-events-none">
                  <div className="flex justify-between items-center text-[8px] font-mono text-cyan-200 bg-slate-900/90 px-1 py-0.5 rounded">
                    <span>DISTAL_RADIUS</span>
                    <span className="text-cyan-300 font-bold">CANDIDATE #1</span>
                  </div>
                  <div className="w-full bg-slate-950/80 p-1 rounded text-[8px] text-cyan-300 font-mono flex justify-between">
                    <span>CONF: 0.94</span>
                    <span>ROI_01</span>
                  </div>
                </div>

                {/* Laser Scanning Line */}
                <div className="animate-scanner pointer-events-none" />
              </div>

              {/* Console Bar */}
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ResNet-50 Saliency Engine</span>
                </div>
                <span className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                  CDSS WORKSTATION ACTIVE
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
