import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  Check,
  X,
  Award,
  DollarSign,
  Heart,
  Building2,
  CrossIcon,
  Plane,
  HelpCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import { ApplicationStatusBadge } from '../../../components/ui/Badge';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { applicationsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const STATUS_STEPS = ['pending', 'under_review', 'approved', 'completed'];

const APPLICATION_TYPES = [
  {
    key: 'CERTIFICATE',
    label: 'NOC & Certificate Request',
    desc: 'Mahall Membership, Residence, Character or Marriage NOC certificates',
    icon: Award,
    color: 'emerald',
    needsAmount: false,
  },
  {
    key: 'WELFARE',
    label: 'Welfare & Medical Aid',
    desc: 'Emergency financial assistance, hospital bills, medical support',
    icon: Heart,
    color: 'blue',
    needsAmount: true,
  },
  {
    key: 'ZAKAT',
    label: 'Zakat Assistance',
    desc: 'Eligible Zakat fund grant for destitute, debt relief, or essential needs',
    icon: DollarSign,
    color: 'amber',
    needsAmount: true,
  },
  {
    key: 'MARRIAGE',
    label: 'Marriage (Nikah) NOC & Service',
    desc: 'Nikah conduct request, NOC for external marriage, marriage grant',
    icon: Heart,
    color: 'purple',
    needsAmount: false,
  },
  {
    key: 'EDUCATION_AID',
    label: 'Education & Scholarship Aid',
    desc: 'Madrasa fees support, school books kit, higher education scholarship',
    icon: Award,
    color: 'blue',
    needsAmount: true,
  },
  {
    key: 'FACILITY_BOOKING',
    label: 'Mahall Facility & Vehicle Booking',
    desc: 'Community hall, madrasa auditorium, sound systems, Janazah ambulance',
    icon: Building2,
    color: 'teal',
    needsAmount: false,
  },
  {
    key: 'FUNERAL',
    label: 'Funeral (Janazah) Service',
    desc: 'Burial plot allocation, grave maintenance, bereavement support',
    icon: CrossIcon,
    color: 'gray',
    needsAmount: false,
  },
  {
    key: 'HAJJ',
    label: 'Hajj & Umrah Orientation',
    desc: 'Pilgrim guidance, orientation sessions, vaccination verification',
    icon: Plane,
    color: 'teal',
    needsAmount: false,
  },
  {
    key: 'GENERAL_REQUEST',
    label: 'General Mahall Assistance',
    desc: 'Family consultation, boundary mediation, grievance or inquiry',
    icon: HelpCircle,
    color: 'orange',
    needsAmount: false,
  },
  {
    key: 'OTHER',
    label: 'Other Request',
    desc: 'Custom inquiry or request submitted to the Mahall Committee',
    icon: FileText,
    color: 'gray',
    needsAmount: false,
  },
];

const StatusTimeline: React.FC<{ status: string }> = ({ status }) => {
  const normStatus = (status || 'pending').toLowerCase();
  const currentIdx = STATUS_STEPS.indexOf(normStatus === 'rejected' ? 'under_review' : normStatus);

  return (
    <div className="flex items-center gap-0 mt-3 pt-2 border-t border-gray-100">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
              ${
                i <= currentIdx && normStatus !== 'rejected'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : normStatus === 'rejected' && i === currentIdx
                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                  : 'border-gray-200 text-gray-400 bg-white'
              }`}
            >
              {i < currentIdx && normStatus !== 'rejected' ? (
                <Check size={12} strokeWidth={3} />
              ) : normStatus === 'rejected' && i === currentIdx ? (
                <X size={12} strokeWidth={3} />
              ) : (
                i + 1
              )}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 capitalize whitespace-nowrap">
              {step.replace('_', ' ')}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-3.5 mx-1 transition-all ${
                i < currentIdx && normStatus !== 'rejected' ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { activeTab, setActiveTab } = useTabs('all');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'UNDER_REVIEW' | 'COMPLETE' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [decisionGrant, setDecisionGrant] = useState('');

  // Feedback messages
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Request Form State
  const [formData, setFormData] = useState({
    type: 'CERTIFICATE',
    title: '',
    description: '',
    requestedAmount: '',
  });

  const canReview = [
    'super_admin',
    'SUPER_ADMIN',
    'secretary',
    'SECRETARY',
    'welfare_officer',
    'WELFARE_OFFICER',
    'imam',
    'IMAM',
    'treasurer',
    'TREASURER',
    'committee_member',
    'COMMITTEE_MEMBER',
  ].includes(user?.role ?? '');

  // Auto-open modal if ?new=true query parameter is in URL
  useEffect(() => {
    if (searchParams.get('new') === 'true' || searchParams.get('create') === 'true') {
      setIsCreateModalOpen(true);
      searchParams.delete('new');
      searchParams.delete('create');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['applications', activeTab, typeFilter, search],
    queryFn: () =>
      applicationsApi.list({
        status: activeTab !== 'all' ? activeTab.toUpperCase() : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        search: search || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => applicationsApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      setIsCreateModalOpen(false);
      setSuccessMsg(
        `Application ${res?.data?.applicationNumber || ''} submitted successfully! The Mahall Committee will review it.`
      );
      setTimeout(() => setSuccessMsg(null), 6000);
      setFormData({
        type: 'CERTIFICATE',
        title: '',
        description: '',
        requestedAmount: '',
      });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to submit application');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      decision,
      comment,
    }: {
      id: string;
      status: string;
      decision?: string;
      comment?: string;
    }) => applicationsApi.updateStatus(id, { status, decision, comment }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      setSelected(null);
      setReviewAction(null);
      setReviewComment('');
      setDecisionGrant('');
      setSuccessMsg(`Application status updated to ${res?.data?.status || 'updated'}.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update application');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Please enter a descriptive title for your request');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Please explain the details/purpose of your request');
      return;
    }

    const payload: any = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (formData.requestedAmount && Number(formData.requestedAmount) > 0) {
      payload.requestedAmount = Number(formData.requestedAmount);
    }

    createMutation.mutate(payload);
  };

  const handleReviewSubmit = () => {
    if (!selected || !reviewAction) return;

    if (reviewAction === 'REJECT' && !reviewComment.trim()) {
      setFormError('Please provide a reason for rejecting this application');
      return;
    }

    let status = 'UNDER_REVIEW';
    if (reviewAction === 'APPROVE') status = 'APPROVED';
    if (reviewAction === 'REJECT') status = 'REJECTED';
    if (reviewAction === 'COMPLETE') status = 'COMPLETED';

    updateStatusMutation.mutate({
      id: selected._id || selected.id,
      status,
      decision: decisionGrant.trim() || undefined,
      comment: reviewComment.trim() || undefined,
    });
  };

  const rawItems: any[] = data?.data?.items || [];

  const typeColorMap: Record<string, 'emerald' | 'blue' | 'amber' | 'purple' | 'teal' | 'orange' | 'gray' | 'red'> = {
    CERTIFICATE: 'emerald', certificate: 'emerald',
    WELFARE: 'blue', welfare: 'blue',
    ZAKAT: 'amber', zakat: 'amber',
    MARRIAGE: 'purple', marriage: 'purple',
    EDUCATION_AID: 'blue', education_aid: 'blue',
    FACILITY_BOOKING: 'teal', facility_booking: 'teal',
    FUNERAL: 'gray', funeral: 'gray',
    HAJJ: 'teal', hajj: 'teal',
    UMRAH: 'teal', umrah: 'teal',
    GENERAL_REQUEST: 'orange', general_request: 'orange',
    OTHER: 'gray', other: 'gray',
  };

  const currentTypeConfig = APPLICATION_TYPES.find((t) => t.key === formData.type);

  return (
    <div>
      <PageHeader
        title="Mahall Requests & Applications"
        subtitle={
          canReview
            ? 'Review, verify, and process community requests, certificates, and welfare applications'
            : 'Submit official requests, NOCs, certificates, and welfare assistance to the Mahall Administration'
        }
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Applications' }]}
        action={
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
          >
            New Application
          </Button>
        }
      />

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-5">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'under_review', label: 'Under Review' },
            { key: 'approved', label: 'Approved' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
          ]}
        />

        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 outline-none shadow-sm focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {APPLICATION_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, applicant..."
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-400 outline-none w-56 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">Loading applications from MongoDB...</span>
        </div>
      ) : rawItems.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FileText size={42} className="text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-700">No applications found in this queue</p>
          <p className="text-xs text-gray-400 mt-1">Click "New Application" to submit a formal request.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {rawItems.map((app) => {
            const appId = app._id || app.id;
            const applicantName = app.applicant?.name || app.applicantName || 'Community Member';
            const status = (app.status || 'PENDING').toLowerCase();
            const type = (app.type || 'OTHER').toUpperCase();
            const dateStr = app.createdAt || app.submittedAt || new Date();

            return (
              <Card
                key={appId}
                hover
                padding="md"
                onClick={() => {
                  setFormError(null);
                  setSelected(app);
                  setReviewAction(null);
                }}
                className="cursor-pointer transition-all hover:border-emerald-300 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <Avatar name={applicantName} size="md" />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={typeColorMap[type] || 'blue'} size="sm">
                          {type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {app.applicationNumber}
                        </span>
                        {app.family?.name && (
                          <span className="text-xs text-gray-400">({app.family.name})</span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 leading-tight">{app.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {applicantName} · Submitted on {new Date(dateStr).toLocaleDateString()}
                      </p>

                      {app.requestedAmount && (
                        <p className="text-xs font-bold text-emerald-700 mt-1">
                          Requested Amount: ₹{Number(app.requestedAmount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <ApplicationStatusBadge status={status as any} />
                    {app.decision && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 size={11} /> {app.decision}
                      </span>
                    )}
                  </div>
                </div>

                <StatusTimeline status={status} />
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Submit New Application / Mahall Request Modal ── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          if (!createMutation.isPending) setIsCreateModalOpen(false);
        }}
        title="Submit New Mahall Request / Application"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Request Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Select Category / Request Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {APPLICATION_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = formData.type === t.key;
                return (
                  <div
                    key={t.key}
                    onClick={() => setFormData({ ...formData, type: t.key })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{t.label}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Type Info Banner */}
          {currentTypeConfig && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <span className="font-bold text-gray-800">{currentTypeConfig.label}: </span>
              {currentTypeConfig.desc}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subject / Request Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                formData.type === 'CERTIFICATE'
                  ? 'e.g. Application for Mahall Residence Certificate'
                  : formData.type === 'WELFARE'
                  ? 'e.g. Financial Assistance for Hospital Treatment'
                  : formData.type === 'MARRIAGE'
                  ? 'e.g. Nikah NOC and Registration Request'
                  : 'e.g. Request for Community Assistance'
              }
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Requested Amount (if applicable) */}
          {currentTypeConfig?.needsAmount && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Requested Aid Amount (₹) <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Purpose / Detailed Explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe why this application/certificate is needed and provide any relevant family or situation context..."
              rows={3}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
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
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── View & Review Application Modal ── */}
      <Modal
        isOpen={!!selected}
        onClose={() => {
          setSelected(null);
          setReviewAction(null);
          setFormError(null);
        }}
        title={`Application: ${selected?.applicationNumber || ''}`}
        size="lg"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <Avatar
                name={selected.applicant?.name || selected.applicantName || 'Applicant'}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={typeColorMap[selected.type] || 'blue'}>
                    {selected.type?.replace(/_/g, ' ')}
                  </Badge>
                  <ApplicationStatusBadge
                    status={(selected.status || 'PENDING').toLowerCase() as any}
                  />
                  <span className="text-xs font-mono font-bold text-gray-500">
                    {selected.applicationNumber}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">{selected.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted by{' '}
                  <span className="font-semibold text-gray-800">
                    {selected.applicant?.name || selected.applicantName}
                  </span>{' '}
                  {selected.family?.name ? `(${selected.family.name})` : ''} on{' '}
                  {new Date(selected.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Timeline */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Application Review Lifecycle
              </p>
              <StatusTimeline status={selected.status} />
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Statement / Request Details
              </p>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                {selected.description}
              </p>
            </div>

            {/* Requested Amount */}
            {selected.requestedAmount && (
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-700 font-semibold">Requested Aid Amount</p>
                  <p className="text-xl font-bold text-emerald-800">
                    ₹{Number(selected.requestedAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Board Decision / Notes */}
            {(selected.decision || selected.reviewNotes) && (
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 text-xs">
                <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">
                  Committee Decision & Review Notes
                </p>
                {selected.decision && (
                  <p className="text-sm text-blue-900 font-bold">{selected.decision}</p>
                )}
                {selected.reviewNotes && (
                  <p className="text-blue-700 mt-0.5">{selected.reviewNotes}</p>
                )}
              </div>
            )}

            {/* Administration Review Actions for Committee/Super Admin */}
            {canReview && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Committee Action & Decision
                </p>

                {reviewAction ? (
                  <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-800">
                      Confirm Action: <span className="text-emerald-700">{reviewAction}</span>
                    </p>

                    {reviewAction === 'APPROVE' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Decision Summary / Certificate Reference
                        </label>
                        <input
                          type="text"
                          value={decisionGrant}
                          onChange={(e) => setDecisionGrant(e.target.value)}
                          placeholder="e.g. Approved grant of ₹10,000 / Issued Certificate #MHL-CRT-109"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reviewer Notes {reviewAction === 'REJECT' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={
                          reviewAction === 'REJECT'
                            ? 'Please specify reason for rejection...'
                            : 'Notes for the applicant or internal committee records...'
                        }
                        rows={2}
                        required={reviewAction === 'REJECT'}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReviewAction(null);
                          setFormError(null);
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        size="sm"
                        variant={reviewAction === 'REJECT' ? 'danger' : 'primary'}
                        loading={updateStatusMutation.isPending}
                        onClick={handleReviewSubmit}
                      >
                        Confirm {reviewAction}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {selected.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Clock size={14} />}
                        onClick={() => {
                          setReviewAction('UNDER_REVIEW');
                          setReviewComment('Moved to Review Committee for verification');
                        }}
                      >
                        Mark Under Review
                      </Button>
                    )}

                    {selected.status !== 'REJECTED' && selected.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<X size={14} className="text-red-500" />}
                        onClick={() => {
                          setReviewAction('REJECT');
                          setReviewComment('');
                        }}
                      >
                        Reject
                      </Button>
                    )}

                    {selected.status !== 'APPROVED' && selected.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Check size={14} />}
                        onClick={() => {
                          setReviewAction('APPROVE');
                          setDecisionGrant('Application approved by Mahall Committee');
                          setReviewComment('All criteria verified.');
                        }}
                      >
                        Approve Application
                      </Button>
                    )}

                    {selected.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<CheckCircle2 size={14} />}
                        onClick={() => {
                          setReviewAction('COMPLETE');
                          setReviewComment('Certificate issued / Grant disbursed');
                        }}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsPage;
