import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Clock, Plus, ArrowLeft,
  Building2, School, Trash2, Edit2, CheckCircle2,
  FileText, Sparkles, Loader2, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'];

const MadrasaTimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [showAddPeriodModal, setShowAddPeriodModal] = useState(false);

  const [periodForm, setPeriodForm] = useState({
    day: 'Monday',
    periodNumber: 1,
    timeSlot: '06:30 AM – 07:15 AM',
    subject: '',
    usthadName: '',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch Madrasas
  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });
  const madrasas = madrasasData?.data || [];
  const activeMadrasaId = selectedMadrasaId || (madrasas[0]?._id ? String(madrasas[0]._id) : '');

  // Fetch Classes for active madrasa
  const { data: classesData } = useQuery({
    queryKey: ['madrasa-classes', activeMadrasaId],
    queryFn: () => madrasaApi.listClasses({ madrasaId: activeMadrasaId || undefined }),
    enabled: !!activeMadrasaId,
  });
  const classes = classesData?.data || [];
  const activeClassId = selectedClassId || (classes[0]?._id ? String(classes[0]._id) : '');

  // Fetch Timetable for active class
  const { data: timetableData, isLoading } = useQuery({
    queryKey: ['madrasa-timetable', activeClassId],
    queryFn: () => madrasaApi.getTimetableByClass(activeClassId),
    enabled: !!activeClassId,
  });

  const currentTimetable = timetableData?.data;
  const schedule = currentTimetable?.schedule || [];
  const scheduleForDay = schedule.filter((s: any) => s.day === selectedDay);

  const activeClass = classes.find((c: any) => c._id === activeClassId);

  const saveTimetableMutation = useMutation({
    mutationFn: (data: any) => madrasaApi.saveTimetable(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-timetable', activeClassId] });
      setShowAddPeriodModal(false);
      setPeriodForm({
        day: selectedDay,
        periodNumber: scheduleForDay.length + 1,
        timeSlot: '07:15 AM – 07:55 AM',
        subject: '',
        usthadName: '',
      });
    },
  });

  const handleAddPeriod = () => {
    const updatedSchedule = [...schedule, periodForm];
    saveTimetableMutation.mutate({
      _id: currentTimetable?._id,
      madrasaId: activeMadrasaId,
      classId: activeClassId,
      className: activeClass?.name || 'Class',
      title: `${activeClass?.name || 'Class'} Academic Timetable`,
      schedule: updatedSchedule,
      notes: currentTimetable?.notes || 'Standard Mahallu Madrasa Schedule.',
    });
  };

  const handleDeletePeriod = (day: string, periodNumber: number) => {
    const updatedSchedule = schedule.filter((s: any) => !(s.day === day && s.periodNumber === periodNumber));
    saveTimetableMutation.mutate({
      _id: currentTimetable?._id,
      madrasaId: activeMadrasaId,
      classId: activeClassId,
      className: activeClass?.name || 'Class',
      schedule: updatedSchedule,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class-wise Madrasa Timetable Desk"
        subtitle="Upload and manage weekly academic schedules, period timings, and assigned Usthad per standard"
        breadcrumb={[{ label: 'Madrasa', href: '/app/madrasa' }, { label: 'Timetables' }]}
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
            {canManage && activeClassId && (
              <Button
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => {
                  setPeriodForm((p) => ({ ...p, day: selectedDay, periodNumber: scheduleForDay.length + 1 }));
                  setShowAddPeriodModal(true);
                }}
              >
                Add Period
              </Button>
            )}
          </div>
        }
      />

      {/* Madrasa & Class Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-4">
        {/* Madrasa Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-gray-500 uppercase">Madrasa:</span>
          {madrasas.map((m: any) => (
            <button
              key={m._id}
              onClick={() => {
                setSelectedMadrasaId(m._id);
                setSelectedClassId('');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeMadrasaId === m._id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.name} ({m.code})
            </button>
          ))}
        </div>

        {/* Classes Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-gray-100 pt-3 text-xs">
          <span className="font-bold text-gray-500 uppercase">Select Class:</span>
          {classes.length === 0 ? (
            <span className="text-gray-400">No classes configured. Please create classes first.</span>
          ) : (
            classes.map((c: any) => (
              <button
                key={c._id}
                onClick={() => setSelectedClassId(c._id)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeClassId === c._id
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Timetable Workspace */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading timetable...</p>
        </div>
      ) : !activeClassId ? (
        <Card padding="lg" className="text-center py-12">
          <p className="text-sm font-semibold text-gray-700">Please select a class to view its timetable.</p>
        </Card>
      ) : (
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {currentTimetable?.title || `${activeClass?.name} Timetable`}
                </h3>
                <Badge variant="emerald" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Class In-charge: <strong>{activeClass?.usthadInCharge || 'Usthad Staff'}</strong> · Total Scheduled Periods: <strong>{schedule.length}</strong>
              </p>
            </div>

            {/* Day Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {DAYS.map((day) => {
                const count = schedule.filter((s: any) => s.day === day).length;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedDay === day
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span className={`text-[10px] px-1 rounded ${selectedDay === day ? 'bg-emerald-800 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Periods for selected day */}
          {scheduleForDay.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Calendar size={36} className="mx-auto text-gray-400 mb-2" />
              <h4 className="text-sm font-bold text-gray-800">No Periods Scheduled on {selectedDay}</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {selectedDay === 'Friday'
                  ? 'Friday is traditional madrasa weekend holiday.'
                  : 'Click "Add Period" to schedule Quran, Fiqh, Thareekh or Arabic classes.'}
              </p>
              {canManage && (
                <Button
                  size="sm"
                  className="mt-4"
                  icon={<Plus size={14} />}
                  onClick={() => {
                    setPeriodForm((p) => ({ ...p, day: selectedDay, periodNumber: 1 }));
                    setShowAddPeriodModal(true);
                  }}
                >
                  Schedule First Period for {selectedDay}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheduleForDay.map((p: any) => (
                <div
                  key={`${p.day}-${p.periodNumber}`}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all relative group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] uppercase">
                        Period {p.periodNumber}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-500 flex items-center gap-1">
                        <Clock size={12} className="text-emerald-600" />
                        {p.timeSlot}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-gray-900 mt-2">{p.subject}</h4>
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Usthad: <strong>{p.usthadName}</strong>
                    </p>
                  </div>

                  {canManage && (
                    <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-end">
                      <button
                        onClick={() => handleDeletePeriod(p.day, p.periodNumber)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={12} /> Remove Period
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Add Period Modal */}
      <Modal
        isOpen={showAddPeriodModal}
        onClose={() => setShowAddPeriodModal(false)}
        title={`Add Timetable Period for ${activeClass?.name} (${selectedDay})`}
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Day *</label>
              <select
                value={periodForm.day}
                onChange={(e) => setPeriodForm((p) => ({ ...p, day: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Period Number *</label>
              <input
                type="number"
                value={periodForm.periodNumber}
                onChange={(e) => setPeriodForm((p) => ({ ...p, periodNumber: Number(e.target.value) }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Time Slot *</label>
            <input
              value={periodForm.timeSlot}
              onChange={(e) => setPeriodForm((p) => ({ ...p, timeSlot: e.target.value }))}
              placeholder="e.g. 06:30 AM – 07:15 AM"
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name *</label>
            <input
              value={periodForm.subject}
              onChange={(e) => setPeriodForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="e.g. Quran Recitation & Tajweed, Fiqh, Thareekh..."
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Usthad (Teacher) Name *</label>
            <input
              value={periodForm.usthadName}
              onChange={(e) => setPeriodForm((p) => ({ ...p, usthadName: e.target.value }))}
              placeholder="e.g. Usthad Abdul Basheer"
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddPeriodModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={handleAddPeriod}
              disabled={saveTimetableMutation.isPending || !periodForm.subject || !periodForm.usthadName}
            >
              {saveTimetableMutation.isPending ? 'Saving...' : 'Save Period'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaTimetablePage;
