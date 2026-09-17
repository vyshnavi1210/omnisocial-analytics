import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { WebSocketProvider } from './context/WebSocketContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { ProtectedRoute } from './components/layout/ProtectedRoute.js';

import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardOverview } from './pages/DashboardOverview.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ContentSchedulerPage } from './pages/ContentSchedulerPage.js';
import { PlatformsPage } from './pages/PlatformsPage.js';
import { TeamManagementPage } from './pages/TeamManagementPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <AppLayout>
                    <DashboardOverview />
                  </AppLayout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AppLayout>
                    <AnalyticsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/posts"
                element={
                  <AppLayout>
                    <ContentSchedulerPage />
                  </AppLayout>
                }
              />
              <Route
                path="/platforms"
                element={
                  <AppLayout>
                    <PlatformsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                }
              />
            </Route>

            {/* Admin-Only RBAC Route */}
            <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
              <Route
                path="/team"
                element={
                  <AppLayout>
                    <TeamManagementPage />
                  </AppLayout>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
