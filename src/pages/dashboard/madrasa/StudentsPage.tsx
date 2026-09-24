import React, { useState } from 'react';
import { Users, Search, Plus, Loader2, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const StudentsPage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [madrasaFilter, setMadrasaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: '',
    madrasaId: '',
    gender: 'MALE',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['madrasa-students', madrasaFilter, statusFilter, search],
    queryFn: () =>
      madrasaApi.listStudents({
        madrasaId: madrasaFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });

  const create = useMutation({
    mutationFn: madrasaApi.createStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-students'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowCreate(false);
      setForm({
        name: '',
        madrasaId: '',
        gender: 'MALE',
        dateOfBirth: '',
        guardianName: '',
        guardianPhone: '',
      });
    },
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }: any) => madrasaApi.updateStudent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-students'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
    },
  });

  const students = (studentsData?.data?.items || studentsData?.data || []) as any[];
  const madrasas = (madrasasData?.data || []) as any[];
  const total = studentsData?.data?.total || students.length;

  const maleCount = students.filter((s) => s.gender === 'MALE').length;
  const femaleCount = students.filter((s) => s.gender === 'FEMALE').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Madrasa Students Roster"
        subtitle="Learner enrollments across Mahallu madrasas and guardian contacts"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Students' }]}
        action={
          canManage ? (
            <Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
              Enroll Student
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={String(total)} icon={<Users size={20} />} />
        <StatCard
          label="Active Students"
          value={String(students.filter((s) => s.status === 'ACTIVE').length)}
          icon={<Users size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Madrasas"
          value={String(madrasas.length)}
          icon={<Building2 size={20} />}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Gender Ratio"
          value={`${maleCount}B : ${femaleCount}G`}
          icon={<Users size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          change="Boys vs Girls"
          changeType="neutral"
        />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, adm #, guardian..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none"
            />
          </div>
          <select
            value={madrasaFilter}
            onChange={(e) => setMadrasaFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400"
          >
            <option value="">All Madrasas</option>
            {madrasas.map((m: any) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400"
          >
            <option value="">All Statuses</option>
            {['ACTIVE', 'INACTIVE', 'GRADUATED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {students.map((s: any) => (
              <div key={s._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <Avatar name={s.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.admissionNumber}</p>
                    <Badge variant={s.gender === 'MALE' ? 'blue' : 'purple'} size="sm">
                      {s.gender}
                    </Badge>
                    <Badge
                      variant={s.status === 'ACTIVE' ? 'emerald' : s.status === 'GRADUATED' ? 'blue' : 'gray'}
                      size="sm"
                    >
                      {s.status}
                    </Badge>
                    {s.madrasaId?.name && (
                      <Badge variant="gray" size="sm">
                        🏛️ {s.madrasaId.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Guardian: {s.guardianName} ({s.guardianPhone})
                  </p>
                </div>
                {canManage && s.status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStudent.mutate({ id: s._id, data: { status: 'GRADUATED' } })}
                  >
                    Graduate
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Enroll New Student">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Madrasa *</label>
            <select
              value={form.madrasaId}
              onChange={(e) => setForm((p) => ({ ...p, madrasaId: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
            >
              <option value="">Select Madrasa Institution</option>
              {madrasas.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Student Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Guardian Name *</label>
              <input
                value={form.guardianName}
                onChange={(e) => setForm((p) => ({ ...p, guardianName: e.target.value }))}
                placeholder="Parent/Guardian name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Guardian Phone *</label>
              <input
                value={form.guardianPhone}
                onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => create.mutate(form)}
              disabled={create.isPending || !form.name || !form.madrasaId || !form.guardianName}
            >
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Enroll Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsPage;
