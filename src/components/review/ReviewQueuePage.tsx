import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles
} from 'lucide-react';
import type { CaseRecord } from '../../types';

interface ReviewQueuePageProps {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
  onStartNewAnalysis: () => void;
}

export const ReviewQueuePage: React.FC<ReviewQueuePageProps> = ({
  cases,
  onSelectCase,
  onStartNewAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState<'All' | 'Quality Concern' | 'Uncertain' | 'Awaiting Sign-off'>('All');

  // Compute Priority & Reason for Queue Ordering
  const computeQueueItem = (c: CaseRecord) => {
    const isQualityBlocked =
      c.status === 'Quality Review Required' ||
      c.aiResult?.imageQuality === 'Unsuitable for automated analysis' ||
      c.aiResult?.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED';

    const confidence = c.aiResult?.confidence || 0;
    const isUncertain = (confidence > 0 && confidence < 85) || c.status === 'Uncertain — Further Review Required';
    const isAwaitingSignoff = c.status === 'Review Required' || c.status === 'Analysis Completed — Review Pending';

    let queueRank = 4;
    let category: 'Quality Concern' | 'Uncertain' | 'Awaiting Sign-off' | 'Routine' = 'Routine';
    let priorityLabel: 'High' | 'Medium' | 'Normal' = 'Normal';
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let reasonText = c.reviewReason || 'Pending clinician verification';

    if (isQualityBlocked) {
      queueRank = 1;
      category = 'Quality Concern';
      priorityLabel = 'High';
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-300';
      reasonText = c.aiResult?.analysisBlockedReason || 'Image quality review required before analysis';
    } else if (isUncertain) {
      queueRank = 2;
      category = 'Uncertain';
      priorityLabel = 'Medium';
      badgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
      reasonText = `Equivocal model confidence (${confidence}% Demo Score) — human verification needed`;
    } else if (isAwaitingSignoff) {
      queueRank = 3;
      category = 'Awaiting Sign-off';
      priorityLabel = 'Normal';
      badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
      reasonText = `Candidate fracture detected (${confidence}% Demo Score) — sign-off required`;
    }

    return {
      queueRank,
      category,
      priorityLabel,
      badgeClass,
      reasonText
    };
  };

  // Filter cases in review queue (only non-confirmed or pending cases or all requiring review)
  const pendingCases = cases.filter(
    (c) =>
      c.status === 'Review Required' ||
      c.status === 'Quality Review Required' ||
      c.status === 'Analysis Completed — Review Pending' ||
      c.status === 'Uncertain — Further Review Required'
  );

  // Sort queue items according to 4-tier priority
  const sortedQueue = [...pendingCases].sort((a, b) => {
    const itemA = computeQueueItem(a);
    const itemB = computeQueueItem(b);
    return itemA.queueRank - itemB.queueRank;
  });

  // Filter by search & queue filter pill
  const filteredQueue = sortedQueue.filter((c) => {
    const item = computeQueueItem(c);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(q) ||
      c.patient.patientId.toLowerCase().includes(q) ||
      item.reasonText.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (queueFilter === 'All') return true;
    return item.category === queueFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinician Review Queue</h1>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded border border-amber-200">
              {pendingCases.length} PENDING REVIEW
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Prioritized clinical decision-support queue ordered by screening urgency and model confidence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartNewAnalysis}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>


      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Quality Concern', 'Uncertain', 'Awaiting Sign-off'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setQueueFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  queueFilter === filter
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

      {/* Prioritized Case Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                  <th className="py-3.5 px-5">CASE ID</th>
                  <th className="py-3.5 px-4">X-RAY VIEW</th>
                  <th className="py-3.5 px-4">PRIORITY</th>
                  <th className="py-3.5 px-6">REASON FOR QUEUE</th>
                  <th className="py-3.5 px-4">QUALITY STATUS</th>
                  <th className="py-3.5 px-4">AI FINDING</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQueue.map((c) => {
                  const item = computeQueueItem(c);
                  const isQualityConcern = c.aiResult?.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED';
                  const isFracture = c.aiResult?.prediction === 'Fracture Suspected';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      {/* Case ID */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {c.id}
                      </td>

                      {/* View */}
                      <td className="py-4 px-4 font-mono font-semibold text-slate-700">
                        {c.patient.xrayView}
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeClass}`}>
                          {item.priorityLabel}
                        </span>
                      </td>

                      {/* Queue Reason */}
                      <td className="py-4 px-6 max-w-xs">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {item.reasonText}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Patient: {c.patient.patientId} • Ingested: {c.patient.date}
                        </span>
                      </td>

                      {/* Quality Status */}
                      <td className="py-4 px-4">
                        {isQualityConcern ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            REVIEW REQUIRED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SUITABLE
                          </span>
                        )}
                      </td>

                      {/* AI Finding */}
                      <td className="py-4 px-4">
                        {c.aiResult?.prediction === 'AI Model Not Connected' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            MODEL NOT CONNECTED
                          </span>
                        ) : c.aiResult?.prediction === 'Analysis Failed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            ANALYSIS FAILED
                          </span>
                        ) : c.aiResult?.prediction === 'Analysis Not Performed' || c.aiResult?.analysisPerformed === false ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            ANALYSIS PAUSED
                          </span>
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

                      {/* Review Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Open Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-3 bg-white">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Review Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All cases requiring clinician attention have been verified.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
