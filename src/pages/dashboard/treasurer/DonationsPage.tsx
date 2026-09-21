import React, { useState } from 'react';
import { Heart, DollarSign, Plus, Loader2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { paymentsApi } from '../../../api/domainApis';

const DONATION_TYPES = ['ZAKAT', 'FITRAH', 'SADAQAH', 'SADAQAH_JARIYAH', 'PROJECT_DONATION', 'GENERAL'];
const TYPE_COLORS: Record<string, any> = {
  ZAKAT: 'amber', FITRAH: 'emerald', SADAQAH: 'blue', SADAQAH_JARIYAH: 'purple',
  PROJECT_DONATION: 'teal', GENERAL: 'gray',
};

const DonationsPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ donorName: '', amount: '', type: 'SADAQAH', description: '', date: new Date().toISOString().split('T')[0] });

  const { data, isLoading } = useQuery({
    queryKey: ['payments', 'donations', typeFilter],
    queryFn: () => paymentsApi.list({ type: typeFilter || undefined, category: 'donation' }),
  });

  const create = useMutation({
    mutationFn: (d: any) => paymentsApi.create({ ...d, status: 'PAID', category: 'donation' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments', 'donations'] }); setShowCreate(false); },
  });

  const donations = (data?.data?.items || data?.data || []) as any[];
  const filtered = donations.filter((d: any) =>
    !search || d.memberName?.toLowerCase().includes(search.toLowerCase()) ||
    d.donorName?.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalThisMonth = donations
    .filter((d: any) => new Date(d.createdAt).getMonth() === new Date().getMonth())
    .reduce((s: number, d: any) => s + (d.amount || 0), 0);

  const total = donations.reduce((s: number, d: any) => s + (d.amount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Donations"
        subtitle="Zakat, Fitrah, Sadaqah and project donations"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Finance' }, { label: 'Donations' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Record Donation</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Donations" value={`₹${total.toLocaleString()}`} icon={<DollarSign size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="This Month" value={`₹${totalThisMonth.toLocaleString()}`} icon={<Heart size={20} />} iconBg="bg-amber-50 text-amber-600" />
        <StatCard label="Records" value={String(donations.length)} icon={<Heart size={20} />} />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search donations..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Types</option>
            {DONATION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><Heart size={40} className="mx-auto mb-3 opacity-30" /><p>No donations found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((d: any) => (
              <div key={d._id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{d.donorName || d.memberName || 'Anonymous'}</p>
                    <Badge variant={TYPE_COLORS[d.type] || 'gray'} size="sm">{(d.type || '').replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                  <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-emerald-700">₹{(d.amount || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Record Donation">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Donor Name</label>
            <input value={form.donorName} onChange={e => setForm(p => ({ ...p, donorName: e.target.value }))} placeholder="Full name (or Anonymous)"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Donation Type *</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                {DONATION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Purpose or notes"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => create.mutate({ ...form, amount: Number(form.amount), memberName: form.donorName })}
              disabled={create.isPending || !form.amount || !form.type}>
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DonationsPage;
