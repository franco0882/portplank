import React, { useState } from 'react';
import { Bell, Search, Settings, User, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStripe } from '../../hooks/useStripe';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const { getCurrentPlan, isActiveSubscription } = useStripe();
  const [showNotifications, setShowNotifications] = useState(false);

  const currentPlan = getCurrentPlan();
  const hasActiveSubscription = isActiveSubscription();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients, tasks, or templates..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>
          </div>

          <Dropdown
            trigger={
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar
                  src={userProfile?.avatar_url}
                  alt={userProfile?.full_name || 'User'}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <div className="font-medium text-sm">
                    {currentPlan.name.replace('PlankPort - ', '').replace(' (Monthly)', '').replace(' (Yearly)', '')}
                  </div>
                  {currentPlan && (
                    <div className="text-xs text-gray-500">
                      {currentPlan.name.replace('Portplank - ', '').replace(' (Monthly)', '').replace(' (Yearly)', '')}
                    </div>
                  )}
                </div>
              </Button>
            }
            items={[
              {
                icon: User,
                label: 'Profile',
                onClick: () => console.log('Profile clicked'),
              },
              {
                icon: Settings,
                label: 'Settings',
                onClick: () => console.log('Settings clicked'),
              },
              ...(currentPlan ? [{
                icon: CreditCard,
                label: 'Subscription',
                onClick: () => console.log('Subscription clicked'),
              }] : []),
              { type: 'separator' },
              {
                icon: LogOut,
                label: 'Sign Out',
                onClick: handleSignOut,
              },
            ]}
          />

          {/* Subscription Status Indicator */}
          {currentPlan && (
            <div className="hidden lg:flex items-center space-x-2 ml-4">
              <Badge variant={hasActiveSubscription ? 'success' : 'warning'} size="sm">
                {currentPlan.name.includes('Agency') ? 'Agency' : 'Startup'} Plan
              </Badge>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};