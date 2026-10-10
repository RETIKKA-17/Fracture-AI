import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Save,
  Edit3,
  XCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import type { ClinicianReview, ReviewAgreement, ClinicianAction } from '../../types';

interface ClinicianReviewCardProps {
  currentReview?: ClinicianReview;
  onSaveReview: (
    agreement: ReviewAgreement,
    notes: string,
    action?: ClinicianAction,
    correctedLocation?: string
  ) => void;
}

export const ClinicianReviewCard: React.FC<ClinicianReviewCardProps> = ({
  currentReview,
  onSaveReview,
}) => {
  const [selectedAction, setSelectedAction] = useState<ClinicianAction>(
    currentReview?.action || (currentReview?.agreement === 'Agree' ? 'Confirm' : 'Confirm')
  );
  const [notes, setNotes] = useState<string>(currentReview?.notes || '');
  const [correctedLocation, setCorrectedLocation] = useState<string>(
    currentReview?.correctedLocation || ''
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(currentReview?.isSaved || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let agreement: ReviewAgreement = 'Agree';
    if (selectedAction === 'Reject') agreement = 'Disagree';
    if (selectedAction === 'Uncertain' || selectedAction === 'Edit' || selectedAction === 'RequestBetterImage' || selectedAction === 'RequestFurtherReview') {
      agreement = 'Needs Further Review';
    }

    onSaveReview(agreement, notes, selectedAction, correctedLocation);
    setSavedSuccess(true);
  };

  const handleTemplateClick = (templateText: string) => {
    setNotes((prev) => (prev ? `${prev}\n${templateText}` : templateText));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">CLINICIAN VERIFICATION</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review available AI findings and submit final clinician decision. The AI findings and clinician decisions are saved separately.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            DECISION RECORDED
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Clinician Review Actions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            SELECT CLINICIAN ACTION
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* CONFIRM */}
            <button
              type="button"
              onClick={() => setSelectedAction('Confirm')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'Confirm'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${selectedAction === 'Confirm' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">CONFIRM</span>
              <span className="text-[9px] text-slate-500 font-normal">Accept AI</span>
            </button>

            {/* EDIT */}
            <button
              type="button"
              onClick={() => setSelectedAction('Edit')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'Edit'
                  ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <Edit3 className={`w-4 h-4 ${selectedAction === 'Edit' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">EDIT</span>
              <span className="text-[9px] text-slate-500 font-normal">Modify Location</span>
            </button>

            {/* REJECT */}
            <button
              type="button"
              onClick={() => setSelectedAction('Reject')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'Reject'
                  ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <XCircle className={`w-4 h-4 ${selectedAction === 'Reject' ? 'text-rose-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">REJECT</span>
              <span className="text-[9px] text-slate-500 font-normal">Overrule AI</span>
            </button>

            {/* UNCERTAIN */}
            <button
              type="button"
              onClick={() => setSelectedAction('Uncertain')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'Uncertain'
                  ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${selectedAction === 'Uncertain' ? 'text-amber-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">UNCERTAIN</span>
              <span className="text-[9px] text-slate-500 font-normal">Equivocal View</span>
            </button>

            {/* REQUEST BETTER IMAGE */}
            <button
              type="button"
              onClick={() => setSelectedAction('RequestBetterImage')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'RequestBetterImage'
                  ? 'border-cyan-600 bg-cyan-50 text-cyan-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${selectedAction === 'RequestBetterImage' ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">RE-TAKE</span>
              <span className="text-[9px] text-slate-500 font-normal">Better Image</span>
            </button>

            {/* REQUEST FURTHER REVIEW */}
            <button
              type="button"
              onClick={() => setSelectedAction('RequestFurtherReview')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                selectedAction === 'RequestFurtherReview'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${selectedAction === 'RequestFurtherReview' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold">CONSULT</span>
              <span className="text-[9px] text-slate-500 font-normal">2nd Opinion</span>
            </button>

          </div>
        </div>

        {/* Corrected Anatomical Location (When Edit is selected) */}
        {selectedAction === 'Edit' && (
          <div className="space-y-1.5 animate-in fade-in">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              CORRECTED ANATOMICAL LOCATION
            </label>
            <input
              type="text"
              value={correctedLocation}
              onChange={(e) => setCorrectedLocation(e.target.value)}
              placeholder="e.g. Ulnar styloid process base / Scaphoid waist..."
              className="w-full px-3.5 py-2 rounded-xl border border-blue-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {/* Clinical Notes Textarea */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              CLINICAL IMPRESSION & NOTES
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Reviewer Signature: {currentReview?.clinicianName || 'Dr. Clinician'}</span>
          </div>

          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record clinical impression, anatomical findings, splinting recommendations, or secondary imaging orders..."
            className="w-full p-4 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 font-sans"
          />

          {/* Quick Clinical Templates */}
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">QUICK TEMPLATES:</span>
            <button
              type="button"
              onClick={() => handleTemplateClick('Confirmed non-displaced distal radius fracture. Cast immobilization initiated.')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              + Confirmed Fracture
            </button>
            <button
              type="button"
              onClick={() => handleTemplateClick('Normal radiocarpal joint anatomy. Intact cortical contours.')}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              + Normal Anatomy
            </button>
            <button
              type="button"
              onClick={() => handleTemplateClick('Image quality concern (motion blur). Request re-acquisition or additional lateral view.')}
              className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors cursor-pointer"
            >
              + Re-take Request
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Selected Action: <span className="font-mono font-bold text-blue-700 uppercase">{selectedAction}</span>
          </p>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>SUBMIT CLINICIAN DECISION</span>
          </button>
        </div>

      </form>

    </div>
  );
};
