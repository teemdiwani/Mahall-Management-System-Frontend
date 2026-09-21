import React, { useState } from 'react';
import { UserCheck, Search, Plus, Loader2, Phone, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { madrasaApi } from '../../../api/domainApis';

const TeachersPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', qualification: '', subjects: '', joiningDate: new Date().toISOString().split('T')[0] });

  const { data, isLoading } = useQuery({ queryKey: ['madrasa-teachers'], queryFn: madrasaApi.listTeachers });
  const { data: classesData } = useQuery({ queryKey: ['madrasa-classes'], queryFn: madrasaApi.listClasses });

  const create = useMutation({
    mutationFn: (d: any) => madrasaApi.createTeacher({ ...d, subjects: d.subjects.split(',').map((s: string) => s.trim()).filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['madrasa-teachers'] }); setShowCreate(false); },
  });

  const updateTeacher = useMutation({
    mutationFn: ({ id, data }: any) => madrasaApi.updateTeacher(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['madrasa-teachers'] }),
  });

  const teachers = (data?.data || []) as any[];
  const classes = (classesData?.data || []) as any[];
  const filtered = teachers.filter((t: any) => !search || t.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Teachers"
        subtitle="Madrasa faculty directory, qualifications and class assignments"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Teachers' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Add Teacher</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Teachers" value={String(teachers.length)} icon={<UserCheck size={20} />} />
        <StatCard label="Active" value={String(teachers.filter((t: any) => t.status === 'ACTIVE').length)} icon={<UserCheck size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Classes" value={String(classes.length)} icon={<BookOpen size={20} />} iconBg="bg-blue-50 text-blue-600" />
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-gray-400"><UserCheck size={40} className="mx-auto mb-3 opacity-30" /><p>No teachers found</p></div>
          ) : (
            filtered.map((t: any) => (
              <div key={t._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar name={t.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 truncate">{t.name}</p>
                      <Badge variant={t.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">{t.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{t.qualification}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                  <p><Phone size={11} className="inline mr-1.5 text-gray-400" />{t.phone}</p>
                  {t.email && <p>✉️ {t.email}</p>}
                  {t.subjects?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {t.subjects.map((s: string) => <Badge key={s} variant="blue" size="sm">{s}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1"
                    onClick={() => updateTeacher.mutate({ id: t._id, data: { status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } })}>
                    {t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Teacher">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Teacher's name"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="email@..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Qualification *</label>
            <input value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))}
              placeholder="e.g. Aalim, Hafiz, BA Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subjects (comma separated)</label>
            <input value={form.subjects} onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))}
              placeholder="e.g. Quran, Fiqh, Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Joining Date</label>
            <input type="date" value={form.joiningDate} onChange={e => setForm(p => ({ ...p, joiningDate: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => create.mutate(form)}
              disabled={create.isPending || !form.name || !form.phone || !form.qualification}>
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
