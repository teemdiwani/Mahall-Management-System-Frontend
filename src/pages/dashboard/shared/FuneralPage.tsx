import React, { useState } from 'react';
import { Search, Plus, Loader2, MapPin, User, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { funeralApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const STATUS_COLOR: Record<string, any> = { REPORTED: 'amber', ARRANGED: 'blue', COMPLETED: 'emerald' };

const FuneralPage: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    deceasedName: '', age: '', contactPerson: '', contactPhone: '',
    dateOfDeath: new Date().toISOString().split('T')[0],
    janaazahTime: '', janaazahPlace: 'Al-Noor Central Masjid', cemeteryPlotNumber: '',
  });

  const canManage = ['super_admin', 'secretary', 'imam'].includes((user?.role || '').toLowerCase());

  const { data, isLoading } = useQuery({
    queryKey: ['funeral-records'],
    queryFn: funeralApi.list,
  });

  const create = useMutation({
    mutationFn: funeralApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funeral-records'] }); setShowCreate(false); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, plotNumber }: any) => funeralApi.updateStatus(id, status, plotNumber),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['funeral-records'] }),
  });

  const records = (data?.data || []) as any[];
  const filtered = records.filter((r: any) =>
    !search || r.deceasedName?.toLowerCase().includes(search.toLowerCase()) ||
    r.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const reported = records.filter((r: any) => r.status === 'REPORTED').length;
  const completed = records.filter((r: any) => r.status === 'COMPLETED').length;

  return (
    <div>
      <PageHeader
        title="Funeral & Burial Records"
        subtitle="Janazah announcements, cemetery plot management and burial records"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Funeral' }]}
        action={canManage ? <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Register Death</Button> : undefined}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Records" value={String(records.length)} icon={<User size={20} />} />
        <StatCard label="Pending Arrangements" value={String(reported)} icon={<Phone size={20} />} iconBg="bg-amber-50 text-amber-600" />
        <StatCard label="Completed" value={String(completed)} icon={<MapPin size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><p className="text-4xl mb-3">🕌</p><p>No funeral records found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((r: any) => (
              <div key={r._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{r.deceasedName}</p>
                      <p className="text-sm text-gray-500">Age {r.age}</p>
                      <Badge variant={STATUS_COLOR[r.status] || 'gray'}>{r.status}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>📅 Date of Death: {new Date(r.dateOfDeath).toLocaleDateString()}</span>
                      <span>🕌 Janaazah: {r.janaazahTime} at {r.janaazahPlace}</span>
                      <span>👤 Contact: {r.contactPerson} ({r.contactPhone})</span>
                      {r.cemeteryPlotNumber && <span>📍 Plot: {r.cemeteryPlotNumber}</span>}
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-2 flex-shrink-0">
                      {r.status === 'REPORTED' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: r._id, status: 'ARRANGED' })}>
                          Mark Arranged
                        </Button>
                      )}
                      {r.status === 'ARRANGED' && (
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: r._id, status: 'COMPLETED' })}>
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Register Death Record">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deceased Name *</label>
              <input value={form.deceasedName} onChange={e => setForm(p => ({ ...p, deceasedName: e.target.value }))}
                placeholder="Full name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Age *</label>
              <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                placeholder="Age"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date of Death *</label>
            <input type="date" value={form.dateOfDeath} onChange={e => setForm(p => ({ ...p, dateOfDeath: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person *</label>
              <input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                placeholder="Next of kin name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Contact Phone *</label>
              <input value={form.contactPhone} onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Janaazah Time *</label>
              <input value={form.janaazahTime} onChange={e => setForm(p => ({ ...p, janaazahTime: e.target.value }))}
                placeholder="e.g. After Zuhr"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
              <input value={form.janaazahPlace} onChange={e => setForm(p => ({ ...p, janaazahPlace: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cemetery Plot Number</label>
            <input value={form.cemeteryPlotNumber} onChange={e => setForm(p => ({ ...p, cemeteryPlotNumber: e.target.value }))}
              placeholder="e.g. A-042"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => create.mutate({ ...form, age: Number(form.age) })}
              disabled={create.isPending || !form.deceasedName || !form.age || !form.contactPerson}>
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Register Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FuneralPage;
