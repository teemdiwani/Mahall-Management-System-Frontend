import React, { useState } from 'react';
import { Heart, Search, Plus, Loader2, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import { ApplicationStatusBadge } from '../../../components/ui/Badge';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { welfareApi } from '../../../api/domainApis';

const CASE_TYPES = [
  { value: 'WELFARE', label: 'General Welfare' },
  { value: 'ZAKAT', label: 'Zakat' },
  { value: 'MEDICAL', label: 'Medical Aid' },
  { value: 'SCHOLARSHIP', label: 'Scholarship' },
  { value: 'FINANCIAL_AID', label: 'Financial Aid' },
  { value: 'EMERGENCY', label: 'Emergency' },
];

const WelfareCasesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: 'WELFARE', description: '', requestedAmount: '', applicantName: '', applicantPhone: '' });

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['welfare-cases', statusFilter, typeFilter],
    queryFn: () => welfareApi.listCases({ status: statusFilter || undefined, type: typeFilter || undefined }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }: any) => welfareApi.updateCaseStatus(id, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['welfare-cases'] });
      setSuccessMsg('Welfare case status updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update case status');
    },
  });

  const createCase = useMutation({
    mutationFn: (d: any) => welfareApi.createCase(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['welfare-cases'] });
      setShowCreate(false);
      setForm({ type: 'WELFARE', description: '', requestedAmount: '', applicantName: '', applicantPhone: '' });
      setSuccessMsg('New welfare assistance case registered successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to register case');
    },
  });

  const cases = (Array.isArray(data?.data?.items) ? data.data.items : Array.isArray(data?.data) ? data.data : []) as any[];
  const filtered = cases.filter((c: any) =>
    !search ||
    c.description?.toLowerCase().includes(search.toLowerCase()) ||
    c.applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.applicantName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Pending', value: String(cases.filter((c: any) => (c.status || '').toUpperCase() === 'PENDING').length), icon: <Clock size={18} />, bg: 'bg-amber-50 text-amber-600' },
    { label: 'Under Review', value: String(cases.filter((c: any) => (c.status || '').toUpperCase() === 'UNDER_REVIEW').length), icon: <FileText size={18} />, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Approved', value: String(cases.filter((c: any) => (c.status || '').toUpperCase() === 'APPROVED').length), icon: <CheckCircle2 size={18} />, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Cases', value: String(cases.length), icon: <Heart size={18} />, bg: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welfare Cases"
        subtitle="Manage assistance applications — welfare, zakat, medical, scholarship"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Welfare' }, { label: 'Cases' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>New Case</Button>}
      />

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{formError}</p>
          </div>
          <button onClick={() => setFormError(null)} className="text-xs font-bold text-red-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconBg={s.bg} />
        ))}
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Statuses</option>
            {['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Types</option>
            {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : isError ? (
          <div className="py-16 text-center text-red-500">
            <XCircle size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Failed to load welfare cases</p>
            <p className="text-xs text-gray-400 mt-1">{(error as any)?.message || 'Please verify your permissions or network connection.'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><Heart size={40} className="mx-auto mb-3 opacity-30" /><p>No welfare cases found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((c: any) => (
              <div key={c._id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                <Avatar name={c.applicant?.name || c.applicantName || c.description?.slice(0, 8) || 'W'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{c.applicant?.name || c.applicantName || 'Applicant'}</p>
                    <Badge variant="blue" size="sm">{CASE_TYPES.find(t => t.value === c.type)?.label || c.type}</Badge>
                    <ApplicationStatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>
                  {c.requestedAmount && <p className="text-xs font-semibold text-emerald-700 mt-1">Amount Requested: ₹{Number(c.requestedAmount).toLocaleString()}</p>}
                  <p className="text-xs text-gray-400 mt-1">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {(c.status || '').toUpperCase() === 'PENDING' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: c._id, status: 'UNDER_REVIEW' })}>
                      Review
                    </Button>
                  )}
                  {(c.status || '').toUpperCase() === 'UNDER_REVIEW' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: c._id, status: 'APPROVED' })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: c._id, status: 'REJECTED' })}>
                        <XCircle size={14} />
                      </Button>
                    </>
                  )}
                  {(c.status || '').toUpperCase() === 'APPROVED' && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: c._id, status: 'COMPLETED' })}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Welfare Case">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Case Type</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
              {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Applicant Name</label>
            <input value={form.applicantName} onChange={e => setForm(p => ({ ...p, applicantName: e.target.value }))}
              placeholder="Full name of the beneficiary"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input value={form.applicantPhone} onChange={e => setForm(p => ({ ...p, applicantPhone: e.target.value }))}
              placeholder="+91..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description / Reason</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Describe the need..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount Requested (₹)</label>
            <input type="number" value={form.requestedAmount} onChange={e => setForm(p => ({ ...p, requestedAmount: e.target.value }))}
              placeholder="0"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => createCase.mutate({ ...form, requestedAmount: Number(form.requestedAmount) || undefined })}
              disabled={createCase.isPending || !form.description}>
              {createCase.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Create Case
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WelfareCasesPage;
