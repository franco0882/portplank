import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../layout/DashboardLayout';
import { AgencyDashboard } from '../agency/AgencyDashboard';
import { ClientDashboard } from '../clients/ClientDashboard';
import { ClientManagement } from '../agency/ClientManagement';
import { TemplateManagement } from '../agency/TemplateManagement';
import { EmployeeManagement } from '../agency/EmployeeManagement';
import { ClientTaskEditor } from '../clients/ClientTaskEditor';
import { TaskManagement } from '../tasks/TaskManagement';
import { MessagesPage } from '../messages/MessagesPage';
import { SettingsPage } from '../settings/SettingsPage';
import { AnalyticsPage } from '../analytics/AnalyticsPage';

export const DashboardRoutes: React.FC = () => {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return null;
  }

  const isAgencyUser = userProfile.role === 'agency_owner' || userProfile.role === 'agency_admin';
  const isClient = userProfile.role === 'client';

  return (
    <DashboardLayout>
      <Routes>
        {/* Main Dashboard */}
        <Route path="/" element={
          isClient ? <ClientDashboard /> : <AgencyDashboard />
        } />

        {/* Agency-only routes */}
        {isAgencyUser && (
          <>
            <Route path="/clients" element={<ClientManagement />} />
            <Route path="/clients/:clientId/editor" element={<ClientTaskEditor />} />
            <Route path="/templates" element={<TemplateManagement />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </>
        )}

        {/* Shared routes */}
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/messages" element={<MessagesPage />} />

        {/* Redirect unknown dashboard routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};