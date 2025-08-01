import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: string | number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  active,
  badge,
}) => {
  const location = useLocation();
  const isActive = active ?? location.pathname === href;

  return (
    <Link
      to={href}
      className={`
        flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive
          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
          {badge}
        </span>
      )}
    </Link>
  );
};