import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Pages
import { Dashboard } from './pages/Dashboard.js';
import { Applications } from './pages/Applications.js';
import { ApplicationDetail } from './pages/ApplicationDetail.js';
import { NewApplicationWizard } from './pages/NewApplicationWizard.js';
import { ScrutinyWorkspace } from './pages/ScrutinyWorkspace.js';
import { Institutions } from './pages/Institutions.js';
import { Compliance } from './pages/Compliance.js';
import { EvcManagement } from './pages/EvcManagement.js';
import { AgentCenter } from './pages/AgentCenter.js';
import { RegulatoryKnowledge } from './pages/RegulatoryKnowledge.js';
import { CoursesDirectory } from './pages/CoursesDirectory.js';
import { GuidelinesExplorer } from './pages/GuidelinesExplorer.js';
import { Reports } from './pages/Reports.js';
import { AuditLogs } from './pages/AuditLogs.js';
import { SettingsPage } from './pages/Settings.js';
import { Login } from './pages/Login.js';
import { AicteOfficialPortal } from './pages/AicteOfficialPortal.js';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500 animate-ping"></span>
          Restoring RegulaFlow session...
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Main Shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="official" element={<AicteOfficialPortal />} />
            <Route path="courses" element={<CoursesDirectory />} />
            <Route path="guidelines" element={<GuidelinesExplorer />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<NewApplicationWizard />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="scrutiny" element={<ScrutinyWorkspace />} />
            <Route path="institutions" element={<Institutions />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="evc" element={<EvcManagement />} />
            <Route path="agents" element={<AgentCenter />} />
            <Route path="knowledge" element={<RegulatoryKnowledge />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
