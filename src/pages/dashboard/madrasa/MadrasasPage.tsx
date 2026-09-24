import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Users, UserCheck, Plus, Search,
  Clock, Loader2, Edit, ChevronRight
} from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasasPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    regNumber: '',
    board: 'Samastha Kerala Islam Matha Vidyabhyasa Board',
    location: '',
    establishedYear: 2000,
    sadarUsthad: '',
    phone: '',
    email: '',
    timings: '06:30 AM – 08:30 AM',
    status: 'ACTIVE',
    description: '',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });

  const createMutation = useMutation({
    mutationFn: madrasaApi.createMadrasa,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-institutions'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => madrasaApi.updateMadrasa(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-institutions'] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowModal(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      code: '',
      regNumber: '',
      board: 'Samastha Kerala Islam Matha Vidyabhyasa Board',
      location: '',
      establishedYear: 2000,
      sadarUsthad: '',
      phone: '',
      email: '',
      timings: '06:30 AM – 08:30 AM',
      status: 'ACTIVE',
      description: '',
    });
  };

  const openEdit = (m: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(m._id);
    setForm({
      name: m.name || '',
      code: m.code || '',
      regNumber: m.regNumber || '',
      board: m.board || 'Samastha Kerala Islam Matha Vidyabhyasa Board',
      location: m.location || '',
      establishedYear: m.establishedYear || 2000,
      sadarUsthad: m.sadarUsthad || '',
      phone: m.phone || '',
      email: m.email || '',
      timings: m.timings || '06:30 AM – 08:30 AM',
      status: m.status || 'ACTIVE',
      description: m.description || '',
    });
    setShowModal(true);
  };

  const madrasas = (data?.data || []) as any[];
  const filtered = madrasas.filter(
    (m: any) =>
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.code?.toLowerCase().includes(search.toLowerCase()) ||
      m.location?.toLowerCase().includes(search.toLowerCase()) ||
      m.sadarUsthad?.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = madrasas.reduce((sum, m) => sum + (m.studentCount || 0), 0);
  const totalUsthads = madrasas.reduce((sum, m) => sum + (m.usthadCount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahallu Madrasas Directory"
        subtitle="Institutions, branch units, board affiliations and academic operations"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'All Madrasas' }]}
        action={
          canManage ? (
            <Button
              icon={<Plus size={16} />}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              Add New Madrasa
            </Button>
          ) : undefined
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Madrasas"
          value={String(madrasas.length)}
          icon={<Building2 size={20} />}
          change="Institutions in Mahallu"
          changeType="up"
        />
        <StatCard
          label="Total Students"
          value={String(totalStudents)}
          icon={<Users size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          change="Across all units"
          changeType="up"
        />
        <StatCard
          label="Total Teaching Usthad"
          value={String(totalUsthads)}
          icon={<UserCheck size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          change="Sadar & Mudarris staff"
          changeType="up"
        />
        <StatCard
          label="Active Institutions"
          value={String(madrasas.filter((m) => m.status === 'ACTIVE').length)}
          icon={<Building2 size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Operational Units"
          changeType="up"
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by madrasa name, ward, or Sadar Usthad..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Madrasa Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-700">No Madrasas found</p>
          <p className="text-xs text-gray-400 mt-1">Add your Mahallu's madrasa institutions using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m: any) => (
            <div
              key={m._id}
              onClick={() => navigate(`/app/madrasa/${m._id}`)}
              className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base">
                        {m.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">{m.code}</p>
                    </div>
                  </div>
                  <Badge variant={m.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                    {m.status}
                  </Badge>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-gray-600">
                  <p className="text-emerald-700 font-medium">
                    <strong>Sadar Usthad:</strong> {m.sadarUsthad}
                  </p>
                  <p className="text-gray-500">📍 {m.location}</p>
                  <p className="text-gray-500">🏛️ {m.board}</p>
                  {m.timings && (
                    <p className="text-gray-500">
                      <Clock size={11} className="inline mr-1 text-gray-400" />
                      {m.timings}
                    </p>
                  )}
                </div>

                {/* Stat Chips */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-emerald-50/60 rounded-lg p-2">
                    <p className="text-[10px] text-emerald-800 font-semibold uppercase">Students</p>
                    <p className="text-base font-extrabold text-emerald-700">{m.studentCount || 0}</p>
                  </div>
                  <div className="bg-blue-50/60 rounded-lg p-2">
                    <p className="text-[10px] text-blue-800 font-semibold uppercase">Usthads</p>
                    <p className="text-base font-extrabold text-blue-700">{m.usthadCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Students & Usthad Faculty <ChevronRight size={14} />
                </span>
                {canManage && (
                  <button
                    onClick={(e) => openEdit(m, e)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Madrasa Details"
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Madrasa Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? 'Edit Madrasa Institution' : 'Add New Madrasa in Mahallu'}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Madrasa Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Al-Noor Central Madrasa"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Institution Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. MDR-01"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Registration #</label>
              <input
                value={form.regNumber}
                onChange={(e) => setForm((p) => ({ ...p, regNumber: e.target.value }))}
                placeholder="e.g. SKIMVB-412"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Board Affiliation *</label>
            <input
              value={form.board}
              onChange={(e) => setForm((p) => ({ ...p, board: e.target.value }))}
              placeholder="e.g. Samastha Kerala Islam Matha Vidyabhyasa Board"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Ward *</label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Central Ward, Masjid Complex"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sadar Usthad (Headmaster) *</label>
              <input
                value={form.sadarUsthad}
                onChange={(e) => setForm((p) => ({ ...p, sadarUsthad: e.target.value }))}
                placeholder="Chief Usthad's Name"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone *</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="madrasa@mahallconnect.org"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Class Timings</label>
              <input
                value={form.timings}
                onChange={(e) => setForm((p) => ({ ...p, timings: e.target.value }))}
                placeholder="06:30 AM – 08:30 AM"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Madrasa details, student capacity or facilities..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                if (editingId) {
                  updateMutation.mutate({ id: editingId, payload: form });
                } else {
                  createMutation.mutate(form);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending || !form.name || !form.code || !form.sadarUsthad}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 size={14} className="animate-spin mr-2" />
              )}
              {editingId ? 'Update Madrasa' : 'Create Madrasa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasasPage;
