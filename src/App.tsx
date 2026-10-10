import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, type UserRole } from './context/AuthContext';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { HeaderNavbar } from './components/layout/HeaderNavbar';
import { LoginPage } from './components/auth/LoginPage';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { NewAnalysisPage } from './components/analysis/NewAnalysisPage';
import { AIResultPage } from './components/result/AIResultPage';
import { CaseHistoryPage } from './components/history/CaseHistoryPage';
import { ReviewQueuePage } from './components/review/ReviewQueuePage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { EvaluationPage } from './components/evaluation/EvaluationPage';
import { GlobalAuditLogPage } from './components/audit/GlobalAuditLogPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ClinicalReportModal } from './components/report/ClinicalReportModal';
import { DemoArchitectureModal } from './components/profile/DemoArchitectureModal';

// Admin Workspace Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { AdminActivityPage } from './components/admin/AdminActivityPage';
import { AdminSettingsPage } from './components/admin/AdminSettingsPage';

import type { CaseRecord, PatientInfo, ReviewAgreement, ClinicianAction } from './types';
import { getStoredCases, analyseXRay, updateCaseReview, updateCaseImage } from './services/analysisService';
import { ShieldAlert } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (!isAuthenticated) return 'login';
    return user?.role === 'admin' ? 'admin-dashboard' : 'dashboard';
  });

  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('WR-025');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [unauthorizedMsg, setUnauthorizedMsg] = useState<string>('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDemoInfoOpen, setIsDemoInfoOpen] = useState<boolean>(false);

  // Load stored cases on mount
  useEffect(() => {
    const loadedCases = getStoredCases();
    setCases(loadedCases);
  }, []);

  // Enforce Protected Routes & Role Boundaries
  useEffect(() => {
    if (!isAuthenticated) {
      if (activeTab !== 'login' && activeTab !== 'landing') {
        setActiveTab('login');
      }
      return;
    }

    // Role-based route guard
    const isAdminTab = activeTab.startsWith('admin-');
    if (user?.role === 'doctor' && isAdminTab) {
      setUnauthorizedMsg('Access Denied: Administrative features require Admin role credentials.');
      setActiveTab('dashboard');
      setTimeout(() => setUnauthorizedMsg(''), 4000);
    }
  }, [isAuthenticated, user?.role, activeTab]);

  // Handle case selection
  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigation handler with RBAC check
  const handleNavigate = (tab: NavTab) => {
    if (!isAuthenticated && tab !== 'login' && tab !== 'landing') {
      setActiveTab('login');
      return;
    }

    // Role guard check
    if (user?.role === 'doctor' && tab.startsWith('admin-')) {
      setUnauthorizedMsg('Access Denied: Administrative workspace features require Administrator permissions.');
      setActiveTab('dashboard');
      setTimeout(() => setUnauthorizedMsg(''), 4000);
      return;
    }

    setActiveTab(tab);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler with role redirect
  const handleSuccessLogin = (role: UserRole) => {
    if (role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Run AI analysis pipeline
  const handleRunAnalysis = async (
    imageUrl: string,
    patientInfo: Partial<PatientInfo>,
    sampleType: 'fracture' | 'normal' | 'blurry' | 'custom_upload' | 'failed' = 'custom_upload'
  ): Promise<CaseRecord> => {
    const newCase = await analyseXRay(imageUrl, patientInfo, sampleType);
    const updatedList = getStoredCases();
    setCases(updatedList);
    setSelectedCaseId(newCase.id);
    setActiveTab('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return newCase;
  };

  // Save Clinician Review
  const handleSaveReview = (
    agreement: ReviewAgreement,
    notes: string,
    action?: ClinicianAction,
    correctedLocation?: string
  ) => {
    if (!selectedCaseId) return;
    const updated = updateCaseReview(selectedCaseId, agreement, notes, action, correctedLocation);
    if (updated) {
      const refreshedList = getStoredCases();
      setCases(refreshedList);
    }
  };

  // Update Case Image
  const handleUpdateCaseImage = (caseId: string, newImageUrl: string) => {
    const updated = updateCaseImage(caseId, newImageUrl);
    if (updated) {
      const refreshedList = getStoredCases();
      setCases(refreshedList);
    }
  };

  // Active case object
  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const pendingCount = cases.filter(
    (c) =>
      c.status === 'Review Required' ||
      c.status === 'Quality Review Required' ||
      c.status === 'Analysis Completed — Review Pending'
  ).length;

  // Unauthenticated or login tab view
  if (!isAuthenticated || activeTab === 'login') {
    return <LoginPage onSuccessLogin={handleSuccessLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* 1. Global Fixed Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
        reviewRequiredCount={pendingCount}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Area */}
      <div className="flex-1 min-w-0 lg:pl-[250px] min-h-screen flex flex-col">
        
        {/* Top Slim Header Navbar */}
        <HeaderNavbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onSelectCase={handleSelectCase}
          onOpenDemoInfo={() => setIsDemoInfoOpen(true)}
          selectedCaseId={selectedCaseId}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Unauthorized Access Error Banner */}
        {unauthorizedMsg && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{unauthorizedMsg}</span>
            </div>
            <button onClick={() => setUnauthorizedMsg('')} className="underline text-[11px] cursor-pointer">
              Dismiss
            </button>
          </div>
        )}


        {/* Dynamic Route View Renderer */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'landing' && (
            <LandingPage
              onEnterDashboard={() => handleNavigate(user?.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
              onStartNewAnalysis={() => handleNavigate('new-analysis')}
            />
          )}

          {/* DOCTOR ROUTES */}
          {activeTab === 'dashboard' && (
            <Dashboard
              cases={cases}
              onStartNewAnalysis={() => handleNavigate('new-analysis')}
              onSelectCase={handleSelectCase}
              onNavigateHistory={() => handleNavigate('review-queue')}
            />
          )}

          {activeTab === 'new-analysis' && (
            <NewAnalysisPage onRunAnalysis={handleRunAnalysis} />
          )}

          {activeTab === 'result' && currentCase && (
            <AIResultPage
              currentCase={currentCase}
              cases={cases}
              onBack={() => handleNavigate(user?.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
              onSaveReview={handleSaveReview}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onStartNewAnalysis={() => handleNavigate('new-analysis')}
              onUpdateCaseImage={handleUpdateCaseImage}
            />
          )}

          {activeTab === 'cases' && (
            <CaseHistoryPage
              cases={cases}
              onSelectCase={handleSelectCase}
              onStartNewAnalysis={() => handleNavigate('new-analysis')}
            />
          )}

          {activeTab === 'review-queue' && (
            <ReviewQueuePage
              cases={cases}
              onSelectCase={handleSelectCase}
              onStartNewAnalysis={() => handleNavigate('new-analysis')}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage cases={cases} />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationPage />
          )}

          {activeTab === 'audit-log' && (
            <GlobalAuditLogPage cases={cases} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}

          {/* ADMIN ROUTES */}
          {activeTab === 'admin-dashboard' && (
            <AdminDashboard
              cases={cases}
              onNavigateUsers={() => handleNavigate('admin-users')}
              onNavigateActivity={() => handleNavigate('admin-activity')}
              onNavigateSettings={() => handleNavigate('admin-settings')}
            />
          )}

          {activeTab === 'admin-users' && (
            <UserManagementPage />
          )}

          {activeTab === 'admin-activity' && (
            <AdminActivityPage cases={cases} />
          )}

          {activeTab === 'admin-settings' && (
            <AdminSettingsPage />
          )}
        </main>
      </div>

      {/* Printable Report Modal */}
      {currentCase && (
        <ClinicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          currentCase={currentCase}
        />
      )}

      {/* Demo Architecture Explainer Modal */}
      <DemoArchitectureModal
        isOpen={isDemoInfoOpen}
        onClose={() => setIsDemoInfoOpen(false)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
