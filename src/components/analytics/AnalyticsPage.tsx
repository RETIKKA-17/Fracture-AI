import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart as PieIcon,
  TrendingUp,
  Info,
  ShieldCheck
} from 'lucide-react';
import type { CaseRecord } from '../../types';

interface AnalyticsPageProps {
  cases?: CaseRecord[];
}

type DateFilterOption = 'today' | '7days' | '30days' | 'custom';

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ cases = [] }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('7days');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-09');

  // Filter cases by selected date range
  const filteredCases = useMemo(() => {
    const now = new Date();

    return cases.filter((c) => {
      // Parse case date (supports YYYY-MM-DD or relative 'Today', 'Yesterday')
      let caseDate: Date;
      if (c.createdDate) {
        caseDate = new Date(c.createdDate);
      } else {
        caseDate = now;
      }

      if (isNaN(caseDate.getTime())) {
        caseDate = now;
      }

      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        const caseStr = caseDate.toISOString().split('T')[0];
        return caseStr === todayStr || c.patient.date.includes('Today');
      }

      if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return caseDate >= sevenDaysAgo || c.patient.date.includes('Today') || c.patient.date.includes('Yesterday');
      }

      if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return caseDate >= thirtyDaysAgo;
      }

      if (dateFilter === 'custom') {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return caseDate >= start && caseDate <= end;
      }

      return true;
    });
  }, [cases, dateFilter, startDate, endDate]);

  // Metric 1: Received Cases (Unique cases created)
  const casesReceivedCount = filteredCases.length;

  // Metric 2: Reviewed Cases (Cases with clinician review decision)
  const casesReviewed = filteredCases.filter(
    (c) =>
      c.status === 'Reviewed' ||
      c.status === 'Clinician Confirmed' ||
      c.status === 'Clinician Edited' ||
      c.status === 'Rejected by Clinician' ||
      c.status === 'Uncertain — Further Review Required' ||
      (c.clinicianReview && c.clinicianReview.isSaved)
  );
  const casesReviewedCount = casesReviewed.length;

  // Metric 3: Pending Review (Awaiting clinician verification)
  const pendingReviewCount = filteredCases.filter(
    (c) =>
      c.status === 'Review Required' ||
      c.status === 'Analysis Completed — Review Pending' ||
      (c.clinicianReview?.agreement === 'Pending' && c.status !== 'Quality Review Required')
  ).length;

  // Metric 4: Image Quality Concerns
  const qualityConcernsCount = filteredCases.filter(
    (c) =>
      c.status === 'Quality Review Required' ||
      c.aiResult?.imageQuality === 'Unsuitable for automated analysis' ||
      c.aiResult?.qualityChecks?.screeningStatus === 'REVIEW_REQUIRED'
  ).length;

  // Metric 5: Review Completion Rate (%)
  const completionRate =
    casesReceivedCount > 0
      ? Math.round((casesReviewedCount / casesReceivedCount) * 100)
      : 0;

  // Aggregate Data for Daily Case Volume Chart
  const dailyVolumeMap = useMemo(() => {
    const map: Record<string, { received: number; reviewed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      map[displayLabel] = { received: 0, reviewed: 0 };
    }

    filteredCases.forEach((c) => {
      let d = new Date(c.createdDate || Date.now());
      if (isNaN(d.getTime())) d = new Date();
      const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      if (!map[displayLabel]) {
        map[displayLabel] = { received: 0, reviewed: 0 };
      }
      map[displayLabel].received += 1;
      if (
        c.status === 'Reviewed' ||
        c.status === 'Clinician Confirmed' ||
        c.status === 'Clinician Edited' ||
        c.status === 'Rejected by Clinician' ||
        c.clinicianReview?.isSaved
      ) {
        map[displayLabel].reviewed += 1;
      }
    });

    return map;
  }, [filteredCases]);

  // Status Distribution Data for Donut Chart
  const statusCounts = useMemo(() => {
    const confirmed = filteredCases.filter((c) => c.status === 'Clinician Confirmed' || c.clinicianReview?.action === 'Confirm').length;
    const edited = filteredCases.filter((c) => c.status === 'Clinician Edited' || c.clinicianReview?.action === 'Edit').length;
    const rejected = filteredCases.filter((c) => c.status === 'Rejected by Clinician' || c.clinicianReview?.action === 'Reject').length;
    const qualityReq = filteredCases.filter((c) => c.status === 'Quality Review Required').length;
    const pending = filteredCases.filter((c) => c.status === 'Review Required' || c.status === 'Analysis Completed — Review Pending').length;
    const uncertain = filteredCases.filter((c) => c.status === 'Uncertain — Further Review Required').length;

    return { confirmed, edited, rejected, qualityReq, pending, uncertain };
  }, [filteredCases]);

  // Image Quality Concerns Grouped
  const qualityFlagBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {
      'Excessive Blur': 0,
      'Low Contrast': 0,
      'Low Brightness': 0,
      'Incomplete Anatomy': 0,
    };

    filteredCases.forEach((c) => {
      const flags = c.aiResult?.qualityChecks?.qualityFlags || [];
      if (flags.includes('EXCESSIVE_BLUR')) breakdown['Excessive Blur'] += 1;
      if (flags.includes('POOR_CONTRAST')) breakdown['Low Contrast'] += 1;
      if (flags.includes('LOW_BRIGHTNESS')) breakdown['Low Brightness'] += 1;
      if (flags.includes('INCOMPLETE_ANATOMY')) breakdown['Incomplete Anatomy'] += 1;
    });

    return breakdown;
  }, [filteredCases]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header Bar with Demo Data Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Workload & Activity Analytics
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Operational review metrics, case throughput, and image-quality screening distribution.
          </p>
        </div>

        {/* Date Filters Control Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['today', '7days', '30days', 'custom'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setDateFilter(opt)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer capitalize font-medium ${
                  dateFilter === opt
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt === '7days' ? 'Last 7 Days' : opt === '30days' ? 'Last 30 Days' : opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Range Selector (Shown when Custom is selected) */}
      {dateFilter === 'custom' && (
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700 uppercase tracking-wider">Start Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider">End Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <span className="text-slate-500 text-[11px] font-mono">
            Showing metrics from {startDate} to {endDate}
          </span>
        </div>
      )}

      {/* Demo Data Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900">Demo Workload Monitoring View</span>
          <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
            Activity counts and throughput percentages reflect actual case records stored in the current workstation session. Demo data does not represent a real hospital dataset.
          </p>
        </div>
      </div>

      {/* 2. Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Cases Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CASES RECEIVED</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">
            {casesReceivedCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Total cases ingested</span>
        </div>

        {/* Card 2: Cases Reviewed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">CASES REVIEWED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-600">
            {casesReviewedCount}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">Clinician signed-off</span>
        </div>

        {/* Card 3: Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">PENDING REVIEW</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-700">
            {pendingReviewCount}
          </div>
          <span className="text-[11px] text-amber-800 font-medium block">Awaiting verification</span>
        </div>

        {/* Card 4: Quality Concerns */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">QUALITY CONCERNS</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-600">
            {qualityConcernsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Image quality flagged</span>
        </div>

        {/* Card 5: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">COMPLETION RATE</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-600">
            {completionRate}%
          </div>
          <span className="text-[11px] text-slate-500 block">Reviewed vs Received</span>
        </div>

      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Daily Case Volume Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
                <span>Daily Case Volume</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ingested case count by day in selected range</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Daily Ingestion</span>
          </div>

          <div className="pt-4 space-y-3">
            {Object.entries(dailyVolumeMap).map(([day, counts]) => (
              <div key={day} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 font-mono">{day}</span>
                  <span className="font-mono text-slate-500 text-[11px]">
                    Received: <strong className="text-slate-900">{counts.received}</strong> | Reviewed: <strong className="text-emerald-600">{counts.reviewed}</strong>
                  </span>
                </div>
                <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex font-mono text-[9px]">
                  <div
                    style={{ width: `${Math.min(counts.received * 20, 100)}%` }}
                    className="bg-blue-600 h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2 text-white font-bold"
                  >
                    {counts.received > 0 ? counts.received : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Review Status Distribution Donut/Pie Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Review Status Distribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Current Queue</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-900">Clinician Confirmed</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{statusCounts.confirmed}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 border border-cyan-200">
              <span className="font-bold text-cyan-900">Clinician Edited</span>
              <span className="font-mono font-bold text-cyan-700 text-sm">{statusCounts.edited}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="font-bold text-rose-900">Rejected by Clinician</span>
              <span className="font-mono font-bold text-rose-700 text-sm">{statusCounts.rejected}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-900">Quality Review Required</span>
              <span className="font-mono font-bold text-amber-800 text-sm">{statusCounts.qualityReq}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800">Pending Review</span>
              <span className="font-mono font-bold text-blue-700 text-sm">{statusCounts.pending}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Secondary Row: Image Quality Concerns & Weekly Workload Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 3: Image Quality Concerns Grouped Bar */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Recorded Image Quality Concerns
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Quality Flags</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(qualityFlagBreakdown).map(([flagName, count]) => (
              <div key={flagName} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-700">{flagName}</span>
                  <span className="font-mono font-bold text-amber-700">{count} cases</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    style={{ width: `${Math.min(count * 33, 100)}%` }}
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Weekly Workload Summary (Current Week vs Previous Week) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Weekly Workload Summary
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Week-over-Week Comparison</span>
          </div>

          {/* Real records check */}
          {casesReceivedCount > 0 ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-blue-900 uppercase block font-mono">THIS WEEK</span>
                  <span className="text-2xl font-extrabold text-blue-700 font-mono">{casesReceivedCount}</span>
                  <span className="text-[11px] text-slate-500 block">Cases Received</span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase block font-mono">THIS WEEK</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono">{casesReviewedCount}</span>
                  <span className="text-[11px] text-slate-500 block">Cases Reviewed</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <div className="flex justify-between font-mono font-bold text-slate-800">
                  <span>Review Completion Ratio:</span>
                  <span className="text-blue-700">{completionRate}%</span>
                </div>
                <p className="mt-1 text-slate-500">
                  Previous week baseline comparison requires multi-week record archives. No fabricated metrics are displayed.
                </p>
              </div>
            </div>
          ) : (
            /* Clean Empty State */
            <div className="p-8 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
              <ShieldCheck className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 font-bold">No workload records for this period</p>
              <p className="text-[11px] text-slate-500">Select a different date filter or run new analyses to generate workload analytics.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
