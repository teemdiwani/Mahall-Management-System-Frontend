import React, { useState } from 'react';
import {
  Home,
  Users,
  Phone,
  Mail,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  UserMinus,
  Edit3,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import Modal from '../../../components/ui/Modal';
import { familiesApi, familyRequestsApi } from '../../../api/domainApis';

// Simple visual tree node
const FamilyTreeNode: React.FC<{ name: string; role: string; isHead?: boolean }> = ({
  name,
  role,
  isHead,
}) => (
  <div
    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
      isHead ? 'border-emerald-400 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white'
    } min-w-[110px]`}
  >
    <Avatar name={name} size="md" />
    <div className="text-center">
      <p className="text-xs font-bold text-gray-800 leading-tight">{name.split(' ')[0]}</p>
      <p className="text-[10px] text-gray-500 font-medium capitalize mt-0.5">{role.toLowerCase()}</p>
    </div>
    {isHead && (
      <Badge variant="emerald" size="sm">
        Head
      </Badge>
    )}
  </div>
);

const RELATIONSHIPS = [
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

const MyFamilyPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Change Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<
    'ADD_MEMBER' | 'REMOVE_MEMBER' | 'CHANGE_RELATIONSHIP' | 'UPDATE_FAMILY_INFORMATION'
  >('ADD_MEMBER');

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [reason, setReason] = useState('');
  const [addMemberData, setAddMemberData] = useState({
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    relationship: 'SON',
    phone: '',
    occupation: '',
    education: '',
  });

  const [targetMemberId, setTargetMemberId] = useState('');
  const [newRelationship, setNewRelationship] = useState('OTHER');
  const [updateFamilyData, setUpdateFamilyData] = useState({
    address: '',
    phone: '',
    email: '',
  });

  // ── Queries ──
  const { data, isLoading } = useQuery({
    queryKey: ['my-family'],
    queryFn: familiesApi.getMyFamily,
  });

  const result = data?.data;
  const family = result?.family;
  const members: any[] = result?.members || [];
  const isFamilyHead: boolean = result?.isFamilyHead || false;
  const myRelationship: string = result?.myRelationship || 'MEMBER';

  // Requests query
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['my-family-requests', family?._id],
    queryFn: () => (family?._id ? familyRequestsApi.list({ familyId: family._id }) : null),
    enabled: !!family?._id,
  });

  const requests: any[] = requestsData?.data?.items || requestsData?.data || [];

  // ── Mutation ──
  const createRequestMutation = useMutation({
    mutationFn: (payload: any) => familyRequestsApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-family-requests'] });
      setIsRequestModalOpen(false);
      setSuccessMsg(
        `Request ${res?.data?.requestCode || ''} submitted successfully! The Mahall Secretary has been notified for review.`
      );
      setTimeout(() => setSuccessMsg(null), 6000);
      resetRequestForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to submit request');
    },
  });

  const resetRequestForm = () => {
    setReason('');
    setTargetMemberId('');
    setNewRelationship('OTHER');
    setAddMemberData({
      name: '',
      gender: 'MALE',
      dateOfBirth: '',
      relationship: 'SON',
      phone: '',
      occupation: '',
      education: '',
    });
    if (family) {
      setUpdateFamilyData({
        address: family.address || '',
        phone: family.phone || '',
        email: family.email || '',
      });
    }
    setFormError(null);
  };

  const handleOpenRequestModal = () => {
    resetRequestForm();
    if (family) {
      setUpdateFamilyData({
        address: family.address || '',
        phone: family.phone || '',
        email: family.email || '',
      });
    }
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!family?._id) return;
    setFormError(null);

    if (!reason.trim()) {
      setFormError('Please enter a reason or description for this change request');
      return;
    }

    const payload: any = {
      familyId: family._id,
      requestType,
      reason: reason.trim(),
    };

    if (requestType === 'ADD_MEMBER') {
      if (!addMemberData.name.trim()) {
        setFormError('Member name is required');
        return;
      }
      payload.proposedData = {
        name: addMemberData.name.trim(),
        gender: addMemberData.gender,
        dateOfBirth: addMemberData.dateOfBirth || undefined,
        relationship: addMemberData.relationship,
        phone: addMemberData.phone.trim() || undefined,
        occupation: addMemberData.occupation.trim() || undefined,
        education: addMemberData.education.trim() || undefined,
      };
    } else if (requestType === 'REMOVE_MEMBER') {
      if (!targetMemberId) {
        setFormError('Please select the member to remove');
        return;
      }
      payload.targetMemberId = targetMemberId;
    } else if (requestType === 'CHANGE_RELATIONSHIP') {
      if (!targetMemberId) {
        setFormError('Please select the member');
        return;
      }
      payload.targetMemberId = targetMemberId;
      payload.proposedData = {
        relationship: newRelationship,
      };
    } else if (requestType === 'UPDATE_FAMILY_INFORMATION') {
      payload.proposedData = {
        address: updateFamilyData.address.trim() || undefined,
        phone: updateFamilyData.phone.trim() || undefined,
        email: updateFamilyData.email.trim() || undefined,
      };
    }

    createRequestMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading family records from MongoDB database...</p>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div>
        <PageHeader title="My Family" breadcrumb={[{ label: 'Dashboard' }, { label: 'My Family' }]} />
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Home size={48} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No Family Assigned</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your profile has not yet been linked to a registered Mahall household.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Please contact the Mahall Secretary office to register or link your family.
          </p>
        </div>
      </div>
    );
  }

  const parents = members.filter((m) =>
    ['HEAD', 'SPOUSE', 'FATHER', 'MOTHER'].includes(m.relationship)
  );
  const children = members.filter((m) => ['SON', 'DAUGHTER'].includes(m.relationship));
  const elders = members.filter((m) =>
    ['GRANDFATHER', 'GRANDMOTHER'].includes(m.relationship)
  );

  return (
    <div>
      <PageHeader
        title={family.name}
        subtitle={`${family.area || family.ward || 'Mahall'} · ${family.address} · Code: ${family.familyCode || '—'}`}
        breadcrumb={[{ label: 'Dashboard' }, { label: 'My Family' }]}
        action={
          isFamilyHead ? (
            <Button
              icon={<Send size={16} />}
              onClick={handleOpenRequestModal}
              className="shadow-sm"
            >
              Request Family Change
            </Button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 border border-gray-200">
              Role: {myRelationship} (Head: {family.familyHead?.name || 'Assigned'})
            </div>
          )
        }
      />

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50/80 border border-emerald-100 text-emerald-800 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold">{members.length}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mt-0.5">
            Total Members
          </p>
        </div>
        <div className="bg-blue-50/80 border border-blue-100 text-blue-800 rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-bold">₹{family.monthlyContribution || 250}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
            Monthly Contribution
          </p>
        </div>
        <div className="bg-purple-50/80 border border-purple-100 text-purple-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xl font-bold">{family.status || 'ACTIVE'}</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mt-0.5">
            Household Status
          </p>
        </div>
        <div className="bg-teal-50/80 border border-teal-100 text-teal-800 rounded-2xl p-4 shadow-sm">
          <p className="text-base font-bold">
            {new Date(family.createdAt || Date.now()).toLocaleDateString()}
          </p>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mt-0.5">
            Census Registered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Family Tree */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center justify-between">
              <span>Family Structure Visual</span>
              <span className="text-xs text-gray-400 font-normal">Live Census Hierarchy</span>
            </h3>

            <div className="flex flex-col items-center gap-4 py-4">
              {/* Elders */}
              {elders.length > 0 && (
                <div className="flex gap-4 flex-wrap justify-center">
                  {elders.map((m) => (
                    <FamilyTreeNode key={m._id || m.id} name={m.name} role={m.relationship} />
                  ))}
                </div>
              )}

              {/* Connector */}
              {elders.length > 0 && <div className="w-0.5 h-6 bg-gray-200" />}

              {/* Parents / Head */}
              {parents.length > 0 && (
                <div className="flex gap-4 flex-wrap justify-center">
                  {parents.map((m) => (
                    <FamilyTreeNode
                      key={m._id || m.id}
                      name={m.name}
                      role={m.relationship}
                      isHead={m.relationship === 'HEAD' || m.isHead}
                    />
                  ))}
                </div>
              )}

              {/* Connector */}
              {children.length > 0 && (
                <>
                  <div className="w-0.5 h-6 bg-gray-200" />
                  <div className="text-xs text-gray-400 font-medium">Children</div>
                  <div className="flex gap-4 flex-wrap justify-center">
                    {children.map((m) => (
                      <FamilyTreeNode key={m._id || m.id} name={m.name} role={m.relationship} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Contact & Details */}
        <div className="flex flex-col gap-5">
          <Card padding="md">
            <h3 className="text-base font-bold text-gray-800 mb-4">Contact Information</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone size={15} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono">{family.phone}</p>
                </div>
              </div>

              {family.email && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Mail size={15} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-semibold text-gray-800">{family.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Home size={15} className="text-purple-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-800">{family.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* All Members List */}
          <Card padding="md">
            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users size={16} className="text-emerald-700" /> All Members ({members.length})
              </span>
              <span className="text-xs text-gray-400 font-mono">{family.familyCode}</span>
            </h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {members.map((m) => (
                <div
                  key={m._id || m.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} size="xs" />
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-tight">{m.name}</p>
                      <p className="text-[11px] text-gray-400 capitalize">
                        {m.relationship?.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{m.occupation || '—'}</p>
                    {(m.relationship === 'HEAD' || m.isHead) && (
                      <Badge variant="emerald" size="sm">
                        Head
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Change Requests Tracking Section ── */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-emerald-700" />
              Family Change Requests ({requests.length})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              History of household additions, removals, and relationship updates submitted for committee approval
            </p>
          </div>
          {isFamilyHead && (
            <Button size="sm" variant="outline" icon={<Send size={14} />} onClick={handleOpenRequestModal}>
              New Request
            </Button>
          )}
        </div>

        {isRequestsLoading ? (
          <div className="flex items-center justify-center p-8 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-xs">Loading change requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/70 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
            No change requests submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r: any) => (
              <div
                key={r._id || r.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {r.requestCode}
                    </span>
                    <span className="font-semibold text-gray-800 uppercase">
                      {r.requestType?.replace(/_/g, ' ')}
                    </span>
                    <Badge
                      variant={
                        r.status === 'APPROVED' ? 'emerald' : r.status === 'REJECTED' ? 'red' : 'amber'
                      }
                      dot
                      size="sm"
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1 italic">"{r.reason}"</p>
                  {r.reviewNotes && (
                    <p className="text-amber-800 bg-amber-50 px-2 py-1 rounded mt-1.5">
                      <span className="font-semibold">Secretary Note:</span> {r.reviewNotes}
                    </p>
                  )}
                </div>

                <div className="text-right text-gray-400 self-end sm:self-auto flex-shrink-0">
                  <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Submit Change Request Modal ── */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => {
          if (!createRequestMutation.isPending) setIsRequestModalOpen(false);
        }}
        title="Submit Family Change Request"
        size="lg"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Request Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Request Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'ADD_MEMBER', label: 'Add Member', icon: UserPlus },
                { type: 'REMOVE_MEMBER', label: 'Remove Member', icon: UserMinus },
                { type: 'CHANGE_RELATIONSHIP', label: 'Change Role', icon: Edit3 },
                { type: 'UPDATE_FAMILY_INFORMATION', label: 'Update Info', icon: Home },
              ].map((item) => {
                const Icon = item.icon;
                const active = requestType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setRequestType(item.type as any);
                      setFormError(null);
                    }}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                      active
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-emerald-600' : 'text-gray-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Specific to Request Type */}
          {requestType === 'ADD_MEMBER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addMemberData.name}
                  onChange={(e) => setAddMemberData({ ...addMemberData, name: e.target.value })}
                  placeholder="e.g. Zaid Al-Rashid"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship to Head *</label>
                <select
                  value={addMemberData.relationship}
                  onChange={(e) =>
                    setAddMemberData({ ...addMemberData, relationship: e.target.value })
                  }
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                <select
                  value={addMemberData.gender}
                  onChange={(e) => setAddMemberData({ ...addMemberData, gender: e.target.value })}
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
                  value={addMemberData.dateOfBirth}
                  onChange={(e) =>
                    setAddMemberData({ ...addMemberData, dateOfBirth: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={addMemberData.phone}
                  onChange={(e) => setAddMemberData({ ...addMemberData, phone: e.target.value })}
                  placeholder="e.g. +91 9847111050"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={addMemberData.occupation}
                  onChange={(e) =>
                    setAddMemberData({ ...addMemberData, occupation: e.target.value })
                  }
                  placeholder="e.g. Student, Engineer"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          )}

          {requestType === 'REMOVE_MEMBER' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Family Member to Remove *
              </label>
              <select
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>
          )}

          {requestType === 'CHANGE_RELATIONSHIP' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Select Family Member *
                </label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} (Current: {m.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  New Relationship *
                </label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {requestType === 'UPDATE_FAMILY_INFORMATION' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Updated Address / House Details
                </label>
                <textarea
                  value={updateFamilyData.address}
                  onChange={(e) =>
                    setUpdateFamilyData({ ...updateFamilyData, address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={updateFamilyData.phone}
                    onChange={(e) =>
                      setUpdateFamilyData({ ...updateFamilyData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={updateFamilyData.email}
                    onChange={(e) =>
                      setUpdateFamilyData({ ...updateFamilyData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reason / Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason / Supporting Information <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe why this change is needed (e.g. newborn child, moved house, marriage, correction)..."
              rows={2}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
              disabled={createRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createRequestMutation.isPending}
              icon={<Send size={16} />}
            >
              Submit to Secretary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyFamilyPage;
