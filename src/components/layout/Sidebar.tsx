import React from 'react';
import { LayoutDashboard, Users, CheckSquare, BookTemplate as FileTemplate, MessageSquare, Settings, BarChart3, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SidebarItem } from './SidebarItem';

export const Sidebar: React.FC = () => {
  const { userProfile } = useAuth();
  const isAgencyUser = userProfile?.role === 'agency_owner' || userProfile?.role === 'agency_admin';

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Portplank</h1>
            <p className="text-xs text-gray-500">Agency Portal</p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
        />

        {isAgencyUser && (
          <>
            <SidebarItem
              icon={Users}
              label="Clients"
              href="/dashboard/clients"
            />
            <SidebarItem
              icon={FileTemplate}
              label="Templates"
              href="/dashboard/templates"
            />
            <SidebarItem
              icon={BarChart3}
              label="Analytics"
              href="/dashboard/analytics"
            />
          </>
        )}

        <SidebarItem
          icon={CheckSquare}
          label="Tasks"
          href="/dashboard/tasks"
        />

        <SidebarItem
          icon={MessageSquare}
          label="Messages"
          href="/dashboard/messages"
        />

        {isAgencyUser && (
          <SidebarItem
            icon={Settings}
            label="Settings"
            href="/dashboard/settings"
          />
        )}
      </nav>
    </div>
  );
};