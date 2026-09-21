import React, { useState } from 'react';
import {
  Plus,
  Search,
  Home,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  UserMinus,
  Edit2,
  Archive,
  Clock,
  Check,
  X,
  UserCheck,
  Building2,
  Eye,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { Pagination } from '../../../components/ui/Table';
import { familiesApi, membersApi, familyRequestsApi } from '../../../api/domainApis';

const PAGE_SIZE = 9;

const WARDS = [
  'All Wards',
  'North Ward',
  'South Ward',
  'East Ward',
  'West Ward',
  'Bilal Nagar',
  'Central Ward',
  'Hill View',
];

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

const FamiliesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState<'families' | 'requests'>('families');

  // Families Filters
  const [search, setSearch] = useState('');
  const [selectedWard, setSelectedWard] = useState('All Wards');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [page, setPage] = useState(1);

  // Selected Family for Details View
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [removingMember, setRemovingMember] = useState<any | null>(null);
  const [archivingFamily, setArchivingFamily] = useState<any | null>(null);

  // Request review state
  const [reviewingRequest, setReviewingRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [requestActionType, setRequestActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

  // Feedback Messages
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Family Form State
  const [headMode, setHeadMode] = useState<'existing' | 'new'>('new');
  const [headSearchQuery, setHeadSearchQuery] = useState('');
  const [selectedHeadMember, setSelectedHeadMember] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    familyCode: '',
    area: 'North Ward',
    phone: '',
    email: '',
    address: '',
    headName: '',
    headOccupation: '',
    headDob: '',
    headGender: 'MALE',
    headPhone: '',
  });

  // Add Member Form State
  const [addMemberMode, setAddMemberMode] = useState<'existing' | 'new'>('new');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedNewMember, setSelectedNewMember] = useState<any | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    relationship: 'SON',
    phone: '',
    occupation: '',
    education: '',
    relatedToMemberId: '',
  });

  // Edit Relationship Form State
  const [editRelData, setEditRelData] = useState({
    relationship: 'OTHER',
    relatedToMemberId: '',
    isFamilyHead: false,
  });

  // ── Queries ──
  const { data: familiesData, isLoading: isFamiliesLoading } = useQuery({
    queryKey: ['families', page, search, selectedWard, statusFilter],
    queryFn: () =>
      familiesApi.list({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        area: selectedWard === 'All Wards' ? undefined : selectedWard,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  });

  const { data: familyDetailData, isLoading: isDetailLoading, refetch: refetchFamilyDetail } = useQuery({
    queryKey: ['family-detail', selectedFamilyId],
    queryFn: () => (selectedFamilyId ? familiesApi.getById(selectedFamilyId) : null),
    enabled: !!selectedFamilyId,
  });

  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['family-requests'],
    queryFn: () => familyRequestsApi.list({ limit: 50 }),
  });

  // Live member search query for existing head
  const { data: headSearchResults, isLoading: isHeadSearching } = useQuery({
    queryKey: ['members-search-head', headSearchQuery],
    queryFn: () => membersApi.search(headSearchQuery),
    enabled: headSearchQuery.trim().length >= 2,
  });

  // Live member search query for adding member
  const { data: memberSearchResults, isLoading: isMemberSearching } = useQuery({
    queryKey: ['members-search-member', memberSearchQuery],
    queryFn: () => membersApi.search(memberSearchQuery),
    enabled: memberSearchQuery.trim().length >= 2,
  });

  // ── Mutations ──
  const createFamilyMutation = useMutation({
    mutationFn: (payload: any) => familiesApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setIsAddModalOpen(false);
      setSuccessMsg(`Family "${res?.data?.name || formData.name}" registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      resetFamilyForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to register family');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ familyId, payload }: { familyId: string; payload: any }) =>
      familiesApi.addMember(familyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      refetchFamilyDetail();
      setIsAddMemberModalOpen(false);
      setSuccessMsg('Member added to family successfully!');
      setTimeout(() => setSuccessMsg(null), 5000);
      resetAddMemberForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to add member');
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({
      familyId,
      memberId,
      payload,
    }: {
      familyId: string;
      memberId: string;
      payload: any;
    }) => familiesApi.updateMember(familyId, memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      refetchFamilyDetail();
      setEditingMember(null);
      setSuccessMsg('Member relationship updated successfully!');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ familyId, memberId }: { familyId: string; memberId: string }) =>
      familiesApi.removeMember(familyId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      refetchFamilyDetail();
      setRemovingMember(null);
      setSuccessMsg('Member removed from family.');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to remove member');
    },
  });

  const archiveFamilyMutation = useMutation({
    mutationFn: ({ familyId, force }: { familyId: string; force?: boolean }) =>
      familiesApi.archive(familyId, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setArchivingFamily(null);
      setSelectedFamilyId(null);
      setSuccessMsg('Family archived successfully.');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to archive family');
    },
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      familyRequestsApi.approve(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-requests'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setReviewingRequest(null);
      setRequestActionType(null);
      setApprovalComment('');
      setSuccessMsg('Change request approved and MongoDB records updated!');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to approve request');
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      familyRequestsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-requests'] });
      setReviewingRequest(null);
      setRequestActionType(null);
      setRejectionReason('');
      setSuccessMsg('Change request rejected.');
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to reject request');
    },
  });

  // ── Helper Resetters ──
  const resetFamilyForm = () => {
    setFormData({
      name: '',
      familyCode: '',
      area: 'North Ward',
      phone: '',
      email: '',
      address: '',
      headName: '',
      headOccupation: '',
      headDob: '',
      headGender: 'MALE',
      headPhone: '',
    });
    setSelectedHeadMember(null);
    setHeadSearchQuery('');
    setHeadMode('new');
    setFormError(null);
  };

  const resetAddMemberForm = () => {
    setMemberFormData({
      name: '',
      gender: 'MALE',
      dateOfBirth: '',
      relationship: 'SON',
      phone: '',
      occupation: '',
      education: '',
      relatedToMemberId: '',
    });
    setSelectedNewMember(null);
    setMemberSearchQuery('');
    setAddMemberMode('new');
    setFormError(null);
  };

  // ── Submit Handlers ──
  const handleSubmitFamily = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Family Name is required (e.g. Al-Hashimi Family)');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Contact Phone is required');
      return;
    }
    if (!formData.address.trim()) {
      setFormError('Address / House details are required');
      return;
    }

    const payload: any = {
      name: formData.name.trim(),
      area: formData.area,
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim(),
    };

    if (formData.familyCode.trim()) {
      payload.familyCode = formData.familyCode.trim().toUpperCase();
    }

    if (headMode === 'existing' && selectedHeadMember) {
      payload.headMemberId = selectedHeadMember._id;
    } else if (headMode === 'new' && formData.headName.trim()) {
      payload.headName = formData.headName.trim();
      payload.headOccupation = formData.headOccupation.trim() || undefined;
      payload.headDob = formData.headDob || undefined;
      payload.headGender = formData.headGender;
      payload.headPhone = formData.headPhone.trim() || formData.phone.trim();
    }

    createFamilyMutation.mutate(payload);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamilyId) return;
    setFormError(null);

    if (addMemberMode === 'existing') {
      if (!selectedNewMember) {
        setFormError('Please search and select an existing member');
        return;
      }
      addMemberMutation.mutate({
        familyId: selectedFamilyId,
        payload: {
          memberId: selectedNewMember._id,
          relationship: memberFormData.relationship,
          relatedToMemberId: memberFormData.relatedToMemberId || undefined,
        },
      });
    } else {
      if (!memberFormData.name.trim()) {
        setFormError('Member Name is required');
        return;
      }
      addMemberMutation.mutate({
        familyId: selectedFamilyId,
        payload: {
          name: memberFormData.name.trim(),
          gender: memberFormData.gender,
          dateOfBirth: memberFormData.dateOfBirth || undefined,
          phone: memberFormData.phone.trim() || undefined,
          occupation: memberFormData.occupation.trim() || undefined,
          education: memberFormData.education.trim() || undefined,
          relationship: memberFormData.relationship,
          relatedToMemberId: memberFormData.relatedToMemberId || undefined,
        },
      });
    }
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamilyId || !editingMember) return;
    setFormError(null);

    updateMemberMutation.mutate({
      familyId: selectedFamilyId,
      memberId: editingMember.member?._id || editingMember.memberId,
      payload: {
        relationship: editRelData.relationship,
        relatedToMemberId: editRelData.relatedToMemberId || undefined,
        isFamilyHead: editRelData.isFamilyHead,
      },
    });
  };

  // Data processing
  const responseData = familiesData?.data;
  const families: any[] = responseData?.items || [];
  const pagination = responseData?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 };

  const requests: any[] = requestsData?.data?.items || requestsData?.data || [];
  const pendingRequestsCount = requests.filter((r: any) => r.status === 'PENDING').length;

  const currentFamilyDetail = familyDetailData?.data?.family;
  const currentFamilyMembers: any[] = familyDetailData?.data?.members || [];

  return (
    <div>
      <PageHeader
        title="Family & Member Management"
        subtitle="Manage households, family relationships, census records, and approve change requests"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Families' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                resetFamilyForm();
                setIsAddModalOpen(true);
              }}
            >
              Add Family
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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('families')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'families'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 size={16} />
          Registered Families
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} />
          Change Requests
          {pendingRequestsCount > 0 ? (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold animate-pulse">
              {pendingRequestsCount} Pending
            </span>
          ) : (
            <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'families' ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Active Families</p>
                  <p className="text-2xl font-bold mt-0.5">{pagination.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center">
                  <Home size={20} className="text-emerald-700" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-100 text-blue-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Census Coverage</p>
                  <p className="text-2xl font-bold mt-0.5">100%</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center">
                  <Users size={20} className="text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-100 text-amber-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending Requests</p>
                  <p className="text-2xl font-bold mt-0.5">{pendingRequestsCount}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100/80 flex items-center justify-center">
                  <Clock size={20} className="text-amber-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search family name, code, phone..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-sm"
                />
              </div>

              <select
                value={selectedWard}
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none text-gray-700 shadow-sm"
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((st) => (
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

          {/* Families Grid */}
          {isFamiliesLoading ? (
            <div className="flex items-center justify-center p-20 text-gray-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Loading families from MongoDB...</span>
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Home size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No families found</p>
              <p className="text-xs text-gray-400 mt-1">Try changing your search term or ward filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {families.map((family: any) => (
                <Card
                  key={family._id || family.id}
                  hover
                  padding="md"
                  className="cursor-pointer transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
                  onClick={() => setSelectedFamilyId(family._id || family.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Home size={20} className="text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{family.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{family.familyCode}</p>
                      </div>
                    </div>
                    <Badge
                      variant={family.status === 'ACTIVE' ? 'emerald' : family.status === 'ARCHIVED' ? 'red' : 'gray'}
                      size="sm"
                      dot
                    >
                      {family.status || 'ACTIVE'}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-gray-600 mb-3 bg-gray-50/70 p-2.5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Head of Family:</span>
                      <span className="font-semibold text-gray-800">
                        {family.familyHead?.name || 'Assigned in Census'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Ward / Area:</span>
                      <span className="font-medium text-gray-700">{family.area || family.ward || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-mono text-gray-700">{family.phone || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <Eye size={13} /> View Family Profile & Members
                    </span>
                    <span className="text-xs font-bold text-gray-700">₹{family.monthlyContribution || 250}/mo</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <span className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, pagination.total)}–
              {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} families
            </span>
            <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          </div>
        </>
      ) : (
        /* Family Change Requests Tab */
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Family Change Requests</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review formal modifications submitted by Family Heads requiring Mahall committee verification
              </p>
            </div>
          </div>

          {isRequestsLoading ? (
            <div className="flex items-center justify-center p-16 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-sm">Loading change requests...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FileText size={36} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No Change Requests</p>
              <p className="text-xs text-gray-400 mt-1">There are currently no change requests from Family Heads.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req: any) => (
                <div
                  key={req._id || req.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 shadow-sm transition-all"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FileText size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {req.requestCode}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {req.familyId?.name || 'Family'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            ({req.familyId?.familyCode})
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Submitted by <span className="font-semibold">{req.requestedBy?.name}</span> on{' '}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 uppercase">
                        {req.requestType?.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'emerald'
                            : req.status === 'REJECTED'
                            ? 'red'
                            : 'amber'
                        }
                        dot
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Request Details / Diff */}
                  <div className="py-3 text-xs text-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Reason / Notes:</p>
                        <p className="text-gray-600 italic">"{req.reason || 'No description provided'}"</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 mb-1">Proposed Data:</p>
                        {req.proposedData ? (
                          <div className="space-y-0.5">
                            {Object.entries(req.proposedData).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-gray-500 capitalize">{key}:</span>
                                <span className="font-semibold text-gray-900">{String(val)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Standard action</span>
                        )}
                      </div>
                    </div>

                    {req.reviewNotes && (
                      <div className="mt-2 text-xs p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <span className="font-semibold">Reviewer Notes: </span>
                        {req.reviewNotes}
                      </div>
                    )}
                  </div>

                  {/* Actions for Secretary / Super Admin */}
                  {req.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<X size={14} className="text-red-500" />}
                        onClick={() => {
                          setReviewingRequest(req);
                          setRequestActionType('REJECT');
                          setRejectionReason('');
                          setFormError(null);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Check size={14} />}
                        onClick={() => {
                          setReviewingRequest(req);
                          setRequestActionType('APPROVE');
                          setApprovalComment('');
                          setFormError(null);
                        }}
                      >
                        Approve & Apply
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Family Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!createFamilyMutation.isPending) setIsAddModalOpen(false);
        }}
        title="Register New Mahall Family"
        size="lg"
      >
        <form onSubmit={handleSubmitFamily} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Family Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Al-Hashimi Family"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Family Code <span className="text-gray-400 font-normal">(Auto if empty)</span>
              </label>
              <input
                type="text"
                name="familyCode"
                value={formData.familyCode}
                onChange={(e) => setFormData({ ...formData, familyCode: e.target.value })}
                placeholder="e.g. MHL-FAM-001019"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mahall Ward / Area <span className="text-red-500">*</span>
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {WARDS.filter((w) => w !== 'All Wards').map((ward) => (
                  <option key={ward} value={ward}>
                    {ward}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 9847111050"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Residential Address / House Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Baitul Aman, 3rd Cross Road, Near Central Mosque"
              rows={2}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Family Head Section */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Family Head (Required for household)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeadMode('new')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    headMode === 'new'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Create New Member
                </button>
                <button
                  type="button"
                  onClick={() => setHeadMode('existing')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    headMode === 'existing'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Select Existing Member
                </button>
              </div>
            </div>

            {headMode === 'existing' ? (
              <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="block text-xs font-medium text-gray-700">
                  Search Mahall Census (by Name, Code, or Phone):
                </label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={headSearchQuery}
                    onChange={(e) => setHeadSearchQuery(e.target.value)}
                    placeholder="Type at least 2 characters..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:border-emerald-500 outline-none"
                  />
                  {isHeadSearching && (
                    <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" />
                  )}
                </div>

                {selectedHeadMember && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-900">{selectedHeadMember.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {selectedHeadMember.memberCode} · {selectedHeadMember.phone || 'No phone'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSelectedHeadMember(null)}>
                      Change
                    </Button>
                  </div>
                )}

                {!selectedHeadMember && headSearchResults?.data?.items && headSearchResults.data.items.length > 0 && (
                  <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg shadow-sm">
                    {headSearchResults.data.items.map((m: any) => (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedHeadMember(m);
                          setHeadSearchQuery('');
                        }}
                        className="p-2 text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-gray-800">{m.name}</span>
                          <span className="text-gray-400 font-mono ml-2">({m.memberCode})</span>
                          {m.familyId && (
                            <span className="ml-2 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              Current: {m.familyId.name}
                            </span>
                          )}
                        </div>
                        <span className="text-emerald-700 font-medium">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Head Full Name *</label>
                  <input
                    type="text"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    placeholder="e.g. Sulaiman Hashim"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Gender</label>
                  <select
                    value={formData.headGender}
                    onChange={(e) => setFormData({ ...formData, headGender: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.headOccupation}
                    onChange={(e) => setFormData({ ...formData, headOccupation: e.target.value })}
                    placeholder="e.g. Civil Engineer"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={createFamilyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createFamilyMutation.isPending}
              icon={<Plus size={16} />}
            >
              Register Family
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Family Details Modal with Live Members ── */}
      <Modal
        isOpen={!!selectedFamilyId}
        onClose={() => {
          setSelectedFamilyId(null);
          setFormError(null);
        }}
        title="Family Profile & Household Members"
        size="xl"
      >
        {isDetailLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm">Fetching family data and relationships from MongoDB...</span>
          </div>
        ) : currentFamilyDetail ? (
          <div className="space-y-6">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Header info card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                  <Home size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{currentFamilyDetail.name}</h3>
                    <Badge variant={currentFamilyDetail.status === 'ACTIVE' ? 'emerald' : 'red'}>
                      {currentFamilyDetail.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Code: <span className="font-mono font-bold text-gray-700">{currentFamilyDetail.familyCode}</span> ·{' '}
                    Ward: <span className="font-semibold text-gray-700">{currentFamilyDetail.area}</span> · Address:{' '}
                    <span className="text-gray-700">{currentFamilyDetail.address}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Archive size={14} className="text-red-500" />}
                  onClick={() => setArchivingFamily(currentFamilyDetail)}
                >
                  Archive Family
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<UserPlus size={14} />}
                  onClick={() => {
                    resetAddMemberForm();
                    setIsAddMemberModalOpen(true);
                  }}
                >
                  Add Member
                </Button>
              </div>
            </div>

            {/* Members in Family */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Users size={16} className="text-emerald-700" />
                  All Members in this Household ({currentFamilyMembers.length})
                </h4>
                <span className="text-xs text-gray-400">Records managed in MongoDB</span>
              </div>

              {currentFamilyMembers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Users size={28} className="text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 font-medium">No members currently linked to this family.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    icon={<UserPlus size={13} />}
                    onClick={() => {
                      resetAddMemberForm();
                      setIsAddMemberModalOpen(true);
                    }}
                  >
                    Add First Member
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentFamilyMembers.map((fm: any) => {
                    const member = fm.member || fm;
                    const relationship = fm.relationship || member.relationship || 'OTHER';
                    const isHead = fm.isFamilyHead || relationship === 'HEAD';

                    return (
                      <div
                        key={fm._id || member._id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isHead
                            ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{member.name}</p>
                                {isHead && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                                    HEAD
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {member.memberCode || 'Census ID'}
                              </p>
                              <span className="inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded bg-gray-100 text-gray-700 capitalize">
                                {relationship.toLowerCase()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              title="Edit relationship"
                              onClick={() => {
                                setEditingMember(fm);
                                setEditRelData({
                                  relationship,
                                  relatedToMemberId: fm.relatedToMemberId || '',
                                  isFamilyHead: isHead,
                                });
                              }}
                              className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              title="Remove from family"
                              onClick={() => setRemovingMember(fm)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-600">
                          <div>
                            <span className="text-gray-400">Phone: </span>
                            <span className="font-mono font-medium">{member.phone || '—'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Occupation: </span>
                            <span className="font-medium">{member.occupation || '—'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ── Add Member to Family Modal ── */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          if (!addMemberMutation.isPending) setIsAddMemberModalOpen(false);
        }}
        title="Add Member to Household"
        size="lg"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700">Member Source:</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAddMemberMode('new')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  addMemberMode === 'new'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Register New Individual
              </button>
              <button
                type="button"
                onClick={() => setAddMemberMode('existing')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  addMemberMode === 'existing'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Select Existing from Census
              </button>
            </div>
          </div>

          {addMemberMode === 'existing' ? (
            <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <label className="block text-xs font-medium text-gray-700">Search Member:</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Search by name, member code, phone..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:border-emerald-500 outline-none"
                />
                {isMemberSearching && (
                  <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" />
                )}
              </div>

              {selectedNewMember && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{selectedNewMember.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{selectedNewMember.memberCode}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedNewMember(null)}>
                    Change
                  </Button>
                </div>
              )}

              {!selectedNewMember && memberSearchResults?.data?.items && memberSearchResults.data.items.length > 0 && (
                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg shadow-sm">
                  {memberSearchResults.data.items.map((m: any) => (
                    <div
                      key={m._id}
                      onClick={() => {
                        setSelectedNewMember(m);
                        setMemberSearchQuery('');
                      }}
                      className="p-2 text-xs flex items-center justify-between hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-gray-800">{m.name}</span>
                        <span className="text-gray-400 font-mono ml-2">({m.memberCode})</span>
                      </div>
                      <span className="text-emerald-700 font-medium">Select</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="e.g. Maryam Al-Hashimi"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                <select
                  value={memberFormData.gender}
                  onChange={(e) => setMemberFormData({ ...memberFormData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={memberFormData.dateOfBirth}
                  onChange={(e) => setMemberFormData({ ...memberFormData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={memberFormData.phone}
                  onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                  placeholder="e.g. +91 9847111051"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={memberFormData.occupation}
                  onChange={(e) => setMemberFormData({ ...memberFormData, occupation: e.target.value })}
                  placeholder="e.g. Teacher, Student, Engineer"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  value={memberFormData.education}
                  onChange={(e) => setMemberFormData({ ...memberFormData, education: e.target.value })}
                  placeholder="e.g. B.Com, High School"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Relationship Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship in Family *
              </label>
              <select
                value={memberFormData.relationship}
                onChange={(e) => setMemberFormData({ ...memberFormData, relationship: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Related Directly To (Optional)
              </label>
              <select
                value={memberFormData.relatedToMemberId}
                onChange={(e) => setMemberFormData({ ...memberFormData, relatedToMemberId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">Family Head / General</option>
                {currentFamilyMembers.map((fm: any) => {
                  const m = fm.member || fm;
                  return (
                    <option key={m._id} value={m._id}>
                      {m.name} ({fm.relationship || 'Member'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={addMemberMutation.isPending}
              icon={<UserPlus size={16} />}
            >
              Add Member to Family
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Relationship Modal ── */}
      <Modal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        title="Edit Family Relationship"
        size="md"
      >
        {editingMember && (
          <form onSubmit={handleUpdateMemberSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-400">Member</p>
              <p className="text-sm font-bold text-gray-900">
                {editingMember.member?.name || editingMember.name}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                {editingMember.member?.memberCode || editingMember.memberCode}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Relationship in Household
              </label>
              <select
                value={editRelData.relationship}
                onChange={(e) => setEditRelData({ ...editRelData, relationship: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Directly Related To
              </label>
              <select
                value={editRelData.relatedToMemberId}
                onChange={(e) => setEditRelData({ ...editRelData, relatedToMemberId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">General Household</option>
                {currentFamilyMembers
                  .filter((fm: any) => (fm.member?._id || fm._id) !== (editingMember.member?._id || editingMember._id))
                  .map((fm: any) => {
                    const m = fm.member || fm;
                    return (
                      <option key={m._id} value={m._id}>
                        {m.name} ({fm.relationship || 'Member'})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFamilyHeadCheck"
                checked={editRelData.isFamilyHead}
                onChange={(e) => setEditRelData({ ...editRelData, isFamilyHead: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <label htmlFor="isFamilyHeadCheck" className="text-xs font-medium text-gray-700">
                Designate as Primary Family Head
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={updateMemberMutation.isPending}
                icon={<Check size={16} />}
              >
                Save Relationship
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Remove Member Confirmation Modal ── */}
      <Modal
        isOpen={!!removingMember}
        onClose={() => setRemovingMember(null)}
        title="Remove Member from Household"
        size="md"
      >
        {removingMember && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to remove{' '}
              <span className="font-bold text-gray-900">
                {removingMember.member?.name || removingMember.name}
              </span>{' '}
              from this household?
            </p>
            <p className="text-xs text-gray-500 bg-amber-50 p-3 rounded-xl border border-amber-200">
              Notice: The individual's record remains preserved in the Mahall census, but their family link will be
              set to unassigned.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRemovingMember(null)}
                disabled={removeMemberMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={removeMemberMutation.isPending}
                icon={<UserMinus size={16} />}
                onClick={() => {
                  if (selectedFamilyId) {
                    removeMemberMutation.mutate({
                      familyId: selectedFamilyId,
                      memberId: removingMember.member?._id || removingMember._id,
                    });
                  }
                }}
              >
                Confirm Removal
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Archive Family Modal ── */}
      <Modal
        isOpen={!!archivingFamily}
        onClose={() => setArchivingFamily(null)}
        title="Archive Family Household"
        size="md"
      >
        {archivingFamily && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to archive{' '}
              <span className="font-bold text-gray-900">{archivingFamily.name}</span> ({archivingFamily.familyCode})?
            </p>
            <p className="text-xs text-gray-500 bg-red-50 p-3 rounded-xl border border-red-200">
              Soft archiving marks the family inactive in census calculations. You can view archived families at any
              time by selecting the "Archived" filter.
            </p>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setArchivingFamily(null)}
                disabled={archiveFamilyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={archiveFamilyMutation.isPending}
                icon={<Archive size={16} />}
                onClick={() => {
                  archiveFamilyMutation.mutate({
                    familyId: archivingFamily._id || archivingFamily.id,
                    force: true,
                  });
                }}
              >
                Archive Family
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Approve / Reject Request Modal ── */}
      <Modal
        isOpen={!!reviewingRequest && !!requestActionType}
        onClose={() => {
          setReviewingRequest(null);
          setRequestActionType(null);
        }}
        title={
          requestActionType === 'APPROVE'
            ? `Approve Request: ${reviewingRequest?.requestCode}`
            : `Reject Request: ${reviewingRequest?.requestCode}`
        }
        size="md"
      >
        {reviewingRequest && (
          <div className="space-y-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
              <p>
                <span className="font-semibold text-gray-700">Family: </span>
                {reviewingRequest.familyId?.name} ({reviewingRequest.familyId?.familyCode})
              </p>
              <p>
                <span className="font-semibold text-gray-700">Action: </span>
                {reviewingRequest.requestType?.replace(/_/g, ' ')}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Requester Note: </span>
                "{reviewingRequest.reason || 'None'}"
              </p>
            </div>

            {requestActionType === 'APPROVE' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Approval Comment (Optional)
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="e.g. Verified with family head, approved by Secretary"
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none resize-none"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete supporting information or duplicate entry"
                  rows={2}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-red-500 outline-none resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setReviewingRequest(null);
                  setRequestActionType(null);
                }}
              >
                Cancel
              </Button>
              {requestActionType === 'APPROVE' ? (
                <Button
                  type="button"
                  variant="primary"
                  loading={approveRequestMutation.isPending}
                  icon={<Check size={16} />}
                  onClick={() => {
                    approveRequestMutation.mutate({
                      id: reviewingRequest._id || reviewingRequest.id,
                      comment: approvalComment.trim() || undefined,
                    });
                  }}
                >
                  Confirm & Apply Changes
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  loading={rejectRequestMutation.isPending}
                  icon={<X size={16} />}
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      setFormError('Please specify a reason for rejection.');
                      return;
                    }
                    rejectRequestMutation.mutate({
                      id: reviewingRequest._id || reviewingRequest.id,
                      reason: rejectionReason.trim(),
                    });
                  }}
                >
                  Reject Request
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FamiliesPage;
