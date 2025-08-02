import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, MoreVertical, Edit, Trash2, Users } from 'lucide-react';
import { User } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useStripe } from '../../hooks/useStripe';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';

export const EmployeeManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { getCurrentPlan } = useStripe();
  const [employees, setEmployees] = useState<User[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // For demo mode, we're on the free plan which only allows 1 employee (the owner)
  const maxEmployees = 1;

  useEffect(() => {
    // Free plan only has the owner
    const mockEmployees: User[] = [
      {
        id: userProfile?.id || '1',
        email: userProfile?.email || 'owner@agency.com',
        full_name: userProfile?.full_name || 'Agency Owner',
        role: 'agency_owner',
        agency_id: userProfile?.agency_id || 'agency1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    setEmployees(mockEmployees);
    setLoading(false);
  }, [userProfile]);

  const handleInviteEmployee = (email: string, role: 'agency_admin') => {
    // In a real app, send invitation email
    console.log('Inviting employee:', email, role);
    setShowInviteForm(false);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'agency_owner':
        return 'success';
      case 'agency_admin':
        return 'info';
      default:
        return 'default';
    }
  };

  const canInviteMore = employees.length < maxEmployees;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your agency team members and their permissions
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {employees.length} of {maxEmployees} employees used
          </p>
        </div>
        {canInviteMore && (
          <Button icon={UserPlus} onClick={() => setShowInviteForm(true)}>
            Invite Team Member
          </Button>
        )}
      </div>

      {!canInviteMore && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Employee limit reached</p>
              <p className="text-sm text-yellow-700">
                Upgrade your plan to add more team members
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
          <InviteEmployeeForm
            onInvite={handleInviteEmployee}
            onCancel={() => setShowInviteForm(false)}
          />
        </Card>
      )}

      {/* Employee List */}
      <Card>
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={employee.avatar_url}
                  alt={employee.full_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">{employee.full_name}</p>
                  <p className="text-sm text-gray-600">{employee.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined {new Date(employee.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant={getRoleColor(employee.role)}>
                  {employee.role === 'agency_owner' ? 'Owner' : 'Admin'}
                </Badge>
                
                {employee.role !== 'agency_owner' && userProfile?.role === 'agency_owner' && (
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    }
                    items={[
                      {
                        icon: Edit,
                        label: 'Edit Role',
                        onClick: () => console.log('Edit role'),
                      },
                      {
                        icon: Trash2,
                        label: 'Remove',
                        onClick: () => handleRemoveEmployee(employee.id),
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

interface InviteEmployeeFormProps {
  onInvite: (email: string, role: 'agency_admin') => void;
  onCancel: () => void;
}

const InviteEmployeeForm: React.FC<InviteEmployeeFormProps> = ({ onInvite, onCancel }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'agency_admin'>('agency_admin');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await onInvite(email, role);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="colleague@agency.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'agency_admin')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="agency_admin">Agency Admin</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Agency Admins can manage clients and templates but cannot manage team members
        </p>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={sending} icon={Mail}>
          Send Invitation
        </Button>
      </div>
    </form>
  );
};