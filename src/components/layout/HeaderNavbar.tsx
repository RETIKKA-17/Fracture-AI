import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, ChevronDown, Settings, LogOut, Info, AlertTriangle, Menu } from 'lucide-react';
import type { NavTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface HeaderNavbarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onSelectCase: (caseId: string) => void;
  onOpenDemoInfo: () => void;
  selectedCaseId?: string;
  onToggleMobileSidebar?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeTab,
  onNavigate,
  onSelectCase,
  onOpenDemoInfo,
  selectedCaseId,
  onToggleMobileSidebar,
}) => {
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Clinical Dashboard', sub: 'Overview & Workstation Status' };
      case 'new-analysis':
        return { title: 'New X-Ray Analysis', sub: 'Upload Radiograph for AI Fracture Detection' };
      case 'result':
        return { title: `Case Analysis Viewer: ${selectedCaseId || 'WR-024'}`, sub: 'X-Ray Saliency & Clinician Verification' };
      case 'cases':
        return { title: 'Case Management Directory', sub: 'Searchable Clinical Database' };
      case 'review-queue':
        return { title: 'Clinician Review Queue', sub: 'Prioritized Workload Management' };
      case 'analytics':
        return { title: 'Workflow Analytics', sub: 'Diagnostic Performance & Review Statistics' };
      case 'evaluation':
        return { title: 'Model Evaluation & Benchmarks', sub: 'GRAZPEDWRI-DX & Public Benchmark Validation' };
      case 'settings':
        return { title: 'System Settings', sub: 'Workstation Preferences & Limitations' };
      case 'audit-log':
        return { title: 'System Audit Trail', sub: 'Complete Immutable Event Timeline' };
      case 'landing':
        return { title: 'WristAI Overview', sub: 'Academic Research Prototype' };
      default:
        return { title: 'Clinical Workspace', sub: 'Decision Support System' };
    }
  };

  const pageInfo = getPageTitle();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith('WR-') || query.startsWith('PT-')) {
      onSelectCase(query);
    } else {
      onNavigate('cases');
    }
  };

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    onNavigate('login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DC';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      
      {/* Left Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{pageInfo.title}</span>
            {activeTab === 'result' && (
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                ACTIVE CASE
              </span>
            )}
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            {pageInfo.sub}
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by Case ID (e.g. WR-024) or Patient ID..."
            className="w-full pl-10 pr-12 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-sans"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {user?.isDemo && (
          <div className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>DEMO MODE</span>
          </div>
        )}

        <button
          onClick={onOpenDemoInfo}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Architecture Overview"
        >
          <Info className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 text-xs">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">2 Unread</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 cursor-pointer space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Quality Screening Alert
                    </span>
                    <span className="text-[10px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-600">Case WR-025 requires quality review before fracture analysis.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              {initials}
            </div>
            <div className="text-left hidden xl:block">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                {user?.name || 'Dr. Clinician'}
                <ShieldCheck className="w-3 h-3 text-blue-600" />
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{user?.name || 'Dr. Clinician'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'clinician@wristai.org'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
