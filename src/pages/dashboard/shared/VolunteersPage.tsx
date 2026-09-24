import React, { useState } from 'react';
import { Users, Search, Plus, Loader2, Heart, Phone, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { volunteersApi } from '../../../api/domainApis';

const CATEGORIES = ['EMERGENCY', 'EVENT', 'WELFARE', 'BLOOD_DONATION', 'GENERAL'];
const CAT_COLORS: Record<string, any> = {
  EMERGENCY: 'red', EVENT: 'blue', WELFARE: 'emerald', BLOOD_DONATION: 'red', GENERAL: 'gray',
};
const AVAILABILITY_OPTIONS = ['WEEKENDS', 'EVENINGS', 'ANYTIME', 'ON_CALL'];

const VolunteersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', bloodGroup: '', skills: '',
    categories: [] as string[], availability: 'ANYTIME', emergencyVolunteer: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['volunteers', categoryFilter, statusFilter],
    queryFn: () => volunteersApi.list({
      category: categoryFilter || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    }),
  });

  const register = useMutation({
    mutationFn: (newVol: any) => volunteersApi.register(newVol),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['volunteers'] });
      setShowRegister(false);
      setForm({
        name: '', phone: '', bloodGroup: '', skills: '',
        categories: [], availability: 'ANYTIME', emergencyVolunteer: false,
      });
    },
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: any) => volunteersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  });

  const volunteers = (data?.data || []) as any[];
  const filtered = volunteers.filter((v: any) =>
    !search || v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search)
  );

  const active = volunteers.filter((v: any) => v.status === 'ACTIVE').length;
  const inactive = volunteers.filter((v: any) => v.status === 'INACTIVE').length;
  const emergency = volunteers.filter((v: any) => v.emergencyVolunteer).length;

  const toggleCategory = (cat: string) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat) ? p.categories.filter(c => c !== cat) : [...p.categories, cat],
    }));
  };

  return (
    <div>
      <PageHeader
        title="Volunteer Management"
        subtitle="Emergency, event, welfare and blood donation volunteers"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Volunteers' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowRegister(true)}>Register Volunteer</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Volunteers" value={String(volunteers.length)} icon={<Users size={20} />} />
        <StatCard label="Active" value={String(active)} icon={<Heart size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Inactive" value={String(inactive)} icon={<Users size={20} />} iconBg="bg-gray-100 text-gray-600" />
        <StatCard label="Emergency Team" value={String(emergency)} icon={<Shield size={20} />} iconBg="bg-red-50 text-red-600" />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search volunteers by name or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>No volunteers found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((v: any) => (
              <div key={v._id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                <Avatar name={v.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{v.name}</p>
                    {v.emergencyVolunteer && <Badge variant="red" size="sm">🚨 Emergency</Badge>}
                    <Badge variant={v.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">{v.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500"><Phone size={10} className="inline mr-1" />{v.phone}</span>
                    {v.bloodGroup && <span className="text-xs text-red-600 font-medium">🩸 {v.bloodGroup}</span>}
                    <span className="text-xs text-gray-400">{v.availability}</span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(v.categories || []).map((cat: string) => (
                      <Badge key={cat} variant={CAT_COLORS[cat] || 'gray'} size="sm">{cat.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="outline"
                  onClick={() => toggleStatus.mutate({ id: v._id, status: v.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}>
                  {v.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Register Volunteer">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                <option value="">Select</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Availability</label>
              <select value={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                {AVAILABILITY_OPTIONS.map(a => <option key={a} value={a}>{a.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Categories *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${form.categories.includes(cat) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-400'}`}>
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Skills / Notes</label>
            <textarea value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
              rows={2} placeholder="First aid, driving, cooking..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400 resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.emergencyVolunteer} onChange={e => setForm(p => ({ ...p, emergencyVolunteer: e.target.checked }))}
              className="w-4 h-4 rounded text-emerald-600" />
            <span className="text-sm text-gray-700">Available for emergency response (24/7)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => register.mutate(form)}
              disabled={register.isPending || !form.name || !form.phone || form.categories.length === 0}>
              {register.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Register
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VolunteersPage;
