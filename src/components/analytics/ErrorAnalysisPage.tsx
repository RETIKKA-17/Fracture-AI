import React, { useState } from 'react';
import { AlertCircle, Filter, ArrowUpRight, FileImage } from 'lucide-react';
import type { ErrorCategory, CaseRecord } from '../../types';

interface ErrorAnalysisPageProps {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
}

export const ErrorAnalysisPage: React.FC<ErrorAnalysisPageProps> = ({ onSelectCase }) => {
  const [activeFilter, setActiveFilter] = useState<ErrorCategory | 'All'>('All');

  const categories: (ErrorCategory | 'All')[] = [
    'All',
    'False Positive',
    'False Negative',
    'Poor Quality',
    'Cast',
    'Artifact',
    'Old Fracture',
    'Minimally Displaced',
    'Other',
  ];

  // Demo sample error cases for research investigation
  const errorCases = [
    {
      caseId: 'WR-019',
      patientId: 'PT-9012',
      errorCategory: 'Minimally Displaced' as ErrorCategory,
      aiPrediction: 'No Fracture Detected',
      aiConfidence: 68,
      clinicianDecision: 'Confirmed Fracture (Distal Radius Lip)',
      xrayUrl: '/assets/wrist_fracture.jpg',
      explanation: 'Saliency map missed faint non-displaced dorsal cortical hair-line fracture.',
      reasonForError: 'Faint trabecular line with minimal cortical displacement below model activation threshold.',
    },
    {
      caseId: 'WR-015',
      patientId: 'PT-4412',
      errorCategory: 'Cast' as ErrorCategory,
      aiPrediction: 'Fracture Suspected',
      aiConfidence: 82,
      clinicianDecision: 'Plaster Cast Artifact (No Acute Line)',
      xrayUrl: '/assets/wrist_fracture.jpg',
      explanation: 'Model dense activation triggered on radiopaque plaster edge.',
      reasonForError: 'External plaster cast edge created high-contrast linear gradient mimicking cortical disruption.',
    },
    {
      caseId: 'WR-012',
      patientId: 'PT-3301',
      errorCategory: 'Old Fracture' as ErrorCategory,
      aiPrediction: 'Fracture Suspected',
      aiConfidence: 89,
      clinicianDecision: 'Healed Malunion (Old Injury 2024)',
      xrayUrl: '/assets/wrist_fracture.jpg',
      explanation: 'Cortical irregularity from previous healed distal radial malunion.',
      reasonForError: 'High convolutional feature overlap between chronic healed callus and acute fracture.',
    },
  ];

  const filteredErrors = activeFilter === 'All'
    ? errorCases
    : errorCases.filter(e => e.errorCategory === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Error Analysis</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Research tool for categorizing false positives, false negatives, cast artifacts, and edge cases.
          </p>
        </div>

        <span className="text-xs font-mono text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          DISCREPANCY LOG ({errorCases.length} Cases)
        </span>
      </div>

      {/* Category Filter Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Discrepancy Category</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error Cases Cards Grid */}
      <div className="space-y-6">
        {filteredErrors.map((err) => (
          <div
            key={err.caseId}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center hover:border-slate-300 transition-all"
          >
            
            {/* Left X-Ray Preview Thumbnail */}
            <div className="lg:col-span-3 bg-slate-950 rounded-xl overflow-hidden aspect-[4/3] border border-slate-800 relative shadow-inner">
              <img
                src={err.xrayUrl}
                alt="Error Case Radiograph"
                className="w-full h-full object-cover filter contrast-125 opacity-90"
              />
              <div className="absolute top-2 left-2 bg-slate-900/90 text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded border border-slate-700">
                {err.caseId}
              </div>
            </div>

            {/* Middle Details */}
            <div className="lg:col-span-6 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900 text-sm">{err.caseId}</span>
                <span className="text-slate-400">•</span>
                <span className="font-mono text-slate-600">Patient: {err.patientId}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {err.errorCategory}
                </span>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">AI Prediction</span>
                  <span className="font-semibold text-rose-700 block text-xs">{err.aiPrediction}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Confidence: {err.aiConfidence}%</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinician Final Decision</span>
                  <span className="font-semibold text-emerald-700 block text-xs">{err.clinicianDecision}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Verified Overrule</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Saliency Model Behavior:</span>
                <p className="text-slate-600 font-sans leading-snug">{err.explanation}</p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-0.5">Root Cause for Error:</span>
                <p className="text-amber-900 font-medium bg-amber-50/60 p-2 rounded-lg border border-amber-200/80 leading-snug">
                  "{err.reasonForError}"
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="lg:col-span-3 text-right space-y-3">
              <button
                onClick={() => onSelectCase(err.caseId)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Inspect in Workstation</span>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </button>

              <span className="text-[10px] text-slate-400 block text-center">
                Added to Model Retraining Dataset
              </span>
            </div>

          </div>
        ))}

        {filteredErrors.length === 0 && (
          <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
            <FileImage className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-medium">No error cases logged for category "{activeFilter}".</p>
          </div>
        )}
      </div>

    </div>
  );
};
