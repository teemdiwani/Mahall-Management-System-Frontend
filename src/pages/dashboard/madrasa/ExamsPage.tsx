import React, { useState } from 'react';
import { FileText, Plus, Loader2, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';

const GRADE_FROM_MARKS = (marks: number, total: number): string => {
  const pct = (marks / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
};

const ExamsPage: React.FC = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [viewExam, setViewExam] = useState<any>(null);
  const [form, setForm] = useState({ title: '', classId: '', subject: '', examDate: '', totalMarks: '100', passingMarks: '40', type: 'MONTHLY' });

  const { data: examsData, isLoading } = useQuery({ queryKey: ['madrasa-exams'], queryFn: madrasaApi.listExams });
  const { data: classesData } = useQuery({ queryKey: ['madrasa-classes'], queryFn: madrasaApi.listClasses });
  const { data: resultsData } = useQuery({
    queryKey: ['madrasa-results', viewExam?._id],
    queryFn: () => madrasaApi.getResults(viewExam._id),
    enabled: !!viewExam,
  });

  const create = useMutation({
    mutationFn: madrasaApi.createExam,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['madrasa-exams'] }); setShowCreate(false); },
  });

  const exams = (examsData?.data || []) as any[];
  const classes = (classesData?.data || []) as any[];
  const results = (resultsData?.data || []) as any[];

  const passed = results.filter((r: any) => r.passed).length;
  const avgMarks = results.length ? Math.round(results.reduce((s: number, r: any) => s + (r.marksObtained || 0), 0) / results.length) : 0;

  return (
    <div>
      <PageHeader
        title="Exams & Results"
        subtitle="Exam scheduling, mark entry and result analysis"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }, { label: 'Exams' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowCreate(true)}>Create Exam</Button>}
      />

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
      ) : exams.length === 0 ? (
        <div className="py-16 text-center text-gray-400"><FileText size={40} className="mx-auto mb-3 opacity-30" /><p>No exams created yet</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam: any) => (
            <Card key={exam._id} padding="md" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setViewExam(exam)}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">{exam.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{exam.subject}</p>
                </div>
                <Badge variant={exam.type === 'FINAL' ? 'red' : exam.type === 'MIDTERM' ? 'amber' : 'blue'} size="sm">{exam.type}</Badge>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <p>📅 {new Date(exam.examDate).toLocaleDateString()}</p>
                <p>🎓 {exam.classId?.name || 'Class'} — {exam.classId?.grade || ''}</p>
                <p>📊 Total: {exam.totalMarks} | Passing: {exam.passingMarks}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button size="sm" variant="outline" className="w-full">View Results →</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Exam Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Exam">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Monthly Test — October"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
              <select value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400">
                {['MONTHLY', 'UNIT_TEST', 'MIDTERM', 'FINAL'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Quran, Fiqh, Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Date *</label>
            <input type="date" value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))}
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Passing Marks</label>
              <input type="number" value={form.passingMarks} onChange={e => setForm(p => ({ ...p, passingMarks: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => create.mutate({ ...form, totalMarks: Number(form.totalMarks), passingMarks: Number(form.passingMarks) })}
              disabled={create.isPending || !form.title || !form.classId || !form.subject}>
              {create.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null} Create Exam
            </Button>
          </div>
        </div>
      </Modal>

      {/* Results View Modal */}
      {viewExam && (
        <Modal isOpen={!!viewExam} onClose={() => setViewExam(null)} title={`Results — ${viewExam.title}`}>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatCard label="Students" value={String(results.length)} icon={<TrendingUp size={16} />} />
            <StatCard label="Passed" value={String(passed)} icon={<TrendingUp size={16} />} iconBg="bg-emerald-50 text-emerald-600" />
            <StatCard label="Avg Marks" value={String(avgMarks)} icon={<TrendingUp size={16} />} iconBg="bg-blue-50 text-blue-600" />
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {results.length === 0 ? (
              <p className="py-8 text-center text-gray-400 text-sm">No results entered yet</p>
            ) : (
              results.map((r: any) => (
                <div key={r._id} className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{r.studentId?.name || 'Student'}</p>
                    <p className="text-xs text-gray-400">{r.studentId?.admissionNumber}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{r.marksObtained}/{r.totalMarks}</p>
                  <Badge variant={r.passed ? 'emerald' : 'red'} size="sm">{GRADE_FROM_MARKS(r.marksObtained, r.totalMarks)}</Badge>
                </div>
              ))
            )}
          </div>
          <div className="pt-3">
            <Button className="w-full" onClick={() => setViewExam(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ExamsPage;
