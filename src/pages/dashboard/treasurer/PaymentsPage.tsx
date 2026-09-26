import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Search, Plus, Loader2, CheckCircle2, AlertCircle, FileText, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import { PaymentStatusBadge } from '../../../components/ui/Badge';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { Pagination } from '../../../components/ui/Table';
import { paymentsApi, financeApi, familiesApi } from '../../../api/domainApis';

const PAGE_SIZE = 10;

const PAYMENT_TYPES = [
  { value: 'MONTHLY', label: 'Monthly Contribution' },
  { value: 'DONATION', label: 'General Donation' },
  { value: 'ZAKAT', label: 'Zakat' },
  { value: 'FITRAH', label: 'Fitrah' },
  { value: 'IFTAR', label: 'Ramadan Iftar Sponsor' },
  { value: 'EVENT', label: 'Event Registration' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash at Counter' },
  { value: 'UPI', label: 'UPI / QR Code' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/IMPS)' },
  { value: 'ONLINE', label: 'Online Gateway' },
];

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabs('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [recordForm, setRecordForm] = useState({
    familyId: '',
    memberId: '',
    amount: '',
    type: 'MONTHLY',
    month: currentYearMonth,
    paymentMethod: 'CASH',
    notes: '',
  });

  const statusFilter = ['pending', 'overdue', 'paid'].includes(activeTab) ? activeTab : undefined;
  const typeFilter = ['monthly', 'donation', 'zakat'].includes(activeTab) ? activeTab : undefined;

  // Payments Query
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', page, activeTab, search],
    queryFn: () =>
      paymentsApi.list({
        page,
        limit: PAGE_SIZE,
        status: statusFilter,
        type: typeFilter,
        search: search || undefined,
      }),
  });

  // Overview / Financial Aggregates Query
  const { data: overviewData } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: () => financeApi.getOverview(),
  });

  // Active Families Query for dropdown
  const { data: familiesData } = useQuery({
    queryKey: ['families-for-payment'],
    queryFn: () => familiesApi.list({ limit: 100 }),
  });

  const familiesList: any[] = familiesData?.data?.items || [];

  // Record Payment Mutation
  const recordMutation = useMutation({
    mutationFn: (payload: any) => paymentsApi.recordDirect(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-overview'] });
      queryClient.invalidateQueries({ queryKey: ['treasurer-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsRecordModalOpen(false);
      const receiptNo = res?.data?.receiptNumber || res?.data?.paymentNumber || 'generated';
      setSuccessMsg(`Payment of ₹${recordForm.amount} successfully recorded in DB! Official Receipt: ${receiptNo}`);
      setTimeout(() => setSuccessMsg(null), 6000);
      resetRecordForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to record payment');
    },
  });

  const resetRecordForm = () => {
    setRecordForm({
      familyId: '',
      memberId: '',
      amount: '',
      type: 'MONTHLY',
      month: currentYearMonth,
      paymentMethod: 'CASH',
      notes: '',
    });
    setFormError(null);
  };

  const handleFamilyChange = (famId: string) => {
    const selectedFam = familiesList.find((f) => f._id === famId);
    setRecordForm((prev) => ({
      ...prev,
      familyId: famId,
      amount: selectedFam?.monthlyContribution ? String(selectedFam.monthlyContribution) : prev.amount || '250',
    }));
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!recordForm.familyId) {
      setFormError('Please select a family household.');
      return;
    }
    if (!recordForm.amount || Number(recordForm.amount) <= 0) {
      setFormError('Please enter a valid payment amount greater than zero.');
      return;
    }

    recordMutation.mutate({
      familyId: recordForm.familyId,
      memberId: recordForm.memberId || undefined,
      amount: Number(recordForm.amount),
      type: recordForm.type,
      month: recordForm.type === 'MONTHLY' ? recordForm.month : undefined,
      paymentMethod: recordForm.paymentMethod,
      notes: recordForm.notes.trim() || undefined,
    });
  };

  const overview = overviewData?.data?.cards || overviewData?.data || {};
  const totalIncome = overview.totalIncome || 0;
  const collectedMonthly = overview.collectedMonthly || overview.collected || 0;
  const pendingMonthly = overview.pendingMonthly || overview.pending || 0;

  const responseData = paymentsData?.data;
  const items: any[] = responseData?.items || [];
  const pagination = responseData?.pagination || {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const typeColorMap: Record<string, 'emerald' | 'blue' | 'amber' | 'purple' | 'teal' | 'gray' | 'orange' | 'red'> = {
    monthly: 'blue', MONTHLY: 'blue',
    donation: 'emerald', DONATION: 'emerald',
    zakat: 'amber', ZAKAT: 'amber',
    fitrah: 'purple', FITRAH: 'purple',
    tuition: 'purple', TUITION: 'purple',
    rent: 'teal', RENT: 'teal',
    other: 'gray', OTHER: 'gray',
  };

  // Export CSV
  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ['Receipt No', 'Family Name', 'Family Code', 'Type', 'Month', 'Amount', 'Payment Method', 'Status', 'Date'];
    const rows = items.map((p) => [
      p.receiptNumber || p.paymentNumber || '',
      p.familyId?.name || '',
      p.familyId?.familyCode || '',
      p.type || 'MONTHLY',
      p.month || '',
      p.amount || 0,
      p.paymentMethod || '',
      p.status || '',
      p.paidAt ? new Date(p.paidAt).toLocaleDateString() : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mahall_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Payments"
        subtitle="Live payment records, monthly dues, donations, and digital receipts connected to MongoDB"
        breadcrumb={[{ label: 'Finance' }, { label: 'Payments' }]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" icon={<Download size={16} />} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                resetRecordForm();
                setIsRecordModalOpen(true);
              }}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards from Real DB Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Income (Paid)', value: `₹${totalIncome.toLocaleString()}`, color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
          { label: 'Current Month Collected', value: `₹${collectedMonthly.toLocaleString()}`, color: 'text-blue-700 bg-blue-50 border border-blue-100' },
          { label: 'Current Month Pending', value: `₹${pendingMonthly.toLocaleString()}`, color: 'text-amber-700 bg-amber-50 border border-amber-100' },
          { label: 'Total DB Records', value: String(pagination.total || items.length), color: 'text-purple-700 bg-purple-50 border border-purple-100' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 shadow-xs`}>
            <p className="text-xl sm:text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'donation', label: 'Donations' },
            { key: 'zakat', label: 'Zakat' },
            { key: 'pending', label: 'Pending' },
            { key: 'paid', label: 'Paid' },
          ]}
        />
        <div className="relative w-full sm:w-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search family, receipt #..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none w-full sm:w-64 shadow-xs"
          />
        </div>
      </div>

      {/* Payments Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center p-16 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Loading payments from MongoDB database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={36} className="mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-sm font-semibold text-gray-600">No payment records found.</p>
            <p className="text-xs text-gray-400 mt-1">Try changing filters or record a new offline payment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Receipt / Payment #', 'Family', 'Type', 'Month', 'Amount', 'Payment Method', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p) => {
                  const familyName = p.familyId?.name || p.familyName || 'General Family';
                  const familyCode = p.familyId?.familyCode || '';
                  const receiptNo = p.receiptNumber || p.paymentNumber || '—';
                  const status = (p.status || 'PENDING').toLowerCase();
                  const type = p.type || 'MONTHLY';

                  return (
                    <tr key={p._id || p.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                        {receiptNo}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{familyName}</p>
                        {familyCode && <p className="text-[11px] font-mono text-gray-400">{familyCode}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={typeColorMap[type] || 'gray'} size="sm">
                          {type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.month || '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ₹{Number(p.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        <span className="font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          {p.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={status as any} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/app/payments/${p._id || p.id}/invoice`)}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold hover:underline flex items-center gap-1"
                        >
                          <FileText size={13} />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-100 gap-2.5">
          <span className="text-xs text-gray-500">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, pagination.total)}–
            {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} records
          </span>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>

      {/* ── Record Payment Modal ── */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          if (!recordMutation.isPending) setIsRecordModalOpen(false);
        }}
        title="Record Payment / Offline Contribution"
        size="lg"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Select Family */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Family Household <span className="text-red-500">*</span>
              </label>
              <select
                value={recordForm.familyId}
                onChange={(e) => handleFamilyChange(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                <option value="">-- Select Registered Family --</option>
                {familiesList.map((f: any) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.familyCode}) — {f.area || 'Ward'} (Contribution: ₹{f.monthlyContribution || 250})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={recordForm.type}
                onChange={(e) => setRecordForm({ ...recordForm, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {PAYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Amount Paid (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                placeholder="250"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-semibold"
              />
            </div>

            {/* Month (for Monthly Dues) */}
            {recordForm.type === 'MONTHLY' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Billing Month (YYYY-MM)
                </label>
                <input
                  type="month"
                  value={recordForm.month}
                  onChange={(e) => setRecordForm({ ...recordForm, month: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                />
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={recordForm.paymentMethod}
                onChange={(e) => setRecordForm({ ...recordForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-500 outline-none"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes / Reference */}
            <div className={recordForm.type === 'MONTHLY' ? 'md:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Transaction Notes / Reference (Optional)
              </label>
              <input
                type="text"
                value={recordForm.notes}
                onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                placeholder="e.g. Paid in cash at Mahall counter, Cheque #5502, UPI ref"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRecordModalOpen(false)}
              disabled={recordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={recordMutation.isPending}
              icon={<Check size={16} />}
            >
              Save Payment to Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
