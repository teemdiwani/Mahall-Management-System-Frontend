import React, { useState } from 'react';
import { Search, Plus, Shield, Mail, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import { AccountStatusBadge } from '../../../components/ui/Badge';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Table';
import { usersApi } from '../../../api/domainApis';
import type { UserRole } from '../../../types';
import { ROLE_LABELS } from '../../../types';

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'SECRETARY', label: 'Secretary' },
  { value: 'TREASURER', label: 'Treasurer' },
  { value: 'IMAM', label: 'Imam' },
  { value: 'MADRASA_ADMIN', label: 'Madrasa Admin' },
  { value: 'WELFARE_OFFICER', label: 'Welfare Officer' },
  { value: 'COMMITTEE_MEMBER', label: 'Committee Member' },
  { value: 'FAMILY_HEAD', label: 'Family Head' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'MEMBER', label: 'Member' },
];

const roleColorMap: Record<string, 'emerald' | 'blue' | 'purple' | 'amber' | 'teal' | 'orange' | 'gray' | 'red'> = {
  super_admin: 'red', SUPER_ADMIN: 'red',
  secretary: 'blue', SECRETARY: 'blue',
  treasurer: 'teal', TREASURER: 'teal',
  imam: 'purple', IMAM: 'purple',
  madrasa_admin: 'amber', MADRASA_ADMIN: 'amber',
  welfare_officer: 'orange', WELFARE_OFFICER: 'orange',
  committee_member: 'blue', COMMITTEE_MEMBER: 'blue',
  family_head: 'emerald', FAMILY_HEAD: 'emerald',
  volunteer: 'teal', VOLUNTEER: 'teal',
  member: 'gray', MEMBER: 'gray',
};

const PAGE_SIZE = 8;

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('MEMBER');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.list({ page, limit: PAGE_SIZE, search: search || undefined }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setChangeRoleUser(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => usersApi.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUser(null);
    },
  });

  const responseData = usersData?.data;
  const items: any[] = responseData?.items || [];
  const pagination = responseData?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const activeCount = items.filter(u => u.isActive !== false).length;
  const inactiveCount = items.filter(u => u.isActive === false).length;
  const adminCount = items.filter(u => !['MEMBER', 'VOLUNTEER', 'FAMILY_HEAD'].includes(u.role)).length;

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all registered Mahall accounts and their RBAC roles directly in MongoDB"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Users' }]}
        action={<Button icon={<Plus size={16} />}>Add User</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users in DB', value: pagination.total || items.length, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Active', value: activeCount, color: 'text-blue-600 bg-blue-50' },
          { label: 'Inactive', value: inactiveCount, color: 'text-gray-600 bg-gray-50' },
          { label: 'Administrative Roles', value: adminCount, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <Card padding="none">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none w-64"
            />
          </div>
          <span className="text-sm text-gray-500">{pagination.total || items.length} users</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm">Loading users from MongoDB...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['User', 'Role', 'Status', 'Created At', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(user => {
                  const userId = user._id || user.id;
                  const role = user.role || 'MEMBER';
                  const roleLabel = ROLE_LABELS[role as UserRole] || role;
                  const isActive = user.isActive !== false;

                  return (
                    <tr key={userId} className="bg-white hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} />{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={roleColorMap[role] || 'gray'} size="sm">
                          <Shield size={10} />
                          {roleLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <AccountStatusBadge status={isActive ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedUser(user)} className="text-xs text-blue-600 hover:underline">View</button>
                          <button onClick={() => { setChangeRoleUser(user); setNewRole(role); }} className="text-xs text-emerald-600 hover:underline">Change Role</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total || items.length)} of {pagination.total || items.length}
          </span>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>

      {/* View User Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Profile" size="md">
        {selectedUser && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={selectedUser.name} size="lg" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={roleColorMap[selectedUser.role] || 'gray'}>
                    {ROLE_LABELS[selectedUser.role as UserRole] || selectedUser.role}
                  </Badge>
                  <AccountStatusBadge status={selectedUser.isActive !== false ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Role', value: ROLE_LABELS[selectedUser.role as UserRole] || selectedUser.role },
                { label: 'Joined', value: new Date(selectedUser.createdAt || Date.now()).toLocaleDateString() },
                { label: 'Status', value: selectedUser.isActive !== false ? 'Active' : 'Inactive' },
                { label: 'Account ID', value: selectedUser._id || selectedUser.id },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setChangeRoleUser(selectedUser);
                  setNewRole(selectedUser.role);
                  setSelectedUser(null);
                }}
              >
                Change Role
              </Button>
              <Button
                variant={selectedUser.isActive !== false ? 'danger' : 'success'}
                fullWidth
                onClick={() => {
                  updateStatusMutation.mutate({
                    id: selectedUser._id || selectedUser.id,
                    isActive: selectedUser.isActive === false,
                  });
                }}
              >
                {selectedUser.isActive !== false ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Change Role Modal */}
      <Modal
        isOpen={!!changeRoleUser}
        onClose={() => setChangeRoleUser(null)}
        title="Change User Role"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setChangeRoleUser(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (changeRoleUser) {
                  updateRoleMutation.mutate({
                    id: changeRoleUser._id || changeRoleUser.id,
                    role: newRole,
                  });
                }
              }}
            >
              Save Role
            </Button>
          </>
        }
      >
        {changeRoleUser && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={changeRoleUser.name} size="md" />
              <div>
                <p className="font-semibold text-gray-800">{changeRoleUser.name}</p>
                <p className="text-sm text-gray-500">Current: <strong>{ROLE_LABELS[changeRoleUser.role as UserRole] || changeRoleUser.role}</strong></p>
              </div>
            </div>
            <Select label="New Role" value={newRole} onChange={e => setNewRole(e.target.value)} options={ROLE_OPTIONS} />
            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100">
              ⚠️ Role changes take effect immediately in MongoDB for subsequent authorization requests.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;

