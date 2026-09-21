import React, { useState } from 'react';
import { DollarSign, Plus, Loader2, Search, Receipt } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { financeApi } from '../../../api/domainApis';

const CATEGORIES = ['MAINTENANCE', 'SALARY', 'UTILITIES', 'FOOD', 'EVENTS', 'MADRASA', 'WELFARE', 'CONSTRUCTION', 'MISCELLANEOUS'];
const CAT_COLORS: Record<string, any> = {
  MAINTENANCE: 'amber', SALARY: 'blue', UTILITIES: 'purple', FOOD: 'emerald',
  EVENTS: 'teal', MADRASA: 'indigo', WELFARE: 'red', CONSTRUCTION: 'orange', MISCELLANEOUS: 'gray',
};

const ExpensesPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: 'MISCELLANEOUS', date: new Date().toISOString().split('T')[0], vendor: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['finance-expenses', categoryFilter],
    queryFn: () => financeApi.listExpenses({ category: categoryFilter || undefined }),
  });

  const create = useMutation({
    mutationFn: financeApi.recordExpense,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-expenses'] }); setShowCreate(false); },
  });

  const expenses = (data?.data?.items || data?.data || []) as any[];
  const filtered = expenses.filter((e: any) =>
    !search || e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.vendor?.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = expenses
    .filter((e: any) => new Date(e.date || e.createdAt).getMonth() === new Date().getMonth())
    .reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const total = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track and manage all operational expenses"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Finance' }, { label: 'Expenses' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Record Expense</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Expenses" value={`₹${total.toLocaleString()}`} icon={<DollarSign size={20} />} iconBg="bg-red-50 text-red-600" />
        <StatCard label="This Month" value={`₹${totalThisMonth.toLocaleString()}`} icon={<Receipt size={20} />} iconBg="bg-amber-50 text-amber-600" />
        <StatCard label="Records" value={String(expenses.length)} icon={<Receipt size={20} />} />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expenses..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><Receipt size={40} className="mx-auto mb-3 opacity-30" /><p>No expenses found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((e: any) => (
              <div key={e._id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Receipt size={16} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{e.description}</p>
                    <Badge variant={CAT_COLORS[e.category] || 'gray'} size="sm">{e.category}</Badge>
                  </div>
                  {e.vendor && <p className="text-xs text-gray-500 mt-0.5">Vendor: {e.vendor}</p>}
                  <p className="text-xs text-gray-400">{new Date(e.date || e.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-red-600">₹{(e.amount || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Record Expense">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What was purchased/paid?"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendor / Supplier</label>
            <input value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} placeholder="Vendor name"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => create.mutate({ ...form, amount: Number(form.amount) })}
              disabled={create.isPending || !form.description || !form.amount}>
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
