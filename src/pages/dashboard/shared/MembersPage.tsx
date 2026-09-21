import React, { useState } from 'react';
import {
  Search,
  Plus,
  Loader2,
  Edit2,
  Eye,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Check,
  UserCheck,
  UserX,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Modal from '../../../components/ui/Modal';
import { Pagination } from '../../../components/ui/Table';
import { membersApi, familiesApi } from '../../../api/domainApis';

const PAGE_SIZE = 10;

const RELATIONSHIPS = [
  'HEAD',
  'SPOUSE',
  'SON',
  'DAUGHTER',
  'FATHER',
  'MOTHER',
  'GRANDFATHER',
  'GRANDMOTHER',
  'BROTHER',
  'SISTER',
  'OTHER',
];

const MembersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'DECEASED'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [viewingMember, setViewingMember] = useState<any | null>(null);
  const [deactivatingMember, setDeactivatingMember] = useState<any | null>(null);

  // Messages
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'MALE',
    familyId: '',
    relationship: 'OTHER',
    occupation: '',
    education: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'MALE',
    familyId: '',
    relationship: 'OTHER',
    occupation: '',
    education: '',
    membershipStatus: 'ACTIVE',
  });

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['members', page, search, statusFilter, genderFilter],
    queryFn: () =>
      membersApi.list({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        membershipStatus: statusFilter === 'ALL' ? undefined : statusFilter,
        gender: genderFilter === 'ALL' ? undefined : genderFilter,
      }),
  });

  // Fetch families list for dropdowns
  const { data: familiesData } = useQuery({
    queryKey: ['families-lookup'],
    queryFn: () => familiesApi.list({ limit: 100 }),
  });

  const familiesList: any[] = familiesData?.data?.items || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => membersApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsAddModalOpen(false);
      setSuccessMsg(`Member "${res?.data?.name || addForm.name}" registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      resetAddForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to register member');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => membersApi.update(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setEditingMember(null);
      setSuccessMsg(`Member "${res?.data?.name || editForm.name}" updated successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update member');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDeactivatingMember(null);
      setSuccessMsg('Member status updated successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update status');
    },
  });

  const resetAddForm = () => {
    setAddForm({
      name: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      gender: 'MALE',
      familyId: '',
      relationship: 'OTHER',
      occupation: '',
      education: '',
    });
    setFormError(null);
  };

  const openEditModal = (member: any) => {
    setFormError(null);
    setEditingMember(member);
    setEditForm({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '',
      gender: member.gender || 'MALE',
      familyId: member.familyId?._id || member.familyId || '',
      relationship: member.relationship || 'OTHER',
      occupation: member.occupation || '',
      education: member.education || '',
      membershipStatus: member.membershipStatus || 'ACTIVE',
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!addForm.name.trim()) {
      setFormError('Member Name is required');
      return;
    }
    if (!addForm.phone.trim() || addForm.phone.trim().length < 10) {
      setFormError('Contact Phone Number is required (min 10 digits)');
      return;
    }
    if (!addForm.dateOfBirth) {
      setFormError('Date of Birth is required');
      return;
    }

    createMutation.mutate({
      name: addForm.name.trim(),
      phone: addForm.phone.trim(),
      email: addForm.email.trim() || undefined,
      dateOfBirth: addForm.dateOfBirth,
      gender: addForm.gender,
      familyId: addForm.familyId || undefined,
      relationship: addForm.relationship,
      occupation: addForm.occupation.trim() || undefined,
      education: addForm.education.trim() || undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setFormError(null);

    if (!editForm.name.trim()) {
      setFormError('Member Name is required');
      return;
    }
    if (!editForm.phone.trim() || editForm.phone.trim().length < 10) {
      setFormError('Contact Phone Number is required (min 10 digits)');
      return;
    }

    updateMutation.mutate({
      id: editingMember._id || editingMember.id,
      payload: {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined,
        gender: editForm.gender,
        familyId: editForm.familyId || undefined,
        relationship: editForm.relationship,
        occupation: editForm.occupation.trim() || undefined,
        education: editForm.education.trim() || undefined,
        membershipStatus: editForm.membershipStatus,
      },
    });
  };

  const responseData = data?.data;
  const items: any[] = responseData?.items || [];
  const pagination = responseData?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

  return (
    <div>
      <PageHeader
        title="Members Census"
        subtitle="Manage and edit all registered Mahall members in MongoDB database"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Members' }]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/app/applications">
              <Button variant="secondary" icon={<FileText size={16} />}>
                Mahall Requests
              </Button>
            </Link>
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                resetAddForm();
                setIsAddModalOpen(true);
              }}
            >
              Add Member
            </Button>
          </div>
        }
      />

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, code or email..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-sm"
            />
          </div>

          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 outline-none shadow-sm focus:border-emerald-500"
          >
            <option value="ALL">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs text-gray-400 font-medium">Status:</span>
          {(['ALL', 'ACTIVE', 'INACTIVE', 'DECEASED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Loading members from database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No members found matching your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['Member & Code', 'Family Household', 'Relationship', 'Gender', 'Contact Phone', 'Occupation', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((u: any) => (
                  <tr key={u._id || u.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                    {/* Member & Code */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{u.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                            {u.memberCode || 'Census ID'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Family Household */}
                    <td className="px-4 py-3 text-gray-700">
                      {u.familyId ? (
                        <div>
                          <p className="font-medium text-gray-900">{u.familyId.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{u.familyId.familyCode}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Relationship */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.relationship === 'HEAD' ? 'emerald' : 'gray'}
                        size="sm"
                      >
                        {u.relationship || 'MEMBER'}
                      </Badge>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3">
                      <Badge variant={u.gender === 'MALE' ? 'blue' : 'purple'} size="sm">
                        {u.gender}
                      </Badge>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                      {u.phone ? (
                        <span className="flex items-center gap-1 font-semibold text-gray-800">
                          <Phone size={12} className="text-emerald-600" />
                          {u.phone}
                        </span>
                      ) : (
                        <span className="text-red-400 italic">Missing</span>
                      )}
                    </td>

                    {/* Occupation */}
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {u.occupation || '—'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          u.membershipStatus === 'ACTIVE'
                            ? 'emerald'
                            : u.membershipStatus === 'DECEASED'
                            ? 'red'
                            : 'amber'
                        }
                        size="sm"
                        dot
                      >
                        {u.membershipStatus || 'ACTIVE'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1">
                        <button
                          title="View Details"
                          onClick={() => setViewingMember(u)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit Member"
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title={u.membershipStatus === 'ACTIVE' ? 'Deactivate Member' : 'Activate Member'}
                          onClick={() => setDeactivatingMember(u)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {u.membershipStatus === 'ACTIVE' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-100 gap-3">
          <span className="text-xs text-gray-400">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, pagination.total)}–
            {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} registered members
          </span>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>

      {/* ── Edit Member Modal ── */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => {
          if (!updateMutation.isPending) setEditingMember(null);
        }}
        title={editingMember ? `Edit Member: ${editingMember.name}` : 'Edit Member'}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Contact Phone (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="e.g. +91 9847111050"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="e.g. member@mahallconnect.org"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Family Assignment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Household / Family
              </label>
              <select
                value={editForm.familyId}
                onChange={(e) => setEditForm({ ...editForm, familyId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">-- No Family (Unassigned) --</option>
                {familiesList.map((f: any) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.familyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship in Family
              </label>
              <select
                value={editForm.relationship}
                onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Membership Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Membership Status
              </label>
              <select
                value={editForm.membershipStatus}
                onChange={(e) => setEditForm({ ...editForm, membershipStatus: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="DECEASED">DECEASED</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={editForm.occupation}
                onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                placeholder="e.g. Civil Engineer, Teacher"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Education</label>
              <input
                type="text"
                value={editForm.education}
                onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                placeholder="e.g. B.Tech, M.Com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingMember(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updateMutation.isPending}
              icon={<Check size={16} />}
            >
              Save Member Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Add Member Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!createMutation.isPending) setIsAddModalOpen(false);
        }}
        title="Register New Census Member"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Khalid Al-Mansoor"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Phone (Required) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                placeholder="e.g. +91 9847111050"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="e.g. khalid@mahallconnect.org"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={addForm.dateOfBirth}
                onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={addForm.gender}
                onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Family Household */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Household / Family
              </label>
              <select
                value={addForm.familyId}
                onChange={(e) => setAddForm({ ...addForm, familyId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">-- No Family (Unassigned) --</option>
                {familiesList.map((f: any) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.familyCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship in Family
              </label>
              <select
                value={addForm.relationship}
                onChange={(e) => setAddForm({ ...addForm, relationship: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={addForm.occupation}
                onChange={(e) => setAddForm({ ...addForm, occupation: e.target.value })}
                placeholder="e.g. Civil Engineer, Student"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>

            {/* Education */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Education</label>
              <input
                type="text"
                value={addForm.education}
                onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                placeholder="e.g. High School, B.Com, MBBS"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
              icon={<Plus size={16} />}
            >
              Register Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View Member Modal ── */}
      <Modal
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        title="Member Profile"
        size="md"
      >
        {viewingMember && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <Avatar name={viewingMember.name} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{viewingMember.name}</h3>
                  <Badge variant={viewingMember.membershipStatus === 'ACTIVE' ? 'emerald' : 'gray'}>
                    {viewingMember.membershipStatus}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-emerald-800 font-bold mt-0.5">
                  {viewingMember.memberCode || 'Census ID'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {viewingMember.familyId?.name || 'Unassigned Family'} · {viewingMember.relationship}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 mb-0.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-600" /> Phone Number
                </p>
                <p className="font-semibold text-gray-800 font-mono">{viewingMember.phone || '—'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 mb-0.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-blue-600" /> Email Address
                </p>
                <p className="font-semibold text-gray-800">{viewingMember.email || '—'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 mb-0.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-purple-600" /> Date of Birth
                </p>
                <p className="font-semibold text-gray-800">
                  {viewingMember.dateOfBirth
                    ? new Date(viewingMember.dateOfBirth).toLocaleDateString()
                    : '—'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 mb-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="text-amber-600" /> Occupation
                </p>
                <p className="font-semibold text-gray-800">{viewingMember.occupation || '—'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                <p className="text-gray-400 mb-0.5 flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-teal-600" /> Education
                </p>
                <p className="font-semibold text-gray-800">{viewingMember.education || '—'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const m = viewingMember;
                  setViewingMember(null);
                  openEditModal(m);
                }}
                icon={<Edit2 size={14} />}
              >
                Edit Member
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewingMember(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Deactivate / Status Confirmation Modal ── */}
      <Modal
        isOpen={!!deactivatingMember}
        onClose={() => setDeactivatingMember(null)}
        title="Update Member Status"
        size="md"
      >
        {deactivatingMember && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to change status for{' '}
              <span className="font-bold text-gray-900">{deactivatingMember.name}</span>?
            </p>
            <p className="text-xs text-gray-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
              Deactivating keeps historical census, madrasa, and marriage records intact while marking the individual
              inactive.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeactivatingMember(null)}
                disabled={deactivateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={deactivatingMember.membershipStatus === 'ACTIVE' ? 'danger' : 'primary'}
                loading={deactivateMutation.isPending}
                icon={deactivatingMember.membershipStatus === 'ACTIVE' ? <UserX size={15} /> : <UserCheck size={15} />}
                onClick={() => {
                  deactivateMutation.mutate(deactivatingMember._id || deactivatingMember.id);
                }}
              >
                {deactivatingMember.membershipStatus === 'ACTIVE' ? 'Deactivate Member' : 'Reactivate Member'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MembersPage;
