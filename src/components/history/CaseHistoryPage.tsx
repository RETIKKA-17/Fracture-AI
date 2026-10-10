import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, FileText, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { CaseRecord } from '../../types';

interface CaseHistoryPageProps {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
  onStartNewAnalysis: () => void;
}

export const CaseHistoryPage: React.FC<CaseHistoryPageProps> = ({
  cases,
  onSelectCase,
  onStartNewAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<
    | 'All'
    | 'Awaiting Review'
    | 'Quality Concerns'
    | 'Analysis Completed'
    | 'Clinician Confirmed'
    | 'Uncertain'
    | 'Rejected'
  >('All');

  // Filter cases based on search and selected filter tab
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(q) ||
      c.patient.patientId.toLowerCase().includes(q) ||
      (c.aiResult?.suspectedRegion && c.aiResult.suspectedRegion.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const isQualityBlocked =
      c.status === 'Quality Review Required' ||
      c.aiResult?.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED';

    const confidence = c.aiResult?.confidence || 0;
    const isUncertain = (confidence > 0 && confidence < 85) || c.status.includes('Uncertain');

    if (activeFilter === 'Awaiting Review') {
      return c.status === 'Review Required' || c.status === 'Analysis Completed — Review Pending';
    }
    if (activeFilter === 'Quality Concerns') {
      return isQualityBlocked;
    }
    if (activeFilter === 'Analysis Completed') {
      return c.aiResult?.analysisPerformed === true;
    }
    if (activeFilter === 'Clinician Confirmed') {
      return c.status === 'Clinician Confirmed' || c.clinicianReview?.agreement === 'Agree';
    }
    if (activeFilter === 'Uncertain') {
      return isUncertain;
    }
    if (activeFilter === 'Rejected') {
      return c.status === 'Rejected by Clinician' || c.clinicianReview?.agreement === 'Disagree';
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Case Management Directory</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Searchable clinical repository of wrist X-ray analyses, quality status, AI outputs, and clinician review decisions.
          </p>
        </div>

        <button
          onClick={onStartNewAnalysis}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-mono shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Analysis</span>
        </button>
      </div>

      {/* Filter Tabs & Search Control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID (WR-024), Patient ID (PT-8942)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                'All',
                'Awaiting Review',
                'Quality Concerns',
                'Analysis Completed',
                'Clinician Confirmed',
                'Uncertain',
                'Rejected',
              ] as const
            ).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Searchable Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>Showing {filteredCases.length} of {cases.length} total cases</span>
          <span className="font-mono text-[10px] text-slate-400">Click any row to open workstation viewer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                <th className="py-3 px-5">CASE ID</th>
                <th className="py-3 px-4">CREATED DATE</th>
                <th className="py-3 px-4">X-RAY VIEW</th>
                <th className="py-3 px-4">QUALITY STATUS</th>
                <th className="py-3 px-4">ANALYSIS STATUS</th>
                <th className="py-3 px-5">CLINICIAN REVIEW STATUS</th>
                <th className="py-3 px-4">LAST UPDATED</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCases.map((c) => {
                const isQualityBlocked =
                  c.status === 'Quality Review Required' ||
                  c.aiResult?.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED';

                const isFracture = c.aiResult?.prediction === 'Fracture Suspected';
                const isConfirmed = c.status === 'Clinician Confirmed' || c.clinicianReview?.agreement === 'Agree';
                const isRejected = c.status === 'Rejected by Clinician' || c.clinicianReview?.agreement === 'Disagree';

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Case ID */}
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {c.id}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {c.createdDate}
                    </td>

                    {/* View */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {c.patient.xrayView}
                    </td>

                    {/* Quality Status */}
                    <td className="py-3.5 px-4">
                      {isQualityBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          QUALITY CONCERN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          SUITABLE
                        </span>
                      )}
                    </td>

                    {/* Analysis Status */}
                    <td className="py-3.5 px-4">
                      {isQualityBlocked ? (
                        <span className="text-slate-400 font-mono text-[11px] font-bold">PAUSED</span>
                      ) : c.aiResult?.prediction === 'AI Model Not Connected' ? (
                        <span className="text-slate-600 font-mono text-[11px] font-bold">MODEL NOT CONNECTED</span>
                      ) : c.aiResult?.prediction === 'Analysis Failed' ? (
                        <span className="text-rose-600 font-mono text-[11px] font-bold">ANALYSIS FAILED</span>
                      ) : isFracture ? (
                        <div>
                          <span className="font-bold text-rose-700 block">
                            Fracture Suspected ({c.aiResult?.confidence ?? 'N/A'}%)
                          </span>
                          {c.aiResult?.isDemoConfidence && (
                            <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              Demo Score
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-emerald-700 block">
                            No Fracture ({c.aiResult?.confidence ?? 'N/A'}%)
                          </span>
                          {c.aiResult?.isDemoConfidence && (
                            <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              Demo Score
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Clinician Review Status */}
                    <td className="py-3.5 px-5">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          CONFIRMED
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          REJECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          PENDING VERIFICATION
                        </span>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {c.clinicianReview?.timestamp || c.patient.date}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No cases found matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
