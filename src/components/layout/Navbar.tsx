import React, { useState } from 'react';
import { Activity, PlusCircle, History, LayoutDashboard, ShieldCheck, ChevronDown, User, Settings, LogOut, Info } from 'lucide-react';

interface NavbarProps {
  activeTab: 'landing' | 'dashboard' | 'new-analysis' | 'result' | 'history';
  onNavigate: (tab: 'landing' | 'dashboard' | 'new-analysis' | 'history') => void;
  onOpenDemoInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, onOpenDemoInfo }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Academic CDSS Disclaimer Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border border-cyan-500/30">
              CDSS Mode
            </span>
            <span className="text-slate-300">
              WristAI assists clinical review — final decision remains with the clinician.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDemoInfo}
              className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 font-medium underline underline-offset-2 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              Demo System Architecture
            </button>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">Academic AI Project</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-cyan-600 p-0.5 shadow-md shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {/* Minimalist Medical X-Ray + AI Scan Lines Logo */}
                <div className="absolute inset-0 bg-blue-500/10" />
                <Activity className="w-5 h-5 text-cyan-400 relative z-10 animate-pulse" />
                <div className="absolute w-2 h-2 rounded-full bg-cyan-300 top-2 right-2 blur-[1px]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Wrist<span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                  v1.0 Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Explainable Clinical Decision Support
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('new-analysis')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'new-analysis'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Analysis</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Case History</span>
            </button>
          </nav>

          {/* Right Profile & Clinician Indicator */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-semibold text-xs">
                  DC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  Dr. Clinician
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="text-[10px] text-slate-500">Radiology Dept</div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Dr. Clinician</p>
                  <p className="text-[11px] text-slate-500">clinician@hospital-demo.org</p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Session Active
                  </div>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => { setProfileOpen(false); alert('Clinician Profile: Dr. Clinician (Lead Radiologist, Demo Account)'); }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Clinician Profile
                  </button>
                  <button 
                    onClick={() => { setProfileOpen(false); alert('Preferences: Default X-Ray View = AP/Lateral, Sensitivity = High, Grad-CAM Overlay = On'); }}
                    className="w-full px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    CDSS Preferences
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button 
                    onClick={() => { setProfileOpen(false); onNavigate('landing'); }}
                    className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    Exit to Landing Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
