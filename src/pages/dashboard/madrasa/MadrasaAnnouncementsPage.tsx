import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Plus, ArrowLeft, Building2, Trash2,
  Calendar, CheckCircle2, AlertCircle, Users,
  Megaphone, Sparkles, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasaAnnouncementsPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    madrasaId: '',
    title: '',
    content: '',
    category: 'CIRCULAR',
    targetAudience: 'PARENTS',
    classTarget: 'All Classes',
    priority: 'HIGH',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch Madrasas
  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });
  const madrasas = madrasasData?.data || [];
  const activeMadrasaId = selectedMadrasaId || (madrasas[0]?._id ? String(madrasas[0]._id) : '');

  // Fetch Announcements
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ['madrasa-announcements', activeMadrasaId],
    queryFn: () => madrasaApi.listAnnouncements({ madrasaId: activeMadrasaId || undefined }),
    enabled: !!activeMadrasaId,
  });
  const announcements = announcementsData?.data || [];

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: any) => madrasaApi.createAnnouncement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-announcements'] });
      qc.invalidateQueries({ queryKey: ['madrasa-parent-portal'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) => madrasaApi.deleteAnnouncement(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-announcements'] });
      qc.invalidateQueries({ queryKey: ['madrasa-parent-portal'] });
    },
  });

  const resetForm = () => {
    setForm({
      madrasaId: activeMadrasaId,
      title: '',
      content: '',
      category: 'CIRCULAR',
      targetAudience: 'PARENTS',
      classTarget: 'All Classes',
      priority: 'HIGH',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setForm((p) => ({ ...p, madrasaId: activeMadrasaId }));
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Madrasa Circulars & Announcements Desk"
        subtitle="Publish notices, exam alerts, and meeting schedules directly to parents and students"
        breadcrumb={[{ label: 'Madrasa', href: '/app/madrasa' }, { label: 'Announcements' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate('/app/madrasa')}
            >
              Back to Desk
            </Button>
            {canManage && (
              <Button
                size="sm"
                icon={<Plus size={15} />}
                onClick={handleOpenAdd}
              >
                Publish Notice
              </Button>
            )}
          </div>
        }
      />

      {/* Madrasa Selector */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="font-bold text-gray-500 uppercase mr-1">Madrasa:</span>
        {madrasas.map((m: any) => (
          <button
            key={m._id}
            onClick={() => setSelectedMadrasaId(m._id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeMadrasaId === m._id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building2 size={13} />
            <span>{m.name}</span>
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading madrasa circulars...</p>
        </div>
      ) : announcements.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Megaphone size={36} className="mx-auto text-gray-400 mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No Announcements Published</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Click "Publish Notice" to send official notices to parents and students of this Madrasa.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((a: any) => (
            <div
              key={a._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {a.category}
                  </span>
                  <Badge variant={a.priority === 'HIGH' || a.priority === 'URGENT' ? 'red' : 'gray'} size="sm">
                    {a.priority}
                  </Badge>
                </div>

                <h3 className="font-extrabold text-sm text-gray-900 mt-1 leading-snug">{a.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{a.content}</p>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Audience: <strong>{a.targetAudience}</strong></span>
                  <span className="font-medium text-emerald-700">{a.classTarget}</span>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400">
                  {new Date(a.publishedAt).toLocaleDateString()} · {a.publishedBy}
                </span>
                {canManage && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this circular notice?')) {
                        deleteAnnouncementMutation.mutate(a._id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Announcement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Publish Official Madrasa Notice"
      >
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Annual Parent-Teacher Meeting (PTM)"
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              >
                <option value="CIRCULAR">General Circular</option>
                <option value="EXAM">Exam Notice</option>
                <option value="PARENT_MEETING">Parent Meeting (PTM)</option>
                <option value="FEE_ALERT">Fee Notice</option>
                <option value="HOLIDAY">Holiday Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience *</label>
              <select
                value={form.targetAudience}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="PARENTS">Parents Only</option>
                <option value="STUDENTS">Students Only</option>
                <option value="ALL">Everyone (Parents & Students)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Applicable Classes</label>
              <input
                value={form.classTarget}
                onChange={(e) => setForm((p) => ({ ...p, classTarget: e.target.value }))}
                placeholder="e.g. All Classes or Class 5 to 10"
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-bold"
              >
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notice Content *</label>
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder="Enter full notice body for parents and students..."
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => createAnnouncementMutation.mutate(form)}
              disabled={createAnnouncementMutation.isPending || !form.title || !form.content}
            >
              {createAnnouncementMutation.isPending ? 'Publishing...' : 'Publish Notice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaAnnouncementsPage;
