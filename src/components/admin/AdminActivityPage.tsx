import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import type { CaseRecord } from '../../types';

interface AdminActivityPageProps {
  cases: CaseRecord[];
}

export const AdminActivityPage: React.FC<AdminActivityPageProps> = ({ cases }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all audit events across all cases
  const allEvents = cases.flatMap((c) =>
    (c.auditTrail || []).map((ev) => ({
      ...ev,
      caseId: c.id,
      patientId: c.patient.patientId,
      status: c.status,
    }))
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filteredEvents = allEvents.filter(
    (ev) =>
      ev.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Case Activity Audit Log</h1>
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Complete immutable activity log tracking radiograph ingestion, quality screening, AI outputs, and doctor sign-offs.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity by Case ID, event, actor, or details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 text-xs font-medium text-slate-500 flex justify-between items-center">
          <span>Showing {filteredEvents.length} system audit trail entries</span>
          <span className="font-mono text-[10px] text-slate-400">PACS / Workstation Ingestion Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                <th className="py-3.5 px-5">TIMESTAMP</th>
                <th className="py-3.5 px-4">CASE ID</th>
                <th className="py-3.5 px-6">EVENT DESCRIPTION</th>
                <th className="py-3.5 px-4">ACTOR / AGENT</th>
                <th className="py-3.5 px-6">EVENT DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEvents.map((ev) => (
                <tr key={`${ev.caseId}-${ev.id}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{ev.timestamp}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ev.caseId}</td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{ev.event}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      ev.actor === 'Dr. Clinician'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ev.actor === 'Quality Validator'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {ev.actor}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 font-mono text-[11px] truncate max-w-xs">{ev.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
