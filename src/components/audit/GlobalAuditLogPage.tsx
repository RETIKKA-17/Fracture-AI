import React, { useState } from 'react';
import { FileCheck, Download } from 'lucide-react';
import type { CaseRecord } from '../../types';
import { AuditTrailTimeline } from '../result/AuditTrailTimeline';

interface GlobalAuditLogPageProps {
  cases: CaseRecord[];
}

export const GlobalAuditLogPage: React.FC<GlobalAuditLogPageProps> = ({ cases }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'WR-024');

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Audit Trail</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete, timestamped log of AI model inference events, quality checks, and clinician sign-offs.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting encrypted clinical audit log (CSV/JSON)...')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Case Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Case Audit Log:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                Case {c.id} — Patient {c.patient.patientId} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Case Status: <span className="font-bold text-blue-700">{selectedCase?.status}</span>
        </div>
      </div>

      {/* Timeline Component */}
      <AuditTrailTimeline events={selectedCase?.auditTrail} />

    </div>
  );
};
