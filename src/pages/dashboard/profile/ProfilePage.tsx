import React from 'react';
import { User, Mail, Phone, Shield, Edit, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import { ROLE_LABELS } from '../../../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account settings"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Profile' }]}
        action={
          <Button icon={<KeyRound size={16} />} variant="outline" onClick={() => navigate('/app/settings')}>
            Account Settings
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        {/* Profile Card */}
        <Card padding="md">
          <div className="flex items-start gap-6">
            <Avatar name={user.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="emerald"><Shield size={12} />{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'emerald' : 'gray'} dot>{user.status || 'Active'}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Grid */}
        <Card padding="md">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user.name, icon: <User size={16} className="text-gray-400" /> },
              { label: 'Email', value: user.email, icon: <Mail size={16} className="text-gray-400" /> },
              { label: 'Phone', value: user.phone || 'N/A', icon: <Phone size={16} className="text-gray-400" /> },
              { label: 'Role', value: ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role, icon: <Shield size={16} className="text-gray-400" /> },
              { label: 'Member Since', value: new Date(user.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: null },
              { label: 'Last Login', value: new Date(user.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), icon: null },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">{item.icon}{item.label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Security & Password */}
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Security & Password</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Change your account password, manage browser push alerts, or switch appearance themes in Settings.
              </p>
            </div>
            <Button variant="outline" icon={<KeyRound size={16} />} onClick={() => navigate('/app/settings')}>
              Change Password in Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
