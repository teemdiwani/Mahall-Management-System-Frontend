import React, { useState } from 'react';
import { Heart, Search, Plus, Loader2, Calendar, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { marriageApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const STATUS_COLOR: Record<string, any> = { REQUESTED: 'amber', APPROVED: 'emerald', CONDUCTED: 'blue' };

const MarriagePage: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    groomName: '', brideName: '', officiantedBy: 'Usthad Abdullah Faizy',
    nikahDate: new Date().toISOString().split('T')[0],
    nikahVenue: 'Al-Noor Central Masjid',
  });

  const canManage = ['super_admin', 'secretary', 'imam'].includes((user?.role || '').toLowerCase());

  const { data, isLoading } = useQuery({
    queryKey: ['marriage-records'],
    queryFn: marriageApi.list,
  });

  const create = useMutation({
    mutationFn: marriageApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['marriage-records'] }); setShowCreate(false); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => marriageApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marriage-records'] }),
  });

  const records = (data?.data || []) as any[];
  const filtered = records.filter((r: any) =>
    !search || r.groomName?.toLowerCase().includes(search.toLowerCase()) ||
    r.brideName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Marriage Services"
        subtitle="Nikah registration, ceremony scheduling and marriage certificates"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Marriage' }]}
        action={canManage ? <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>New Nikah Request</Button> : undefined}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Records" value={String(records.length)} icon={<Heart size={20} />} />
        <StatCard label="Pending/Scheduled" value={String(records.filter((r: any) => r.status !== 'CONDUCTED').length)} icon={<Calendar size={20} />} iconBg="bg-amber-50 text-amber-600" />
        <StatCard label="Conducted" value={String(records.filter((r: any) => r.status === 'CONDUCTED').length)} icon={<User size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by groom or bride name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><p className="text-4xl mb-3">💍</p><p>No marriage records found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((r: any) => (
              <div key={r._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{r.groomName} <span className="text-gray-400 font-normal mx-1">×</span> {r.brideName}</p>
                      <Badge variant={STATUS_COLOR[r.status] || 'gray'}>{r.status}</Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>📅 Nikah: {new Date(r.nikahDate).toLocaleDateString()}</span>
                      <span>📍 Venue: {r.nikahVenue}</span>
                      <span>🕌 Officiated by: {r.officiatedBy}</span>
                      {r.certificateNumber && <span>📜 Cert: {r.certificateNumber}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2 flex-shrink-0">
                      {r.status === 'REQUESTED' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: r._id, status: 'APPROVED' })}>
                          Approve
                        </Button>
                      )}
                      {r.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: r._id, status: 'CONDUCTED' })}>
                          Mark Conducted
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Nikah Request">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Groom's Name *</label>
              <input value={form.groomName} onChange={e => setForm(p => ({ ...p, groomName: e.target.value }))}
                placeholder="Full name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Bride's Name *</label>
              <input value={form.brideName} onChange={e => setForm(p => ({ ...p, brideName: e.target.value }))}
                placeholder="Full name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nikah Date *</label>
            <input type="date" value={form.nikahDate} onChange={e => setForm(p => ({ ...p, nikahDate: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Venue *</label>
            <input value={form.nikahVenue} onChange={e => setForm(p => ({ ...p, nikahVenue: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Officiated By *</label>
            <input value={form.officiantedBy} onChange={e => setForm(p => ({ ...p, officiantedBy: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => create.mutate({ ...form, officiatedBy: form.officiantedBy })}
              disabled={create.isPending || !form.groomName || !form.brideName}>
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarriagePage;
