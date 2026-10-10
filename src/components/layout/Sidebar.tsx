import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  History,
  BarChart3,
  Award,
  Sliders,
  Cpu,
  ShieldCheck,
  LogOut,
  X,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'login'
  | 'landing'
  | 'dashboard'
  | 'new-analysis'
  | 'cases'
  | 'review-queue'
  | 'result'
  | 'analytics'
  | 'evaluation'
  | 'audit-log'
  | 'settings'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-activity'
  | 'admin-settings';

interface SidebarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenDemoInfo: () => void;
  reviewRequiredCount: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
  badgeColor?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  onOpenDemoInfo,
  reviewRequiredCount,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Doctor Nav Items
  const doctorNavItems: NavItem[] = [
    {
      id: 'dashboard' as NavTab,
      label: 'Clinical Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new-analysis' as NavTab,
      label: 'New Analysis',
      icon: PlusCircle,
      badge: 'Action',
      highlight: true,
    },
    {
      id: 'cases' as NavTab,
      label: 'Cases Directory',
      icon: FolderOpen,
      badge: null,
    },
    {
      id: 'review-queue' as NavTab,
      label: 'Review Queue',
      icon: History,
      badge: reviewRequiredCount > 0 ? `${reviewRequiredCount}` : null,
      badgeColor: 'amber',
    },
  ];

  // Admin Nav Items
  const adminNavItems: NavItem[] = [
    {
      id: 'admin-dashboard' as NavTab,
      label: 'Admin Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'admin-users' as NavTab,
      label: 'User Management',
      icon: Users,
      badge: 'Control',
      highlight: true,
    },
    {
      id: 'admin-activity' as NavTab,
      label: 'Audit Log & Activity',
      icon: FileText,
      badge: null,
    },
    {
      id: 'admin-settings' as NavTab,
      label: 'System Configuration',
      icon: Sliders,
      badge: null,
    },
  ];

  const researchNavItems = [
    {
      id: 'analytics' as NavTab,
      label: 'Workflow Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'evaluation' as NavTab,
      label: 'Model Evaluation',
      icon: Award,
      badge: null,
    },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const handleNavClick = (tab: NavTab) => {
    onNavigate(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : isAdmin
    ? 'AD'
    : 'DR';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Main Fixed Sidebar */}
      <aside
        className={`w-[250px] bg-slate-900 text-slate-300 flex flex-col h-screen min-h-screen fixed left-0 top-0 bottom-0 border-r border-slate-800 shrink-0 select-none z-40 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-5 border-b border-slate-800/80 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 p-0.5 shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  <Cpu className="w-5 h-5 text-cyan-400 relative z-10" />
                  <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white font-sans">
                    WRIST<span className="text-cyan-400">AI</span>
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isAdmin ? 'Admin Workspace' : 'Clinical Workspace'}
                </p>
              </div>
            </div>

            {/* Close Button for Mobile Drawer */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Badge Tag */}
          <div className="mt-3 flex items-center justify-between bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-[10px]">
            <span className={`font-semibold font-mono flex items-center gap-1 uppercase ${
              isAdmin ? 'text-cyan-400' : 'text-blue-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-cyan-400' : 'bg-blue-400'} animate-ping`} />
              ROLE: {user?.role || 'doctor'}
            </span>
            <span className="text-slate-500 font-mono">RBAC</span>
          </div>
        </div>

        {/* Scrollable Center Navigation */}
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          
          {/* ROLE-SPECIFIC WORKFLOW NAVIGATION */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
              {isAdmin ? 'ADMINISTRATION' : 'CLINICAL WORKFLOW'}
            </p>

            <nav className="space-y-1">
              {(isAdmin ? adminNavItems : doctorNavItems).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? isAdmin ? 'bg-cyan-600 text-white shadow-md font-semibold' : 'bg-blue-600 text-white shadow-md font-semibold'
                        : item.highlight
                        ? 'bg-blue-500/10 text-cyan-300 hover:bg-blue-500/20 border border-blue-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RESEARCH & ANALYTICS SECTION */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
              ANALYTICS & BENCHMARKS
            </p>

            <nav className="space-y-1">
              {researchNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Bottom Profile & Logout */}
        <div className="mt-auto shrink-0 p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 font-mono ${
                isAdmin ? 'bg-cyan-600' : 'bg-blue-600'
              }`}>
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  {user?.name || (isAdmin ? 'Admin User' : 'Dr. Clinician')}
                </div>
                <div className="text-[10px] text-slate-400 truncate capitalize font-mono">
                  {user?.title || user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onOpenDemoInfo();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-cyan-400 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer border border-slate-700/60"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              System Architecture
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
