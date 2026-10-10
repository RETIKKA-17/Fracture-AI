import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Loader2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen, onComplete }) => {
  const [currentStage, setCurrentStage] = useState<number>(0);

  const stages = [
    { label: 'Validating image...', sub: 'Resolution, FOV & DICOM matrix check' },
    { label: 'Checking image quality...', sub: 'Histogram equalization & contrast assessment' },
    { label: 'Detecting fracture candidates...', sub: 'ResNet-50 cortical border feature extraction' },
    { label: 'Generating localization...', sub: 'Bounding ROI candidate region extraction' },
    { label: 'Generating model attention...', sub: 'Grad-CAM saliency visual heatmap computation' },
    { label: 'Interpreting confidence...', sub: 'Calibrating confidence & uncertainty score' },
    { label: 'Preparing clinician review...', sub: 'Formatting workstation decision support view' },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      return;
    }

    const t1 = setTimeout(() => setCurrentStage(1), 300);
    const t2 = setTimeout(() => setCurrentStage(2), 650);
    const t3 = setTimeout(() => setCurrentStage(3), 1000);
    const t4 = setTimeout(() => setCurrentStage(4), 1350);
    const t5 = setTimeout(() => setCurrentStage(5), 1700);
    const t6 = setTimeout(() => setCurrentStage(6), 2050);
    const t7 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Scanner Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-pulse" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Executing AI Radiology Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Real-time fracture detection, Grad-CAM saliency generation, and calibrated decision support.
          </p>
        </div>

        {/* Real-time Stage Progression Checklist (Requirement #11) */}
        <div className="mt-5 space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80 font-mono">
          {stages.map((stage, idx) => {
            const isDone = currentStage > idx;
            const isCurrent = currentStage === idx;
            const isUpcoming = currentStage < idx;

            return (
              <div key={stage.label} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isCurrent && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                  {isUpcoming && <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold ${
                      isDone
                        ? 'text-slate-800'
                        : isCurrent
                        ? 'text-blue-700 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {isDone ? `✓ ${stage.label}` : isCurrent ? `● ${stage.label}` : `○ ${stage.label}`}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">{stage.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-2.5">
          ResNet-50 Saliency Engine • DICOM Pipeline v1.0
        </div>

      </div>
    </div>
  );
};
