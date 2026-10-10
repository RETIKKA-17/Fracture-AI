import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UncertaintyBannerProps {
  confidence: number;
  reason?: 'Low model confidence' | 'Image quality concern' | 'Ambiguous candidate' | string;
}

export const UncertaintyBanner: React.FC<UncertaintyBannerProps> = ({
  confidence,
  reason = 'Low model confidence',
}) => {
  const isUncertain = confidence < 80 || reason !== 'None';

  if (!isUncertain) return null;

  return (
    <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
              REVIEW RECOMMENDED
            </span>
            <span className="text-xs font-mono font-semibold text-amber-800">
              Uncertainty Reason: {reason}
            </span>
          </div>

          <p className="text-sm font-semibold text-amber-950 mt-1">
            The system has identified an uncertain case and recommends clinician review.
          </p>
          <p className="text-xs text-amber-800 mt-0.5">
            Model score ({confidence}%) falls below high-confidence automated threshold (&gt;90%). Secondary radiological evaluation or CT scan advised.
          </p>
        </div>
      </div>

      <div className="shrink-0 bg-white/80 p-3 rounded-xl border border-amber-200 text-right text-xs">
        <span className="text-amber-800 font-bold block">Action Required</span>
        <span className="text-amber-700 text-[11px]">Perform manual verification</span>
      </div>

    </div>
  );
};
