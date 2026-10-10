import React from 'react';
import {
  PlusCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Activity
} from 'lucide-react';
import type { CaseRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  cases: CaseRecord[];
  onStartNewAnalysis: () => void;
  onSelectCase: (caseId: string) => void;
  onNavigateHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cases,
  onStartNewAnalysis,
  onSelectCase,
  onNavigateHistory,
}) => {
  const { user } = useAuth();

  // Calculated statistics from actual cases data
  const pendingReviewCases = cases.filter(c => c.status === 'Review Required');
  const uncertainCasesCount = cases.filter(
    c => (c.aiResult?.confidence && c.aiResult.confidence < 85) || c.aiResult?.confidenceBand === 'LOW'
  ).length;
  const qualityReviewCasesCount = cases.filter(
    c => c.aiResult?.imageQuality === 'Suboptimal view' || c.aiResult?.qualityChecks?.status === 'QUALITY REVIEW REQUIRED'
  ).length;
  const reviewedCases = cases.filter(c => c.status === 'Reviewed');

  // Compute Priority Score & Review Reason for Sorting
  // Priority: 1. Quality Concern, 2. Low Confidence, 3. Uncertain, 4. Pending Review, 5. Routine
  const getPriorityInfo = (c: CaseRecord) => {
    const confidence = c.aiResult?.confidence || 100;
    const isQualityIssue = c.aiResult?.imageQuality === 'Suboptimal view' || c.aiResult?.qualityChecks?.status === 'QUALITY REVIEW REQUIRED';
    const isUncertain = confidence < 80;

    if (isQualityIssue) {
      return { level: 'High', rank: 1, reason: 'Image quality concern', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (isUncertain) {
      return { level: 'High', rank: 2, reason: 'Low confidence', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (confidence < 85) {
      return { level: 'Moderate', rank: 3, reason: 'Uncertain detection', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    if (c.status === 'Review Required') {
      return { level: 'Routine', rank: 4, reason: 'Pending clinician review', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { level: 'Routine', rank: 5, reason: 'Clinician verification required', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Sort Cases Requiring Review by Priority
  const reviewQueue = [...pendingReviewCases].sort((a, b) => {
    const pA = getPriorityInfo(a).rank;
    const pB = getPriorityInfo(b).rank;
    return pA - pB;
  });

  // Clinically Standardized AI Finding Terminology
  const formatAIFinding = (c: CaseRecord) => {
    const prediction = c.aiResult?.prediction;
    const confidence = c.aiResult?.confidence || 0;
    const isQualityBlocked =
      c.status === 'Quality Review Required' ||
      (c.aiResult?.analysisPerformed === false && c.aiResult?.imageQuality === 'Unsuitable for automated analysis');
    const isDemo = c.isDemo || c.aiResult?.isDemoConfidence || c.aiResult?.analysisMode === 'DEMO_MOCK';

    if (prediction === 'AI Model Not Connected') {
      return {
        title: 'AI model not connected',
        subtitle: 'Genuine fracture analysis unavailable'
      };
    }
    if (prediction === 'Analysis Failed') {
      return {
        title: 'Analysis failed',
        subtitle: 'Inference runtime processing error'
      };
    }
    if (isQualityBlocked) {
      return {
        title: 'Image quality review required',
        subtitle: 'Automated analysis paused due to quality concern'
      };
    }
    if (confidence > 0 && confidence < 75) {
      return {
        title: 'Uncertain result',
        subtitle: isDemo ? 'Equivocal feature activation (Demo Analysis)' : 'Equivocal feature activation'
      };
    }
    if (prediction === 'Fracture Suspected') {
      return {
        title: 'Candidate fracture detected',
        subtitle: `${c.aiResult?.suspectedRegion || 'Distal radius region'}${isDemo ? ' (Demo Analysis)' : ''}`
      };
    }
    if (prediction === 'No Fracture Detected' || prediction === 'No Fracture Candidate Identified') {
      return {
        title: 'No candidate fracture identified',
        subtitle: isDemo ? 'Normal bone architecture (Demo Analysis)' : 'Normal bone architecture'
      };
    }
    return {
      title: 'Not available',
      subtitle: 'Analysis result not available'
    };
  };

  // Format Clinician Decision text for Recently Reviewed
  const formatClinicianDecision = (c: CaseRecord) => {
    const agreement = c.clinicianReview?.agreement;
    const notes = c.clinicianReview?.notes;

    if (agreement === 'Agree') return 'Confirmed by reviewer';
    if (agreement === 'Disagree') return 'Overruled by clinician';
    if (agreement === 'Needs Further Review') return 'Marked uncertain';
    if (notes) return `Reviewed: "${notes.slice(0, 35)}..."`;
    return 'Verification saved';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
              Clinical Workspace
            </h1>
            {user?.isDemo && (
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                DEMO ENVIRONMENT
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            AI-assisted wrist radiograph review
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateHistory}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Review Queue ({reviewQueue.length})</span>
          </button>

          <button
            onClick={onStartNewAnalysis}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Analysis</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Workload Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
            TODAY'S WORKLOAD
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Real-time work queue tally</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Pending Review Card */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Pending Review
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-700">
              {pendingReviewCases.length}
            </div>
            <span className="text-[10px] text-amber-700 font-medium block">Awaiting clinician sign-off</span>
          </div>

          {/* Uncertain Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Uncertain
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-800">
              {uncertainCasesCount}
            </div>
            <span className="text-[10px] text-slate-400 block">Equivocal confidence (&lt;85%)</span>
          </div>

          {/* Quality Review Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quality Review
            </span>
            <div className="text-3xl font-extrabold font-mono text-slate-800">
              {qualityReviewCasesCount}
            </div>
            <span className="text-[10px] text-slate-400 block">Suboptimal radiograph view</span>
          </div>

          {/* Reviewed Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Reviewed
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600">
              {reviewedCases.length}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block">Clinician signed-off</span>
          </div>

        </div>
      </div>

      {/* 3. Primary Section — Cases Requiring Review (Clean Text/Data Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
        
        {/* Table Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <span>Cases Requiring Review</span>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {reviewQueue.length} ACTION NEEDED
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI-assisted cases awaiting clinician verification.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">Sorted by Clinical Priority</span>
        </div>

        {/* Priority Table - Text/Data Only (No Image Column) */}
        {reviewQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                  <th className="py-3.5 px-5">CASE ID</th>
                  <th className="py-3.5 px-4">VIEW</th>
                  <th className="py-3.5 px-6">FINDING</th>
                  <th className="py-3.5 px-4">CONFIDENCE</th>
                  <th className="py-3.5 px-6">REVIEW REASON</th>
                  <th className="py-3.5 px-4">PRIORITY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {reviewQueue.map((c) => {
                  const priority = getPriorityInfo(c);
                  const finding = formatAIFinding(c);
                  const isDemoConfidence = c.isDemo || c.aiResult?.isDemoConfidence || c.aiResult?.analysisMode === 'DEMO_MOCK';
                  const isQualityBlocked = c.aiResult?.analysisPerformed === false || c.status === 'Quality Review Required';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Case ID */}
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {c.id || 'Not available'}
                      </td>

                      {/* View */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-700">
                        {c.patient?.xrayView || 'Not available'}
                      </td>

                      {/* Finding */}
                      <td className="py-4 px-6 max-w-[260px]">
                        <span className="font-bold text-slate-900 block text-xs">
                          {finding.title}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {finding.subtitle}
                        </span>
                      </td>

                      {/* Confidence Score */}
                      <td className="py-4 px-4 font-mono">
                        {isQualityBlocked || !c.aiResult?.confidence ? (
                          <span className="text-slate-400 font-sans text-[11px] font-medium">Not available</span>
                        ) : (
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="text-blue-700 font-extrabold">{c.aiResult.confidence}%</span>
                            {isDemoConfidence && (
                              <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 font-semibold uppercase">
                                Demo Score
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Review Reason */}
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {c.reviewReason || priority.reason || 'Not available'}
                      </td>

                      {/* Priority Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${priority.badgeClass}`}>
                          {priority.level || 'Not available'}
                        </span>
                      </td>

                      {/* Restrained Clinical Status Badge */}
                      <td className="py-4 px-4">
                        {c.aiResult?.confidence && c.aiResult.confidence < 80 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            UNCERTAIN
                          </span>
                        ) : isQualityBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            QUALITY REVIEW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {c.status || 'Review Required'}
                          </span>
                        )}
                      </td>

                      {/* Right Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <span>Review</span>
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
          /* Empty State */
          <div className="p-12 text-center space-y-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No cases requiring review</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                New AI-assisted cases will appear here when clinician verification is needed.
              </p>
            </div>
            <button
              onClick={onStartNewAnalysis}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Analysis</span>
            </button>
          </div>
        )}

      </div>

      {/* 4. Secondary Grid: Recent Cases & Recently Reviewed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Cases Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Cases</h3>
              <p className="text-[11px] text-slate-500">Most recent radiograph evaluations</p>
            </div>

            <button
              onClick={onNavigateHistory}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              View All Cases
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                  <th className="py-2.5 px-3">CASE ID</th>
                  <th className="py-2.5 px-3">DATE</th>
                  <th className="py-2.5 px-3">VIEW</th>
                  <th className="py-2.5 px-3">AI FINDING</th>
                  <th className="py-2.5 px-3">CONFIDENCE</th>
                  <th className="py-2.5 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.slice(0, 5).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.id || 'Not available'}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{c.patient?.date || 'Not available'}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold">{c.patient?.xrayView || 'Not available'}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[140px]">
                      {c.aiResult?.prediction === 'AI Model Not Connected'
                        ? 'Model not connected'
                        : c.aiResult?.prediction === 'Analysis Failed'
                        ? 'Analysis failed'
                        : c.aiResult?.prediction === 'Fracture Suspected'
                        ? 'Possible fracture'
                        : c.aiResult?.prediction === 'No Fracture Detected' || c.aiResult?.prediction === 'No Fracture Candidate Identified'
                        ? 'No candidate'
                        : 'Analysis paused'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {c.aiResult?.analysisPerformed === false || !c.aiResult?.confidence
                        ? 'N/A'
                        : `${c.aiResult.confidence}%${c.aiResult.isDemoConfidence ? ' (Demo)' : ''}`}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'Reviewed' || c.status === 'Clinician Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {c.status || 'Not available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Reviewed Section & AI Summary Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recently Reviewed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recently Reviewed</h3>
              <p className="text-[11px] text-slate-500">Clinician verification log</p>
            </div>

            {reviewedCases.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-100 text-xs">
                {reviewedCases.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="pt-2.5 first:pt-0 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {c.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.clinicianReview?.timestamp || 'Today'}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-slate-700">
                      {formatClinicianDecision(c)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      By: {c.clinicianReview?.clinicianName || user?.name || 'Demo Reviewer'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No reviews recorded in this session yet.</p>
            )}
          </div>

          {/* Compact AI Review Summary Panel */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 shadow-inner space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                AI REVIEW SUMMARY
              </span>
              <span className="text-[10px] text-slate-400">DATASET TALLY</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Cases requiring attention:</span>
                <span className="font-bold text-amber-400 text-sm">{pendingReviewCases.length}</span>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-900 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>• Low confidence (&lt;80%):</span>
                  <span className="text-slate-200 font-bold">{uncertainCasesCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>• Image quality concern:</span>
                  <span className="text-slate-200 font-bold">{qualityReviewCasesCount}</span>
                </div>

                <div className="flex justify-between">
                  <span>• Pending sign-off:</span>
                  <span className="text-slate-200 font-bold">{pendingReviewCases.length}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>


    </div>
  );
};
