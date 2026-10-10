import React from 'react';
import { Cpu, UserCheck, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import type { AIResult, ClinicianReview } from '../../types';

interface AIvsClinicianCardProps {
  aiResult: AIResult;
  clinicianReview?: ClinicianReview;
}

export const AIvsClinicianCard: React.FC<AIvsClinicianCardProps> = ({ aiResult, clinicianReview }) => {
  const isReviewed = clinicianReview && clinicianReview.isSaved;
  const agreement = clinicianReview?.agreement;

  const isMatch = agreement === 'Agree';
  const isDiff = agreement === 'Disagree';
  const isPending = !isReviewed || agreement === 'Pending';

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">AI vs Clinician Review</h3>
        </div>

        <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          Human-In-The-Loop Verification
        </span>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left: AI Finding */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Cpu className="w-4 h-4 text-cyan-400" />
              AI Model Prediction
            </span>
            <span className="font-mono text-slate-300">
              {aiResult.prediction === 'AI Model Not Connected' || aiResult.prediction === 'Analysis Failed' || aiResult.prediction === 'Analysis Not Performed'
                ? 'N/A'
                : `${aiResult.confidence}% Confidence`}
            </span>
          </div>

          <div className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {aiResult.prediction === 'AI Model Not Connected' ? (
              <span className="text-slate-300 flex items-center gap-2 text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                AI Model Not Connected
              </span>
            ) : aiResult.prediction === 'Analysis Failed' ? (
              <span className="text-rose-400 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Analysis Failed
              </span>
            ) : aiResult.prediction === 'Analysis Not Performed' ? (
              <span className="text-amber-400 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Analysis Paused
              </span>
            ) : aiResult.prediction === 'Fracture Suspected' ? (
              <span className="text-rose-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                Fracture Suspected
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                No Fracture Detected
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Target Region: <span className="text-slate-200">{aiResult.suspectedRegion}</span>
          </p>
        </div>

        {/* Right: Clinician Finding */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Clinician Assessment
            </span>
            <span className="text-slate-400">{clinicianReview?.clinicianName || 'Dr. Clinician'}</span>
          </div>

          <div className="text-lg font-bold">
            {isPending && (
              <span className="text-amber-400 text-sm font-semibold italic flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Review Pending Confirmation
              </span>
            )}
            {isMatch && (
              <span className="text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Confirmed (Agreed with AI)
              </span>
            )}
            {isDiff && (
              <span className="text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Disagreed (Overruled AI)
              </span>
            )}
            {agreement === 'Needs Further Review' && (
              <span className="text-amber-400 flex items-center gap-2 text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Needs CT / Secondary View
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 truncate">
            {clinicianReview?.notes || 'No clinical notes added yet.'}
          </p>
        </div>

      </div>

      {/* Match / Difference Status Banner */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Decision Alignment Status:</span>

        {isMatch && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Decision Match ✓
          </span>
        )}

        {isDiff && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Review Difference ⚠️
          </span>
        )}

        {isPending && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Awaiting Clinician Action
          </span>
        )}
      </div>

    </div>
  );
};
