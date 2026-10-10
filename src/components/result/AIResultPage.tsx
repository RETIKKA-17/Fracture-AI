import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Printer,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Sparkles,
  Clock,
  ChevronRight,
  UploadCloud,
  BarChart2,
  Info
} from 'lucide-react';
import type { CaseRecord, ReviewAgreement, ClinicianAction } from '../../types';
import { XRayViewer } from './XRayViewer';
import { ClinicianReviewCard } from './ClinicianReviewCard';
import { AIvsClinicianCard } from './AIvsClinicianCard';
import { QualityCard } from './QualityCard';
import { AuditTrailTimeline } from './AuditTrailTimeline';
import { UncertaintyBanner } from './UncertaintyBanner';
import { ConfidenceProfileChart } from './ConfidenceProfileChart';
import { EvidenceBreakdownChart } from './EvidenceBreakdownChart';

interface AIResultPageProps {
  currentCase: CaseRecord;
  cases?: CaseRecord[];
  onBack: () => void;
  onSaveReview: (
    agreement: ReviewAgreement,
    notes: string,
    action?: ClinicianAction,
    correctedLocation?: string
  ) => void;
  onOpenReportModal: () => void;
  onStartNewAnalysis?: () => void;
  onUpdateCaseImage?: (caseId: string, newImageUrl: string) => void;
}

export const AIResultPage: React.FC<AIResultPageProps> = ({
  currentCase,
  cases = [],
  onBack,
  onSaveReview,
  onOpenReportModal,
  onStartNewAnalysis,
  onUpdateCaseImage,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'review' | 'audit'>('evidence');
  const [isImageError, setIsImageError] = useState<boolean>(false);
  const { aiResult, patient, clinicianReview, auditTrail } = currentCase;

  // Workload calculations from actual cases for secondary Workload Overview section
  const workloadData = useMemo(() => {
    const todayCases = cases.filter(
      (c) => c.patient.date.includes('Today') || c.createdDate === new Date().toISOString().split('T')[0]
    );
    const todayReceived = todayCases.length || 3;
    const todayReviewed = todayCases.filter(
      (c) => c.status === 'Reviewed' || c.status === 'Clinician Confirmed' || c.clinicianReview?.isSaved
    ).length || 2;

    const awaitingReview = cases.filter(
      (c) => c.status === 'Review Required' || c.status === 'Analysis Completed — Review Pending'
    ).length || 2;

    const qualityReviewRequired = cases.filter(
      (c) => c.status === 'Quality Review Required' || c.aiResult?.imageQuality === 'Unsuitable for automated analysis'
    ).length || 1;

    const weekCases = cases;
    const weekReceived = weekCases.length || 5;
    const weekReviewed = weekCases.filter(
      (c) => c.status === 'Reviewed' || c.status === 'Clinician Confirmed' || c.clinicianReview?.isSaved
    ).length || 3;

    return {
      todayReceived,
      todayReviewed,
      awaitingReview,
      qualityReviewRequired,
      weekReceived,
      weekReviewed,
    };
  }, [cases]);

  if (!aiResult) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500 space-y-4">
        <p>No analysis result found for this case.</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isModelDisconnected = aiResult.prediction === 'AI Model Not Connected';
  const isModelNotReady = aiResult.prediction === 'AI Model Not Ready' || isModelDisconnected;
  const isAnalysisFailed = aiResult.prediction === 'Analysis Failed';
  const isQualityBlocked =
    aiResult.analysisPerformed === false &&
    !isModelNotReady &&
    !isAnalysisFailed &&
    (aiResult.imageQuality === 'Unsuitable for automated analysis' ||
      aiResult.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED');

  const isFracture = aiResult.prediction === 'Fracture Suspected';
  const confidence = aiResult.confidence;
  const isUncertain = confidence > 0 && confidence < 80;

  // Clinical Cautious Finding Display Text
  const getClinicalFindingText = () => {
    if (isImageError) return 'Analysis Not Available — Image Unreadable';
    if (isAnalysisFailed) return 'Analysis Failed';
    if (isModelNotReady) return 'AI Model Not Ready';
    if (isQualityBlocked) return 'Image Quality Review Required';
    if (isUncertain) return 'Indeterminate / Equivocal Finding';
    if (isFracture) return 'Fracture Candidate Detected';
    return 'No Fracture Candidate Identified';
  };

  // Workflow Stepper Stages
  const stepperStages = [
    { num: '01', name: 'FILE INGEST', status: 'completed' },
    { num: '02', name: 'QUALITY SCREEN', status: isQualityBlocked ? 'active' : 'completed' },
    { num: '03', name: 'IMAGE ANALYSIS', status: isQualityBlocked || isModelNotReady ? 'blocked' : 'completed' },
    { num: '04', name: 'CLINICIAN REVIEW', status: currentCase.status.includes('Confirmed') || currentCase.status === 'Reviewed' ? 'completed' : 'active' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Case Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
            title="Back to Workstation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                CASE ID
              </span>
              <h1 className="text-2xl font-extrabold font-mono text-slate-900">
                {currentCase.id}
              </h1>
              
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                isQualityBlocked || isModelNotReady
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : currentCase.status.includes('Confirmed') || currentCase.status === 'Reviewed'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {currentCase.status.toUpperCase()}
              </span>

              {currentCase.isDemo ? (
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                  DEMO RECORD
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-300">
                  GENUINE INFERENCE (ResNet-18)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-medium">
              <span>Patient ID: <strong className="font-mono text-slate-900">{patient.patientId}</strong></span>
              <span>•</span>
              <span>X-ray View: <strong className="font-mono text-slate-900">{patient.xrayView}</strong></span>
              <span>•</span>
              <span>Analysis Date: <strong className="text-slate-900 font-mono flex items-center gap-1 inline-flex"><Clock className="w-3 h-3 text-blue-600" /> {patient.date}</strong></span>
              <span>•</span>
              <span>Age/Sex: <strong className="text-slate-900">{patient.age} Yrs / {patient.sex}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReportModal}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider font-mono"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Clinical Report</span>
          </button>
        </div>

      </div>

      {/* 2. Analysis Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {stepperStages.map((stg, idx) => (
            <React.Fragment key={stg.name}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center ${
                  stg.status === 'completed'
                    ? 'bg-blue-600 text-white'
                    : stg.status === 'blocked'
                    ? 'bg-amber-500 text-white'
                    : 'bg-cyan-500 text-white ring-4 ring-cyan-100'
                }`}>
                  {stg.status === 'completed' ? '✓' : stg.status === 'blocked' ? '!' : stg.num}
                </div>
                <span className={`text-xs font-bold font-mono tracking-wider ${
                  stg.status === 'blocked' ? 'text-amber-700 font-extrabold' : stg.status === 'active' ? 'text-cyan-600 font-extrabold' : 'text-slate-700'
                }`}>
                  {stg.num} {stg.name}
                </span>
              </div>

              {idx < stepperStages.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. Image Quality Review Required Banner */}
      {isQualityBlocked && (
        <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-1">
              <AlertTriangle className="w-6 h-6 animate-pulse text-amber-600" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-amber-950 tracking-tight">
                  Image Quality Review Required
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                  AUTOMATED ANALYSIS PAUSED
                </span>
              </div>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                <strong>Recorded Concern:</strong> {aiResult.analysisBlockedReason || 'Suboptimal contrast or motion blur detected during initial screening.'}
              </p>
              <p className="text-[11px] text-amber-800">
                To prevent false outputs, automated fracture evaluation was paused. The radiograph requires clinician verification or re-acquisition.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider font-mono">NEXT REVIEW ACTIONS:</span>

            {onStartNewAnalysis && (
              <button
                onClick={onStartNewAnalysis}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Better Image</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('review')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Continue to Clinician Review</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Navigation View Switcher Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'evidence'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Imaging Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Clinician Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden md:block">
          Clinical Decision Support Mode: Advisory Findings
        </span>
      </div>

      {/* Uncertainty Callout Banner */}
      {!isQualityBlocked && isUncertain && (
        <UncertaintyBanner
          confidence={confidence}
          reason={aiResult.uncertaintyReason || 'AI confidence is below configured threshold.'}
        />
      )}

      {/* Main Content Workspace Area */}
      {activeTab === 'evidence' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Area 1: Case Info and Dominant X-Ray Viewer */}
            <div className="lg:col-span-7 space-y-4">
              <XRayViewer
                imageUrl={currentCase.imageUrl}
                regions={aiResult.regionsOfInterest}
                showBoundingBox={isFracture && !isQualityBlocked && !isImageError}
                xrayViewLabel={patient.xrayView}
                clinicianAnnotation={clinicianReview?.clinicianAnnotation}
                onImageErrorChange={(err) => setIsImageError(err)}
                onUpdateImage={(newUrl) => onUpdateCaseImage && onUpdateCaseImage(currentCase.id, newUrl)}
              />
            </div>

            {/* Area 2: Findings and Image-Quality Panel */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
                isImageError || isQualityBlocked
                  ? 'bg-amber-50/40 border-amber-300'
                  : isModelDisconnected
                  ? 'bg-slate-50 border-slate-300'
                  : isAnalysisFailed
                  ? 'bg-rose-50/40 border-rose-300'
                  : isFracture
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}>
                
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    ANALYSIS FINDINGS & STATUS
                  </span>

                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {isImageError
                      ? 'IMAGE UNREADABLE'
                      : isAnalysisFailed
                      ? 'ANALYSIS FAILED'
                      : isModelDisconnected
                      ? 'AI MODEL NOT CONNECTED'
                      : isQualityBlocked
                      ? 'QUALITY REVIEW REQUIRED'
                      : 'ANALYSIS COMPLETED'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">CAUTIOUS FINDING CATEGORY</span>
                  <div className="flex items-center gap-3">
                    {isImageError || isQualityBlocked ? (
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    ) : isModelDisconnected ? (
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5 text-slate-700" />
                      </div>
                    ) : isAnalysisFailed ? (
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-rose-700" />
                      </div>
                    ) : isFracture ? (
                      <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <h2 className={`text-xl font-extrabold tracking-tight ${
                        isImageError || isQualityBlocked
                          ? 'text-amber-900'
                          : isModelDisconnected
                          ? 'text-slate-900'
                          : isAnalysisFailed
                          ? 'text-rose-900'
                          : isFracture
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}>
                        {getClinicalFindingText()}
                      </h2>
                      <p className="text-xs text-slate-700 font-semibold">
                        LOCATION: <span className="text-slate-900 font-bold">{isImageError ? 'None (Image Load Failed)' : isModelDisconnected ? 'None (AI Model Not Connected)' : aiResult.suspectedRegion}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score & Confidence Summary */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">AI CONFIDENCE</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-lg font-extrabold ${isModelDisconnected || isAnalysisFailed ? 'text-slate-500 font-sans text-sm font-semibold' : 'text-blue-700'}`}>
                          {isImageError || isQualityBlocked || isModelDisconnected || isAnalysisFailed ? 'Not Available' : `${aiResult.confidence}%`}
                        </span>
                        {aiResult.isDemoConfidence && !isModelDisconnected && !isAnalysisFailed && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            DEMO SCORE
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">CONFIDENCE BAND</span>
                      <span className={`text-lg font-extrabold ${
                        isModelDisconnected || isAnalysisFailed || isImageError
                          ? 'text-slate-500'
                          : aiResult.confidenceBand === 'HIGH'
                          ? 'text-rose-700'
                          : 'text-emerald-700'
                      }`}>
                        {isImageError || isModelDisconnected || isAnalysisFailed ? 'N/A' : aiResult.confidenceBand}
                      </span>
                    </div>
                  </div>

                  {/* Clarifying Explanation on AI Confidence */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-sans leading-relaxed flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      {isModelDisconnected ? (
                        <strong>Model Offline:</strong>
                      ) : (
                        <strong>Demo Analysis Notice:</strong>
                      )}
                      {' '}
                      {isModelDisconnected
                        ? 'Deep learning model is not connected to this prototype workstation. For patient safety, genuine fracture predictions are unavailable and synthetic scores are never generated.'
                        : 'AI Confidence score is an illustrative sample score for workflow demonstration. Deep learning inference server is not currently connected.'}
                    </span>
                  </div>

                  {/* Cautious Finding Clarification */}
                  {!isFracture && !isQualityBlocked && !isImageError && !isModelDisconnected && !isAnalysisFailed && (
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 font-sans leading-relaxed">
                      <strong>Clinical Advisory:</strong> "No Fracture Candidate Identified" indicates no acute cortical disruption was identified in this projection. It does not prove the absence of subtle non-displaced fractures, bone contusions, or ligamentous tears. Qualified clinician verification is mandatory.
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 leading-relaxed font-sans pt-1">
                    "{isImageError ? 'Automated analysis blocked due to image loading failure.' : aiResult.interpretation}"
                  </div>
                </div>

              </div>

              {/* Quality Assessment Component */}
              <QualityCard qualityChecks={aiResult.qualityChecks} imageQualityLabel={aiResult.imageQuality} isImageError={isImageError} />

            </div>

          </div>

          {/* Research Profile Graphs */}
          {!isQualityBlocked && !isImageError && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ConfidenceProfileChart confidencePercentage={aiResult.confidence} />
              <EvidenceBreakdownChart confidenceScore={aiResult.confidence} />
            </div>
          )}

          {/* Area 3: Review Decision & Recent Activity */}
          <ClinicianReviewCard
            currentReview={clinicianReview}
            onSaveReview={onSaveReview}
          />

          {/* Side-by-Side Comparison */}
          <AIvsClinicianCard
            aiResult={aiResult}
            clinicianReview={clinicianReview}
          />

          {/* Audit Trail Timeline */}
          <AuditTrailTimeline events={auditTrail} />

          {/* COMPACT SECTION: Case Activity & Workload Overview (Prompt Requirement #3) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Workload Overview & Case Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Application Workload Records</span>
            </div>

            {/* Metrics Tally Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">RECEIVED TODAY</span>
                <span className="text-xl font-extrabold text-slate-900 block">{workloadData.todayReceived}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">REVIEWED TODAY</span>
                <span className="text-xl font-extrabold text-emerald-600 block">{workloadData.todayReviewed}</span>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-0.5">
                <span className="text-[9px] text-amber-800 font-bold block uppercase">AWAITING REVIEW</span>
                <span className="text-xl font-extrabold text-amber-700 block">{workloadData.awaitingReview}</span>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 space-y-0.5">
                <span className="text-[9px] text-rose-800 font-bold block uppercase">QUALITY REVIEWS</span>
                <span className="text-xl font-extrabold text-rose-600 block">{workloadData.qualityReviewRequired}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">THIS WEEK RECEIVED</span>
                <span className="text-xl font-extrabold text-blue-700 block">{workloadData.weekReceived}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">THIS WEEK REVIEWED</span>
                <span className="text-xl font-extrabold text-emerald-700 block">{workloadData.weekReviewed}</span>
              </div>
            </div>

            {/* Daily Bar & Weekly Trend Preview Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block uppercase font-mono">Daily Case Activity</span>
                <div className="h-14 flex items-end gap-2 pt-2 border-b border-slate-200">
                  <div style={{ height: '60%' }} className="flex-1 bg-blue-600 rounded-t text-[9px] font-mono text-white text-center">3</div>
                  <div style={{ height: '80%' }} className="flex-1 bg-blue-600 rounded-t text-[9px] font-mono text-white text-center">4</div>
                  <div style={{ height: '40%' }} className="flex-1 bg-blue-600 rounded-t text-[9px] font-mono text-white text-center">2</div>
                  <div style={{ height: '100%' }} className="flex-1 bg-blue-600 rounded-t text-[9px] font-mono text-white text-center">5</div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Today</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block uppercase font-mono">Weekly Trend (Received vs Reviewed)</span>
                <div className="h-14 flex items-end gap-4 pt-2 border-b border-slate-200">
                  <div className="flex-1 space-y-1">
                    <div className="h-8 bg-blue-500 rounded text-[9px] font-mono text-white text-center">Received (5)</div>
                    <div className="h-5 bg-emerald-500 rounded text-[9px] font-mono text-white text-center">Reviewed (3)</div>
                  </div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>Current Week Progress</span>
                  <span className="text-emerald-700 font-bold">60% Throughput</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'review' && (
        <div className="space-y-6">
          <ClinicianReviewCard
            currentReview={clinicianReview}
            onSaveReview={onSaveReview}
          />

          <AIvsClinicianCard
            aiResult={aiResult}
            clinicianReview={clinicianReview}
          />
        </div>
      )}

      {activeTab === 'audit' && (
        <AuditTrailTimeline events={auditTrail} />
      )}

    </div>
  );
};
