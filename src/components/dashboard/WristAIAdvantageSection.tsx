import React from 'react';
import { Cpu, Layers, HelpCircle, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';

export const WristAIAdvantageSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DETECT',
      sub: 'Localized candidate',
      desc: 'Saliency model pinpoints fracture line lucency in radiograph.',
      icon: Cpu,
      color: 'blue',
    },
    {
      num: '02',
      title: 'EXPLAIN',
      sub: 'Model attention',
      desc: 'Grad-CAM visual heatmap reveals convolutional layer activation.',
      icon: Layers,
      color: 'cyan',
    },
    {
      num: '03',
      title: 'INTERPRET',
      sub: 'Confidence + uncertainty',
      desc: 'Calibrated confidence score with uncertainty-derived review flags.',
      icon: HelpCircle,
      color: 'amber',
    },
    {
      num: '04',
      title: 'VERIFY',
      sub: 'Clinician decision',
      desc: 'Human-in-the-loop review allows radiologist confirmation/override.',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      num: '05',
      title: 'AUDIT',
      sub: 'Traceable workflow',
      desc: 'Complete immutable event log for clinical accountability & governance.',
      icon: FileCheck,
      color: 'purple',
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
      
      {/* Background Radiograph Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
            WRISTAI ADVANTAGE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
            From AI prediction to accountable clinical review.
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A transparent, 5-stage clinical decision-support pipeline engineered for explainability, trust, and human oversight.
          </p>
        </div>

        <div className="text-right hidden xl:block">
          <span className="text-xs font-mono text-slate-400 block">CDSS Standard Compliant</span>
          <span className="text-[10px] text-cyan-400">Radiology Workflow v1.0</span>
        </div>
      </div>

      {/* 5-Step Pipeline Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/80 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white tracking-wide">{step.title}</h3>
                <p className="text-[11px] font-semibold text-cyan-300 mb-1">{step.sub}</p>
                <p className="text-[11px] text-slate-400 leading-snug">{step.desc}</p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block text-slate-600 text-right">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 inline" />
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
