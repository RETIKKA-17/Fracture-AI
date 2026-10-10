import React from 'react';
import {
  Users,
  ShieldCheck,
  Activity,
  FileText,
  UserCheck,
  ArrowRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { CaseRecord } from '../../types';

interface AdminDashboardProps {
  cases: CaseRecord[];
  onNavigateUsers: () => void;
  onNavigateActivity: () => void;
  onNavigateSettings: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cases,
  onNavigateUsers,
  onNavigateActivity,
  onNavigateSettings,
}) => {
  const { registeredUsers } = useAuth();

  const totalUsers = registeredUsers.length;
  const activeUsers = registeredUsers.filter((u) => u.isActive).length;
  const deactivatedUsers = totalUsers - activeUsers;
  const doctorAccounts = registeredUsers.filter((u) => u.role === 'doctor').length;
  const adminAccounts = registeredUsers.filter((u) => u.role === 'admin').length;

  const totalCases = cases.length;
  const reviewedCases = cases.filter((c) => c.status === 'Reviewed' || c.status === 'Clinician Confirmed').length;
  const qualityReviewCases = cases.filter((c) => c.status === 'Quality Review Required').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tight">System Administration Console</h1>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/30">
              ADMIN WORKSPACE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            WristAI User Management, System Activity Audit Logs & Global Settings
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateUsers}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Users className="w-4 h-4" />
            <span>User Management ({totalUsers})</span>
          </button>
        </div>
      </div>

      {/* 2. Real Metric Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Users Tally */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono">
              REGISTERED USERS
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{totalUsers}</div>
          <div className="text-[10px] text-slate-500 font-medium">
            {doctorAccounts} Doctors • {adminAccounts} Admins
          </div>
        </div>

        {/* Active Accounts Tally */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono">
              ACTIVE ACCOUNTS
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-700">{activeUsers}</div>
          <div className="text-[10px] text-slate-500 font-medium">
            {deactivatedUsers > 0 ? `${deactivatedUsers} Deactivated` : 'All accounts active'}
          </div>
        </div>

        {/* System Cases Ingested Tally */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono">
              SYSTEM CASES
            </span>
            <Database className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-900">{totalCases}</div>
          <div className="text-[10px] text-slate-500 font-medium">
            {reviewedCases} Confirmed by Doctors
          </div>
        </div>

        {/* Quality Review Tally */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono">
              QUALITY ALERTS
            </span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-700">{qualityReviewCases}</div>
          <div className="text-[10px] text-slate-500 font-medium">
            Suboptimal radiographs flagged
          </div>
        </div>

      </div>

      {/* 3. Quick Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* User Account Registry Table Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Account Registry</h2>
              <p className="text-[11px] text-slate-500">System user credentials and role assignments</p>
            </div>
            <button
              onClick={onNavigateUsers}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage All Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 font-mono">
                  <th className="py-2.5 px-3">NAME</th>
                  <th className="py-2.5 px-3">EMAIL</th>
                  <th className="py-2.5 px-3">ROLE</th>
                  <th className="py-2.5 px-3">TITLE</th>
                  <th className="py-2.5 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredUsers.slice(0, 5).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">{u.title}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Administration Shortcuts & Security Notice (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Admin Shortcuts Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Admin Actions</h2>
              <p className="text-[11px] text-slate-500">Administrative workspace controls</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <button
                onClick={onNavigateUsers}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">User Account Management</span>
                    <span className="text-[10px] text-slate-500">Create, edit & deactivate doctor accounts</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={onNavigateActivity}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Case Activity Audit Log</span>
                    <span className="text-[10px] text-slate-500">View complete system ingestion & review trail</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={onNavigateSettings}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">System Configuration</span>
                    <span className="text-[10px] text-slate-500">Security policies & AI thresholds</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Clinical Integrity Policy Notice */}
          <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
            <span className="font-bold text-cyan-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              CLINICAL INTEGRITY POLICY
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              System administrators are prohibited from modifying or overwriting a clinician's recorded diagnostic sign-off or clinical review notes. All doctor review signatures remain immutable in the audit ledger.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
