import React, { useState } from 'react';
import { UserCheck, Search, Plus, Loader2, Phone, Building2, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const TeachersPage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [madrasaFilter, setMadrasaFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: '',
    madrasaId: '',
    designation: 'Mudarris (Usthad)',
    phone: '',
    email: '',
    qualification: '',
    subjects: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-teachers', madrasaFilter],
    queryFn: () => madrasaApi.listTeachers({ madrasaId: madrasaFilter || undefined }),
  });

  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });

  const create = useMutation({
    mutationFn: (d: any) =>
      madrasaApi.createTeacher({
        ...d,
        subjects: d.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-teachers'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowCreate(false);
      setForm({
        name: '',
        madrasaId: '',
        designation: 'Mudarris (Usthad)',
        phone: '',
        email: '',
        qualification: '',
        subjects: '',
        joiningDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  const updateTeacher = useMutation({
    mutationFn: ({ id, data }: any) => madrasaApi.updateTeacher(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-teachers'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
    },
  });

  const teachers = (data?.data || []) as any[];
  const madrasas = (madrasasData?.data || []) as any[];

  const filtered = teachers.filter((t: any) => {
    const matchesSearch =
      !search ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.designation?.toLowerCase().includes(search.toLowerCase()) ||
      t.qualification?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const sadarCount = teachers.filter(
    (t: any) => t.designation?.toLowerCase().includes('sadar') || t.designation?.toLowerCase().includes('head')
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usthad Faculty Directory"
        subtitle="Madrasa teaching faculty, qualifications, and assigned institutions under this Mahallu"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Teachers' }]}
        action={
          canManage ? (
            <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
              Add Usthad
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Teachers" value={String(teachers.length)} icon={<UserCheck size={20} />} />
        <StatCard
          label="Active Faculty"
          value={String(teachers.filter((t: any) => t.status === 'ACTIVE').length)}
          icon={<UserCheck size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total Madrasas"
          value={String(madrasas.length)}
          icon={<Building2 size={20} />}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Sadar Usthads"
          value={String(sadarCount)}
          icon={<Award size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          change="Headmasters"
          changeType="neutral"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers by name, designation, qualification..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none"
          />
        </div>
        <select
          value={madrasaFilter}
          onChange={(e) => setMadrasaFilter(e.target.value)}
          className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Madrasas in Mahallu</option>
          {madrasas.map((m: any) => (
            <option key={m._id} value={m._id}>
              {m.name} ({m.code})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={28} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-gray-400">
              <UserCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p>No teachers found</p>
            </div>
          ) : (
            filtered.map((t: any) => (
              <div
                key={t._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <Avatar name={t.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{t.name}</p>
                        <Badge variant={t.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                          {t.status}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">{t.designation || 'Mudarris'}</p>
                      <p className="text-xs text-gray-500">{t.qualification}</p>
                      {t.madrasaId && (
                        <p className="text-[11px] text-gray-600 font-medium mt-1 flex items-center gap-1">
                          <Building2 size={11} className="text-gray-400" />
                          {t.madrasaId.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p>
                      <Phone size={11} className="inline mr-1.5 text-gray-400" />
                      {t.phone}
                    </p>
                    {t.email && <p>✉️ {t.email}</p>}
                    {t.subjects?.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {t.subjects.map((s: string) => (
                          <Badge key={s} variant="blue" size="sm">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  {canManage && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        updateTeacher.mutate({
                          id: t._id,
                          data: { status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
                        })
                      }
                    >
                      {t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Usthad to Faculty">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Usthad's name"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Madrasa</label>
              <select
                value={form.madrasaId}
                onChange={(e) => setForm((p) => ({ ...p, madrasaId: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              >
                <option value="">Select Madrasa</option>
                {madrasas.map((m: any) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
              <input
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="e.g. Mudarris, Sadar Usthad"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="email@..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Qualification *</label>
            <input
              value={form.qualification}
              onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))}
              placeholder="e.g. Faizy, Aalim, Hafiz, BA Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subjects (comma separated)</label>
            <input
              value={form.subjects}
              onChange={(e) => setForm((p) => ({ ...p, subjects: e.target.value }))}
              placeholder="e.g. Quran, Fiqh, Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => create.mutate(form)}
              disabled={create.isPending || !form.name || !form.phone || !form.qualification}
            >
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Add Teacher
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeachersPage;
