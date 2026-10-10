import React from 'react';
import { BarChart2, ShieldAlert } from 'lucide-react';

interface EvidenceBreakdownChartProps {
  detectionScore?: number;
  localizationScore?: number;
  qualityScore?: number;
  confidenceScore?: number;
  explanationScore?: number;
}

export const EvidenceBreakdownChart: React.FC<EvidenceBreakdownChartProps> = ({
  detectionScore = 90,
  localizationScore = 85,
  qualityScore = 88,
  confidenceScore = 87,
  explanationScore = 82,
}) => {
  const categories = [
    { label: 'Detection', value: detectionScore, color: 'bg-blue-600', text: 'text-blue-700' },
    { label: 'Localization', value: localizationScore, color: 'bg-cyan-500', text: 'text-cyan-700' },
    { label: 'Image Quality Screening', value: qualityScore, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Model Confidence', value: confidenceScore, color: 'bg-amber-500', text: 'text-amber-700' },
    { label: 'Feature Explanation', value: explanationScore, color: 'bg-teal-600', text: 'text-teal-700' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
      
      {/* Title & Warning Label (Requirement #7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-600" />
            AI EVIDENCE BREAKDOWN
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pipeline stage feature strength breakdown for active radiograph evaluation.
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>DEMO EVIDENCE PROFILE — NOT VALIDATED PERFORMANCE</span>
        </span>
      </div>

      {/* Horizontal Bar Chart (Requirement #7) */}
      <div className="space-y-3.5">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">{cat.label}</span>
              <span className={`font-mono font-bold ${cat.text}`}>{cat.value} / 100</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cat.color}`}
                style={{ width: `${cat.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Disclaimer */}
      <p className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-100">
        Illustrative pipeline evidence weights. Standardized clinical accuracy metrics are evaluated under the Evaluation view.
      </p>

    </div>
  );
};
