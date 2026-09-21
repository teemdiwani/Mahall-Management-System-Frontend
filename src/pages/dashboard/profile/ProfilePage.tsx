import React from 'react';
import { User, Mail, Phone, Shield, Edit } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import { ROLE_LABELS } from '../../../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Profile' }]}
        action={<Button icon={<Edit size={16} />} variant="outline">Edit Profile</Button>}
      />

      <div className="flex flex-col gap-5">
        {/* Profile Card */}
        <Card padding="md">
          <div className="flex items-start gap-6">
            <Avatar name={user.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="emerald"><Shield size={12} />{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'emerald' : 'gray'} dot>{user.status || 'Active'}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Grid */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user.name, icon: <User size={16} className="text-gray-400" /> },
              { label: 'Email', value: user.email, icon: <Mail size={16} className="text-gray-400" /> },
              { label: 'Phone', value: user.phone || 'N/A', icon: <Phone size={16} className="text-gray-400" /> },
              { label: 'Role', value: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role, icon: <Shield size={16} className="text-gray-400" /> },
              { label: 'Member Since', value: new Date(user.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: null },
              { label: 'Last Login', value: new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), icon: null },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">{item.icon}{item.label}</p>
                <p className="text-sm font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Change Password */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Security</h3>
          <Button variant="outline">Change Password</Button>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
