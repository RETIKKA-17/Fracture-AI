import React from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, XCircle } from 'lucide-react';
import type { ImageQualityChecks } from '../../types';

interface QualityCardProps {
  qualityChecks?: ImageQualityChecks;
  imageQualityLabel?: string;
  isImageError?: boolean;
}

export type QualityAssessmentState =
  | 'Not Assessed'
  | 'Assessment in Progress'
  | 'Review Required'
  | 'Assessment Complete';

export const QualityCard: React.FC<QualityCardProps> = ({
  qualityChecks,
  imageQualityLabel = 'Suitable for analysis',
  isImageError = false,
}) => {
  const checks = qualityChecks || {
    resolution: true,
    fieldOfView: true,
    contrast: true,
    brightness: true,
    wristVisibility: true,
    imageIntegrity: true,
    screeningStatus: 'PASS' as const,
    qualityFlags: [],
    status: 'GOOD' as const,
  };

  const items = [
    { label: 'Resolution', passed: !isImageError && checks.resolution, desc: '≥ 1024x1024 DICOM matrix' },
    { label: 'Field of view', passed: !isImageError && checks.fieldOfView, desc: 'Distal radius & carpal joints included' },
    { label: 'Contrast', passed: !isImageError && checks.contrast, desc: 'Bony trabeculae & soft tissue visible' },
    { label: 'Brightness', passed: !isImageError && checks.brightness, desc: 'No severe under/over exposure' },
    { label: 'Wrist visibility', passed: !isImageError && checks.wristVisibility, desc: 'Positioned within central ROI' },
    { label: 'Image integrity', passed: !isImageError && checks.imageIntegrity, desc: 'No motion artifact or metal overlap' },
  ];

  // Determine standardized assessment state (Requirement #3)
  let assessmentState: QualityAssessmentState = 'Assessment Complete';
  if (isImageError) {
    assessmentState = 'Not Assessed';
  } else if (checks.screeningStatus === 'REVIEW_REQUIRED' || checks.status === 'QUALITY REVIEW REQUIRED') {
    assessmentState = 'Review Required';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Image Quality Assessment
          </h3>
        </div>

        {assessmentState === 'Not Assessed' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 font-mono">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            NOT ASSESSED
          </span>
        ) : assessmentState === 'Review Required' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            REVIEW REQUIRED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ASSESSMENT COMPLETE
          </span>
        )}
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        {items.map((item) => (
          <div
            key={item.label}
            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
              isImageError
                ? 'bg-rose-50/40 border-rose-200 text-rose-900'
                : item.passed
                ? 'bg-slate-50/70 border-slate-200/80 text-slate-800'
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}
          >
            {isImageError ? (
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            ) : item.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block leading-tight">{item.label}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isImageError ? 'Blocked — Image Unreadable' : item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Subtext Note */}
      <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          Status: {isImageError ? 'Assessment Blocked (Technical image loading error)' : imageQualityLabel}
        </span>
        <span className="text-slate-400 font-mono text-[10px]">Standard: ACR Digital X-Ray</span>
      </div>
    </div>
  );
};
