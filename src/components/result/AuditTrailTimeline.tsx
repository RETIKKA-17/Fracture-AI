import React from 'react';
import { Clock, Cpu, User, FileCheck, CheckCircle2 } from 'lucide-react';
import type { AuditEvent } from '../../types';

interface AuditTrailTimelineProps {
  events?: AuditEvent[];
}

export const AuditTrailTimeline: React.FC<AuditTrailTimelineProps> = ({ events }) => {
  const defaultEvents: AuditEvent[] = [
    { id: '1', timestamp: 'Today, 14:20:05', event: 'Case created & DICOM metadata ingested', actor: 'System', details: 'Assigned WR-024 to radiologist queue' },
    { id: '2', timestamp: 'Today, 14:20:08', event: 'Image quality assessment completed', actor: 'Quality Validator', details: 'All 6 quality indicators verified (GOOD)' },
    { id: '3', timestamp: 'Today, 14:20:12', event: 'AI fracture candidate detection completed', actor: 'AI Saliency Engine', details: 'Fracture Suspected (Demo Score: 94%)' },
    { id: '4', timestamp: 'Today, 14:20:15', event: 'Grad-CAM saliency explanation generated', actor: 'AI Saliency Engine', details: 'High activation region at distal radius metaphysis' },
    { id: '5', timestamp: 'Today, 14:20:18', event: 'Confidence & uncertainty interpreted', actor: 'System', details: 'High confidence band calculated' },
    { id: '6', timestamp: 'Today, 14:22:00', event: 'Clinician review started', actor: 'Dr. Clinician', details: 'Workstation viewer open' },
    { id: '7', timestamp: 'Today, 14:23:45', event: 'Clinician review completed & signed off', actor: 'Dr. Clinician', details: 'Agreement: Agree (Confirmed)' },
  ];

  const list = events && events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Clinical Audit Trail</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable timeline of automated AI operations & clinician actions.
          </p>
        </div>

        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          AUDIT LOG VERIFIED
        </span>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {list.map((ev, idx) => {
          const isAI = ev.actor === 'AI Saliency Engine';
          const isClinician = ev.actor === 'Dr. Clinician';
          const isSystem = ev.actor === 'System' || ev.actor === 'Quality Validator';

          return (
            <div key={ev.id || idx} className="relative flex items-start gap-4 text-xs group">
              
              {/* Timeline Marker Dot */}
              <div className={`absolute -left-[23px] top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white ${
                isAI
                  ? 'border-cyan-500 text-cyan-600 shadow-xs'
                  : isClinician
                  ? 'border-emerald-500 text-emerald-600 shadow-xs'
                  : 'border-slate-400 text-slate-500'
              }`}>
                {isAI && <Cpu className="w-2.5 h-2.5" />}
                {isClinician && <User className="w-2.5 h-2.5" />}
                {isSystem && <CheckCircle2 className="w-2.5 h-2.5" />}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-3 rounded-xl border border-slate-200/80 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    {ev.event}
                  </span>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ev.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-600 font-sans">{ev.details}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isAI
                      ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      : isClinician
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {ev.actor}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
