import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Users, Loader2, BarChart2, PieChart as PieIcon } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { financeApi } from '../../../api/domainApis';
import { dashboardApi } from '../../../api/dashboardApi';

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6'];

const FinanceReportsPage: React.FC = () => {
  const { isLoading } = useQuery({
    queryKey: ['finance-overview'],
    queryFn: () => financeApi.getOverview(),
  });

  const { data: expensesData } = useQuery({
    queryKey: ['finance-expenses-report'],
    queryFn: () => financeApi.listExpenses({ limit: 100 }),
  });

  const { data: dashData, isLoading: loadingDash } = useQuery({
    queryKey: ['treasurer-dashboard'],
    queryFn: dashboardApi.getTreasurerDashboard,
  });

  if (isLoading || loadingDash) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Generating financial reports...</p>
        </div>
      </div>
    );
  }

  const d = dashData?.data;
  const cards = d?.cards || {};
  const monthlyTrend = d?.charts?.monthlyTrend || [];

  const expenses = (expensesData?.data?.items || expensesData?.data || []) as any[];

  // Category breakdown for pie chart
  const categoryBreakdown: Record<string, number> = {};
  expenses.forEach((e: any) => {
    categoryBreakdown[e.category || 'OTHER'] = (categoryBreakdown[e.category || 'OTHER'] || 0) + (e.amount || 0);
  });
  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="Income, expenses and collection analytics"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Finance' }, { label: 'Reports' }]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`₹${(cards.totalIncome || 0).toLocaleString()}`} icon={<TrendingUp size={20} />} iconBg="bg-emerald-50 text-emerald-600" change="All time" changeType="up" />
        <StatCard label="Total Expenses" value={`₹${(cards.totalExpenses || 0).toLocaleString()}`} icon={<TrendingDown size={20} />} iconBg="bg-red-50 text-red-600" />
        <StatCard label="Net Balance" value={`₹${(cards.balance || 0).toLocaleString()}`} icon={<DollarSign size={20} />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Pending Payments" value={String(cards.pendingCount || 0)} icon={<Users size={20} />} iconBg="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Monthly Revenue Trend */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Monthly Collection Trend</CardTitle>
            <Badge variant="emerald"><BarChart2 size={12} className="inline mr-1" />Live</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₹${v.toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="#d1fae5" name="Income" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="#fee2e2" name="Expenses" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Expenses by Category */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <Badge variant="blue"><PieIcon size={12} className="inline mr-1" />Breakdown</Badge>
          </CardHeader>
          {pieData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No expense data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Summary Table */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Income vs Expenses Summary</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium text-right">Collections</th>
                <th className="pb-2 font-medium text-right">Expenses</th>
                <th className="pb-2 font-medium text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyTrend.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No data available</td></tr>
              ) : (
                monthlyTrend.map((row: any) => {
                  const net = (row.income || 0) - (row.expenses || 0);
                  return (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-700">{row.month}</td>
                      <td className="py-3 text-right text-emerald-600 font-semibold">₹{(row.income || 0).toLocaleString()}</td>
                      <td className="py-3 text-right text-red-500 font-semibold">₹{(row.expenses || 0).toLocaleString()}</td>
                      <td className={`py-3 text-right font-bold ${net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {net >= 0 ? '+' : ''}₹{net.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FinanceReportsPage;
