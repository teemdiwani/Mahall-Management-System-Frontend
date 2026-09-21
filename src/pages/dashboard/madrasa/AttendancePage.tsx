import React, { useState } from 'react';
import { Calendar, Check, X, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { madrasaApi } from '../../../api/domainApis';

const AttendancePage: React.FC = () => {
  const qc = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const { data: classesData } = useQuery({ queryKey: ['madrasa-classes'], queryFn: madrasaApi.listClasses });
  const { data: studentsData } = useQuery({
    queryKey: ['madrasa-students', selectedClass],
    queryFn: () => madrasaApi.listStudents({ classId: selectedClass || undefined, status: 'ACTIVE', limit: 100 }),
    enabled: !!selectedClass,
  });
  const { data: existingData } = useQuery({
    queryKey: ['madrasa-attendance', selectedClass, selectedDate],
    queryFn: () => madrasaApi.listAttendance({ classId: selectedClass, date: selectedDate }),
    enabled: !!selectedClass && !!selectedDate,
  });

  const classes = (classesData?.data || []) as any[];
  const students = (studentsData?.data?.items || studentsData?.data || []) as any[];
  const existing = (existingData?.data || [])[0];

  // Pre-fill from existing attendance record
  React.useEffect(() => {
    if (existing && students.length > 0) {
      const map: Record<string, boolean> = {};
      (existing.records || []).forEach((r: any) => {
        map[r.studentId?._id || r.studentId] = r.present;
      });
      setAttendance(map);
    } else if (students.length > 0) {
      // Default all present
      const map: Record<string, boolean> = {};
      students.forEach((s: any) => { map[s._id] = true; });
      setAttendance(map);
    }
  }, [existing, students.length, selectedClass, selectedDate]);

  const saveAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    try {
      const records = students.map((s: any) => ({ studentId: s._id, present: attendance[s._id] !== false }));
      await madrasaApi.recordAttendance({ classId: selectedClass, date: selectedDate, records });
      qc.invalidateQueries({ queryKey: ['madrasa-attendance'] });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Record and view daily student attendance by class"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Attendance' }]}
      />

      {/* Controls */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Class</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setAttendance({}); }}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
              <option value="">Choose a class...</option>
              {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name} ({c.grade})</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
        </div>
      </Card>

      {selectedClass && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Total" value={String(students.length)} icon={<Calendar size={20} />} />
            <StatCard label="Present" value={String(presentCount)} icon={<Check size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
            <StatCard label="Absent" value={String(absentCount)} icon={<X size={20} />} iconBg="bg-red-50 text-red-600" />
          </div>

          <Card padding="none">
            <CardHeader className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle>Mark Attendance — {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { const m: Record<string, boolean> = {}; students.forEach((s: any) => { m[s._id] = true; }); setAttendance(m); }}>
                    All Present
                  </Button>
                  <Button size="sm" onClick={saveAttendance} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null} Save
                  </Button>
                </div>
              </div>
            </CardHeader>

            {students.length === 0 ? (
              <div className="py-12 text-center text-gray-400"><p>No students in this class</p></div>
            ) : (
              <div className="divide-y divide-gray-50">
                {students.map((s: any) => {
                  const isPresent = attendance[s._id] !== false;
                  return (
                    <div key={s._id} className={`flex items-center gap-4 p-4 transition-colors ${isPresent ? 'bg-white' : 'bg-red-50/40'}`}>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.admissionNumber}</p>
                      </div>
                      <Badge variant={isPresent ? 'emerald' : 'red'} size="sm">{isPresent ? 'Present' : 'Absent'}</Badge>
                      <button
                        onClick={() => setAttendance(p => ({ ...p, [s._id]: !isPresent }))}
                        className={`w-12 h-6 rounded-full transition-all flex items-center px-0.5 ${isPresent ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow transition-all" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AttendancePage;
