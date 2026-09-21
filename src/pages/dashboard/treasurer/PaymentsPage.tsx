import React, { useState } from 'react';
import { Download, Search, Plus, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import { PaymentStatusBadge } from '../../../components/ui/Badge';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { Pagination } from '../../../components/ui/Table';
import { paymentsApi, financeApi } from '../../../api/domainApis';

const PAGE_SIZE = 10;

const PaymentsPage: React.FC = () => {
  const { activeTab, setActiveTab } = useTabs('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const statusFilter = ['pending', 'overdue', 'paid'].includes(activeTab) ? activeTab : undefined;
  const typeFilter = ['monthly', 'donation', 'zakat'].includes(activeTab) ? activeTab : undefined;

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

  const { data: overviewData } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: () => financeApi.getOverview(),
  });

  const overview = overviewData?.data || {
    collectedMonthly: 0,
    pendingMonthly: 0,
    totalIncome: 0,
    totalExpenses: 0,
  };

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
    rent: 'teal', RENT: 'teal',
    other: 'gray', OTHER: 'gray',
  };

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="All monthly contributions, donations and Zakat recorded in MongoDB"
        breadcrumb={[{ label: 'Finance' }, { label: 'Payments' }]}
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon={<Download size={16} />}>Export</Button>
            <Button icon={<Plus size={16} />}>Record Payment</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Income (Paid)', value: `₹${(overview.totalIncome || 0).toLocaleString()}`, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Current Month Collected', value: `₹${(overview.collectedMonthly || 0).toLocaleString()}`, color: 'text-blue-700 bg-blue-50' },
          { label: 'Current Month Pending', value: `₹${(overview.pendingMonthly || 0).toLocaleString()}`, color: 'text-amber-700 bg-amber-50' },
          { label: 'Total Records in DB', value: String(pagination.total || items.length), color: 'text-purple-700 bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-sm opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <Tabs
          activeTab={activeTab}
          onChange={tab => { setActiveTab(tab); setPage(1); }}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All' },
            { key: 'monthly', label: 'Monthly' },
            { key: 'donation', label: 'Donations' },
            { key: 'zakat', label: 'Zakat' },
            { key: 'pending', label: 'Pending' },
            { key: 'overdue', label: 'Overdue' },
          ]}
        />
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search family..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-400 outline-none w-44"
          />
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm">Loading payments from database...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Receipt / Payment #', 'Family', 'Member', 'Type', 'Month', 'Amount', 'Status', 'Paid On'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(p => {
                  const familyName = p.familyId?.name || p.familyName || '—';
                  const memberName = p.memberId?.name || p.memberName || 'Family Head';
                  const receiptNo = p.receiptNumber || p.paymentNumber || p.receiptNo || '—';
                  const status = (p.status || 'PENDING').toLowerCase();
                  const type = p.type || 'MONTHLY';

                  return (
                    <tr key={p._id || p.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{receiptNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{familyName}</td>
                      <td className="px-4 py-3 text-gray-600">{memberName}</td>
                      <td className="px-4 py-3">
                        <Badge variant={typeColorMap[type] || 'gray'} size="sm">
                          {type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.month || '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">₹{Number(p.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3"><PaymentStatusBadge status={status as any} /></td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">{pagination.total || items.length} records</span>
          <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
};

export default PaymentsPage;

