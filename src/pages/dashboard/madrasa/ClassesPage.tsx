import React, { useState } from 'react';
import { BookOpen, Plus, Loader2, Users, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';

const ClassesPage: React.FC = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editClass, setEditClass] = useState<any>(null);
  const [form, setForm] = useState({ name: '', grade: '', teacherName: '', capacity: '30', roomNumber: '', academicYear: '2026-2027' });

  const { data, isLoading } = useQuery({ queryKey: ['madrasa-classes'], queryFn: madrasaApi.listClasses });
  const { data: studentsData } = useQuery({ queryKey: ['madrasa-students'], queryFn: () => madrasaApi.listStudents({ limit: 500 }) });

  const create = useMutation({
    mutationFn: madrasaApi.createClass,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['madrasa-classes'] }); setShowCreate(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: any) => madrasaApi.updateClass(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['madrasa-classes'] }); setEditClass(null); },
  });

  const deleteClass = useMutation({
    mutationFn: madrasaApi.deleteClass,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['madrasa-classes'] }),
  });

  const classes = (data?.data || []) as any[];
  const students = (studentsData?.data?.items || studentsData?.data || []) as any[];

  const studentsPerClass: Record<string, number> = {};
  students.forEach((s: any) => {
    const cid = s.classId?._id || s.classId;
    if (cid) studentsPerClass[cid] = (studentsPerClass[cid] || 0) + 1;
  });

  const openEdit = (cls: any) => {
    setEditClass(cls);
    setForm({ name: cls.name, grade: cls.grade, teacherName: cls.teacherName, capacity: String(cls.capacity), roomNumber: cls.roomNumber || '', academicYear: cls.academicYear });
  };

  const formFields = (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class Name *</label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Class 1 - Qaida"
            className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grade *</label>
          <input value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} placeholder="e.g. Level 1, Grade 3"
            className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Teacher Name *</label>
        <input value={form.teacherName} onChange={e => setForm(p => ({ ...p, teacherName: e.target.value }))} placeholder="Assigned teacher"
          className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
          <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
            className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Room No.</label>
          <input value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} placeholder="e.g. R-01"
            className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
          <input value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))}
            className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Class allocations, capacities, teacher assignments and room numbers"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Classes' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => { setForm({ name: '', grade: '', teacherName: '', capacity: '30', roomNumber: '', academicYear: '2026-2027' }); setShowCreate(true); }}>Add Class</Button>}
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Classes" value={String(classes.length)} icon={<BookOpen size={20} />} />
        <StatCard label="Total Students" value={String(students.length)} icon={<Users size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
      ) : classes.length === 0 ? (
        <div className="py-16 text-center text-gray-400"><BookOpen size={40} className="mx-auto mb-3 opacity-30" /><p>No classes added yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls: any) => {
            const enrolled = studentsPerClass[cls._id] || 0;
            const pct = cls.capacity ? Math.min(100, (enrolled / cls.capacity) * 100) : 0;
            return (
              <Card key={cls._id} padding="md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{cls.name}</p>
                    <Badge variant="blue" size="sm" className="mt-1">{cls.grade}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(cls)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteClass.mutate(cls._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  <p>👨‍🏫 {cls.teacherName}</p>
                  {cls.roomNumber && <p>🚪 Room: {cls.roomNumber}</p>}
                  <p>📅 {cls.academicYear}</p>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Enrollment</span>
                    <span className="font-semibold text-gray-700">{enrolled} / {cls.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Class">
        {formFields}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button className="flex-1" onClick={() => create.mutate({ ...form, capacity: Number(form.capacity) })}
            disabled={create.isPending || !form.name || !form.teacherName}>
            {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Create Class
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editClass} onClose={() => setEditClass(null)} title="Edit Class">
        {formFields}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={() => setEditClass(null)}>Cancel</Button>
          <Button className="flex-1" onClick={() => update.mutate({ id: editClass._id, data: { ...form, capacity: Number(form.capacity) } })}
            disabled={update.isPending}>
            {update.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClassesPage;
