import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Users, Plus, Edit2, Trash2,
  CheckCircle2, Search, ArrowLeft, School,
  Sparkles, AlertCircle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasaClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>('');
  const [selectedStandardFilter, setSelectedStandardFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  const [form, setForm] = useState({
    madrasaId: '',
    name: '',
    standard: 1,
    division: 'A',
    academicYear: '2026-2027',
    usthadInCharge: '',
    roomNumber: '',
    maxCapacity: 35,
    status: 'ACTIVE',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch madrasas
  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });

  const madrasas = madrasasData?.data || [];
  const activeMadrasaId = selectedMadrasaId || (madrasas[0]?._id ? String(madrasas[0]._id) : '');

  // Fetch classes
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['madrasa-classes', activeMadrasaId],
    queryFn: () => madrasaApi.listClasses({ madrasaId: activeMadrasaId || undefined }),
    enabled: true,
  });

  const classes = classesData?.data || [];

  const createClassMutation = useMutation({
    mutationFn: (data: any) => madrasaApi.createClass(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-classes'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => madrasaApi.updateClass(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-classes'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setEditingClass(null);
      resetForm();
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: string) => madrasaApi.deleteClass(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-classes'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
    },
  });

  const resetForm = () => {
    setForm({
      madrasaId: activeMadrasaId,
      name: '',
      standard: 1,
      division: 'A',
      academicYear: '2026-2027',
      usthadInCharge: '',
      roomNumber: '',
      maxCapacity: 35,
      status: 'ACTIVE',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setForm((p) => ({ ...p, madrasaId: activeMadrasaId }));
    setShowAddModal(true);
  };

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setForm({
      madrasaId: cls.madrasaId?._id || cls.madrasaId,
      name: cls.name,
      standard: cls.standard,
      division: cls.division,
      academicYear: cls.academicYear,
      usthadInCharge: cls.usthadInCharge || '',
      roomNumber: cls.roomNumber || '',
      maxCapacity: cls.maxCapacity || 35,
      status: cls.status || 'ACTIVE',
    });
  };

  const filteredClasses = classes.filter((c: any) => {
    if (selectedStandardFilter !== 'ALL' && c.standard !== Number(selectedStandardFilter)) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.usthadInCharge && c.usthadInCharge.toLowerCase().includes(q)) ||
        (c.roomNumber && c.roomNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate highest standard configured
  const maxStandard = classes.reduce((max: number, c: any) => Math.max(max, c.standard || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Madrasa Classes & Standards Management"
        subtitle="Configure academic standards (Classes 1 to 10 or 12), divisions, and assign in-charge Usthad"
        breadcrumb={[{ label: 'Madrasa', href: '/app/madrasa' }, { label: 'Classes' }]}
        action={
          canManage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowLeft size={15} />}
                onClick={() => navigate('/app/madrasa')}
              >
                Back to Desk
              </Button>
              <Button
                size="sm"
                icon={<Plus size={15} />}
                onClick={handleOpenAdd}
              >
                Create New Class
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Madrasa Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-gray-500 uppercase mr-1">Madrasa:</span>
          {madrasas.map((m: any) => {
            const isSelected = activeMadrasaId === m._id;
            return (
              <button
                key={m._id}
                onClick={() => setSelectedMadrasaId(m._id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building2 size={14} />
                <span>{m.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-200 text-gray-600'}`}>
                  {m.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stats highlight */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
            Total Classes: <strong>{classes.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-100">
            Highest Standard: <strong>Class {maxStandard || 10}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-gray-500">Filter Standard:</span>
          <button
            onClick={() => setSelectedStandardFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold ${
              selectedStandardFilter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStandardFilter(String(s))}
              className={`px-2.5 py-1 rounded-lg font-semibold ${
                selectedStandardFilter === String(s)
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Std {s}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search class or usthad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 pl-9 pr-3 py-2 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading configured classes...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <School size={36} className="mx-auto text-gray-400 mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No Classes Found</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Click "Create New Class" to add Standards (Class 1 to 10 or 12) for this Madrasa.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((cls: any) => (
            <div
              key={cls._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center font-black border border-emerald-100">
                      <span className="text-[10px] uppercase font-bold text-emerald-600">Class</span>
                      <span className="text-base leading-none">{cls.standard}</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">{cls.name}</h3>
                      <p className="text-xs text-gray-400 font-mono">Division: {cls.division} · {cls.academicYear}</p>
                    </div>
                  </div>
                  <Badge variant={cls.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                    {cls.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <p className="text-emerald-800 font-medium">
                    <strong>In-charge Usthad:</strong> {cls.usthadInCharge || 'Unassigned'}
                  </p>
                  <p className="text-gray-500">
                    Room: <strong>{cls.roomNumber || 'Main Hall'}</strong> · Max Capacity: <strong>{cls.maxCapacity || 35}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Enrolled</p>
                    <p className="text-base font-extrabold text-gray-800">{cls.studentCount || 0}</p>
                  </div>
                  <div className="bg-emerald-50/70 rounded-lg p-2">
                    <p className="text-[10px] text-emerald-800 font-semibold uppercase">Standard</p>
                    <p className="text-base font-extrabold text-emerald-700">Std {cls.standard}</p>
                  </div>
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                    onClick={() => handleEdit(cls)}
                    icon={<Edit2 size={13} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => {
                      if (confirm(`Delete ${cls.name}?`)) {
                        deleteClassMutation.mutate(cls._id);
                      }
                    }}
                    icon={<Trash2 size={13} />}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={showAddModal || !!editingClass}
        onClose={() => {
          setShowAddModal(false);
          setEditingClass(null);
        }}
        title={editingClass ? `Edit ${editingClass.name}` : 'Create New Madrasa Class'}
      >
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Madrasa Institution *</label>
            <select
              value={form.madrasaId}
              onChange={(e) => setForm((p) => ({ ...p, madrasaId: e.target.value }))}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            >
              {madrasas.map((m: any) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Standard (1 to 12) *</label>
              <select
                value={form.standard}
                onChange={(e) => {
                  const std = Number(e.target.value);
                  setForm((p) => ({
                    ...p,
                    standard: std,
                    name: `Class ${std} - ${p.division || 'A'}`,
                  }));
                }}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                  <option key={s} value={s}>
                    Class {s} Standard
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Division *</label>
              <input
                value={form.division}
                onChange={(e) => {
                  const div = e.target.value.toUpperCase();
                  setForm((p) => ({
                    ...p,
                    division: div,
                    name: `Class ${p.standard} - ${div || 'A'}`,
                  }));
                }}
                placeholder="A, B, C..."
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Class Display Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Class 5 - A"
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Usthad In-charge</label>
            <input
              value={form.usthadInCharge}
              onChange={(e) => setForm((p) => ({ ...p, usthadInCharge: e.target.value }))}
              placeholder="e.g. Usthad Abdul Basheer"
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Room Number</label>
              <input
                value={form.roomNumber}
                onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                placeholder="e.g. Room 102"
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Max Capacity</label>
              <input
                type="number"
                value={form.maxCapacity}
                onChange={(e) => setForm((p) => ({ ...p, maxCapacity: Number(e.target.value) }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                setEditingClass(null);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => {
                if (editingClass) {
                  updateClassMutation.mutate({ id: editingClass._id, data: form });
                } else {
                  createClassMutation.mutate(form);
                }
              }}
              disabled={createClassMutation.isPending || updateClassMutation.isPending || !form.name}
            >
              {createClassMutation.isPending || updateClassMutation.isPending ? 'Saving...' : 'Save Class'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaClassesPage;
