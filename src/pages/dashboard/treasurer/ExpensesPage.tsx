import React, { useState } from 'react';
import { DollarSign, Plus, Loader2, Search, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'MAINTENANCE',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['finance-expenses', categoryFilter],
    queryFn: () => financeApi.listExpenses({ category: categoryFilter || undefined }),
  });

  const create = useMutation({
    mutationFn: (payload: any) => financeApi.recordExpense(payload),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['finance-expenses'] });
      qc.invalidateQueries({ queryKey: ['finance-overview'] });
      qc.invalidateQueries({ queryKey: ['treasurer-dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setShowCreate(false);
      setSuccessMsg(`Expense "${res?.data?.title || form.title || 'Voucher'}" recorded successfully in database!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      setForm({
        title: '',
        description: '',
        amount: '',
        category: 'MAINTENANCE',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
      });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.message || err?.message || 'Failed to record expense');
    },
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

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
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
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{formError}</p>
          </div>
          <button onClick={() => setFormError(null)} className="text-xs font-bold text-red-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

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
                    <p className="font-semibold text-sm text-gray-800">{e.title || e.description}</p>
                    <Badge variant={CAT_COLORS[e.category] || 'gray'} size="sm">{e.category}</Badge>
                  </div>
                  {e.description && e.description !== e.title && <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>}
                  {e.vendor && <p className="text-xs text-gray-500 mt-0.5">Vendor: {e.vendor}</p>}
                  <p className="text-xs text-gray-400">{new Date(e.date || e.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-red-600">₹{(e.amount || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Record Expense to MongoDB Ledger">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.title.trim() && !form.description.trim()) {
              setFormError('Expense Title or Description is required');
              return;
            }
            if (!form.amount || Number(form.amount) <= 0) {
              setFormError('Amount must be greater than zero');
              return;
            }
            create.mutate({
              title: form.title.trim() || form.description.trim(),
              description: form.description.trim() || form.title.trim(),
              category: form.category,
              amount: Number(form.amount),
              vendor: form.vendor.trim() || undefined,
              date: form.date,
            });
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Title / Item *</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Mosque Electricity Bill, Madrasa Supplies"
              required
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Detailed Description (Optional)</label>
            <input
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Invoice # or voucher notes"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500 bg-white"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0"
                required
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor / Supplier</label>
              <input
                value={form.vendor}
                onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}
                placeholder="e.g. KSEB, National Cleaners"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                required
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={create.isPending || (!form.title && !form.description) || !form.amount}
            >
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Record Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
