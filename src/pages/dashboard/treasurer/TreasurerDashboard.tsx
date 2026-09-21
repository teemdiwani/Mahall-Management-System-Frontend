import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { PaymentStatusBadge } from '../../../components/ui/Badge';
import { dashboardApi } from '../../../api/dashboardApi';

const TreasurerDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['treasurer-dashboard'],
    queryFn: dashboardApi.getTreasurerDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading treasury data from MongoDB ledger...</p>
        </div>
      </div>
    );
  }

  const d = data?.data;
  const cards = d?.cards || {
    expectedCollection: 0,
    collectedMonthly: 0,
    pendingMonthly: 0,
    pendingCount: 0,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  };

  const recentPayments = d?.recentPayments || [];
  const recentExpenses = d?.recentExpenses || [];
  const monthlyTrend = d?.charts?.monthlyTrend || [];

  return (
    <div>
      <PageHeader
        title="Finance & Treasury Dashboard"
        subtitle="Al-Noor Mahall — Financial Ledger & Contribution Status"
        breadcrumb={[{ label: 'Dashboard' }]}
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Connected to Database</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Monthly Dues Collected"
          value={`₹${cards.collectedMonthly.toLocaleString()}`}
          icon={<CheckCircle size={20} />}
          change="This Month"
          changeType="up"
        />
        <StatCard
          label="Expected Collection"
          value={`₹${cards.expectedCollection.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          subtitle="All Active Families"
        />
        <StatCard
          label="Pending Dues"
          value={`₹${cards.pendingMonthly.toLocaleString()}`}
          icon={<AlertCircle size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          change={`${cards.pendingCount} unpaid payments`}
          changeType="down"
        />
        <StatCard
          label="Total Expenses"
          value={`₹${cards.totalExpenses.toLocaleString()}`}
          icon={<TrendingDown size={20} />}
          iconBg="bg-red-50 text-red-600"
          subtitle="All Vouchers"
        />
        <StatCard
          label="Net Treasury Balance"
          value={`₹${cards.balance.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          change="Income minus Expenses"
          changeType="up"
        />
        <StatCard
          label="Gross Revenue Recorded"
          value={`₹${cards.totalIncome.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle="All sources"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <CardTitle>Monthly Collections Trend</CardTitle>
            <Badge variant="emerald">Live Payments</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2.5} fill="url(#rev2)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2.5">
            {recentExpenses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No expenses recorded yet.</p>
            ) : (
              recentExpenses.map((e: any) => (
                <div key={e._id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{e.title}</p>
                    <p className="text-[10px] text-gray-400">{e.category} · {new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600">-₹{e.amount}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Recent Transactions & Verified Receipts</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium">
                <th className="py-2.5 px-3">Receipt / Payment No</th>
                <th className="py-2.5 px-3">Family</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p: any) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-800">
                    {p.receiptNumber || p.paymentNumber}
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">
                    {p.familyId?.name || p.familyId?.familyCode || 'General'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 capitalize">{p.type}</td>
                  <td className="py-2.5 px-3 text-gray-500">{p.paymentMethod}</td>
                  <td className="py-2.5 px-3 font-bold text-gray-800">₹{p.amount}</td>
                  <td className="py-2.5 px-3">
                    <PaymentStatusBadge status={p.status.toLowerCase() as any} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TreasurerDashboard;
