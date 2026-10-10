import React from 'react';
import { Activity, Info } from 'lucide-react';

interface ConfidenceProfileChartProps {
  confidencePercentage: number; // 0 to 100
  referralThreshold?: number; // default 0.70
}

export const ConfidenceProfileChart: React.FC<ConfidenceProfileChartProps> = ({
  confidencePercentage,
  referralThreshold = 0.70,
}) => {
  const confidenceScore = Math.min(Math.max(confidencePercentage / 100, 0), 1);
  const currentCaseX = confidenceScore * 100; // Percentage along X-axis
  const thresholdX = referralThreshold * 100;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
      
      {/* Title Header with DEMO Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              CONFIDENCE & EVIDENCE PROFILE
            </h3>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              DEMO / ILLUSTRATIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decision support level mapped against calibrated model confidence score.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Explanatory Visualization</span>
        </div>
      </div>

      {/* SVG Line Chart Area */}
      <div className="space-y-2">
        <div className="relative aspect-[16/6] min-h-[180px] bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden shadow-inner">
          
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:10%_33.33%] opacity-40 pointer-events-none" />

          {/* Decision Support Bands Labels (Y-Axis) */}
          <div className="absolute left-3 top-3 bottom-8 flex flex-col justify-between text-[9px] font-mono font-bold text-slate-400 z-10 pointer-events-none">
            <span className="text-cyan-400">HIGH DECISION SUPPORT</span>
            <span className="text-blue-400">MODERATE</span>
            <span className="text-slate-500">LOW</span>
          </div>

          {/* Line Chart & Threshold Markers Canvas */}
          <svg className="w-full h-full text-blue-500" viewBox="0 0 400 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </linearGradient>

              <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="70%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Shaded Area under curve */}
            <path
              d="M 40 130 Q 150 120, 240 80 T 360 20 L 360 130 Z"
              fill="url(#curveGradient)"
            />

            {/* Sigmoid Decision Curve */}
            <path
              d="M 40 130 Q 150 120, 240 80 T 360 20"
              fill="none"
              stroke="url(#strokeGrad)"
              strokeWidth="3"
            />

            {/* Referral Threshold Line (0.70) */}
            <line
              x1={40 + 3.2 * (thresholdX)}
              y1="10"
              x2={40 + 3.2 * (thresholdX)}
              y2="135"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Current Case Active Marker Line */}
            <line
              x1={40 + 3.2 * (currentCaseX)}
              y1="10"
              x2={40 + 3.2 * (currentCaseX)}
              y2="135"
              stroke="#06b6d4"
              strokeWidth="2"
            />

            {/* Current Case Dot */}
            <circle
              cx={40 + 3.2 * (currentCaseX)}
              cy={130 - (currentCaseX * 1.1)}
              r="6"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="2"
            />
          </svg>

          {/* Floating Referral Threshold Label */}
          <div
            className="absolute top-2 -translate-x-1/2 bg-amber-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[9px] font-mono font-bold shadow-md z-20 pointer-events-none"
            style={{ left: `${Math.max(15, Math.min(85, thresholdX))}%` }}
          >
            REFERRAL THRESHOLD ({referralThreshold.toFixed(2)})
          </div>

          {/* Floating Current Case Label */}
          <div
            className="absolute bottom-10 -translate-x-1/2 bg-cyan-950/90 text-cyan-300 border border-cyan-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold shadow-lg z-20 pointer-events-none flex items-center gap-1"
            style={{ left: `${Math.max(20, Math.min(80, currentCaseX))}%` }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>CURRENT CASE ({confidenceScore.toFixed(2)})</span>
          </div>

          {/* X-Axis Scale Labels */}
          <div className="absolute bottom-1 left-10 right-4 flex justify-between text-[9px] font-mono text-slate-500 font-bold border-t border-slate-800 pt-1">
            <span>0.0 (Low)</span>
            <span>0.25</span>
            <span>0.50</span>
            <span>0.75</span>
            <span>1.0 (High)</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-mono text-center">
          Note: This curve provides a conceptual visualization of decision support referral cut-offs for demo evaluation purposes.
        </p>
      </div>

    </div>
  );
};
