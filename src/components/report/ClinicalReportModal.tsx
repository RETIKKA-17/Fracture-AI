import React from 'react';
import { Printer, X, Activity } from 'lucide-react';
import type { CaseRecord } from '../../types';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: CaseRecord;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  currentCase,
}) => {
  if (!isOpen) return null;

  const { aiResult, patient, clinicianReview } = currentCase;
  const isFracture = aiResult?.prediction === 'Fracture Suspected';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold">Printable Clinical Analysis Report</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet Content */}
        <div className="p-8 sm:p-10 space-y-8 bg-white text-slate-900 font-sans">
          
          {/* Hospital / Project Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-2xl tracking-tight">
                <Activity className="w-7 h-7 text-blue-600" />
                WristAI Clinical Decision Support
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Academic AI Radiography Assessment • Department of Radiology
              </p>
            </div>

            <div className="text-right text-xs font-mono text-slate-600 space-y-1">
              <div className="font-bold text-slate-900 text-sm">CASE REPORT #{currentCase.id}</div>
              <div>Date: {patient.date || '30 Aug 2026'}</div>
              <div className="text-cyan-700 font-semibold">STATUS: {currentCase.status}</div>
            </div>
          </div>

          {/* Patient Metadata Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Case ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentCase.id}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Patient ID</span>
              <span className="font-mono font-semibold text-slate-800">{patient.patientId}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">Age / Sex</span>
              <span className="font-semibold text-slate-800">{patient.age} Yrs / {patient.sex}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold block">X-Ray View</span>
              <span className="font-semibold text-slate-800">{patient.xrayView} Projection</span>
            </div>
          </div>

          {/* AI Assessment Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>01. AI Model Automated Assessment</span>
              <span className="text-xs text-blue-700 font-mono">ResNet-50 Saliency Engine</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* Left X-Ray Thumbnail */}
              <div className="sm:col-span-4 bg-slate-950 rounded-xl overflow-hidden aspect-[4/3] border border-slate-800 relative">
                <img
                  src={currentCase.imageUrl}
                  alt="X-Ray Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-slate-900/90 text-[9px] font-mono text-cyan-300 px-1.5 py-0.5 rounded">
                  AP_VIEW
                </div>
              </div>

              {/* Right Findings Detail */}
              <div className="sm:col-span-8 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    isFracture
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : aiResult?.prediction === 'AI Model Not Connected' || aiResult?.prediction === 'Analysis Failed'
                      ? 'bg-slate-100 text-slate-800 border border-slate-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {aiResult?.prediction}
                  </span>
                  <span className="font-mono text-slate-700 font-bold text-sm">
                    {aiResult?.prediction === 'AI Model Not Connected' || aiResult?.prediction === 'Analysis Failed'
                      ? 'Model: Offline'
                      : `Confidence: ${aiResult?.confidence}%${aiResult?.isDemoConfidence ? ' (Demo)' : ''}`}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-slate-800">Suspected Anatomical Region:</span>
                  <p className="text-slate-700 font-mono bg-slate-100 p-2 rounded border border-slate-200">
                    {aiResult?.suspectedRegion}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-800">AI Radiological Interpretation:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    "{aiResult?.interpretation}"
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Clinician Assessment Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>02. Clinician Verification & Notes</span>
              <span className="text-xs text-emerald-700 font-semibold">Human-In-The-Loop Final Review</span>
            </h4>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-slate-500 font-medium">Review Decision: </span>
                  <span className="font-bold text-slate-900 text-sm ml-1">
                    {clinicianReview?.agreement === 'Agree' && 'Confirmed (Agreed with AI)'}
                    {clinicianReview?.agreement === 'Disagree' && 'Disagreed (Overruled AI)'}
                    {clinicianReview?.agreement === 'Needs Further Review' && 'Needs CT / Secondary View'}
                    {(!clinicianReview?.agreement || clinicianReview.agreement === 'Pending') && 'Pending Review'}
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  {clinicianReview?.timestamp || 'Pending timestamp'}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Clinical Notes & Management Plan:</span>
                <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-sans min-h-[60px]">
                  {clinicianReview?.notes || 'No clinical remarks recorded for this case.'}
                </p>
              </div>
            </div>
          </div>

          {/* Signatures & Footer Disclaimer */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">Attending Clinician</span>
              <div className="mt-4 border-b border-slate-400 w-48 py-1 font-semibold text-slate-900">
                Dr. Clinician, M.D.
              </div>
              <span className="text-[10px] text-slate-400">Department of Radiodiagnosis</span>
            </div>

            <div className="text-right flex flex-col justify-between">
              <div className="text-[10px] text-slate-500 italic">
                AI-generated decision support for clinician review only.
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                WristAI Verification Token: #CDSS-98421
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
