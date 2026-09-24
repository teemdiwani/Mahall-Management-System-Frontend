import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award, Plus, ArrowLeft, Building2, Search,
  Edit2, Trash2, CheckCircle2, User, FileText,
  Sparkles, Loader2, Filter, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasaResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);

  // Form State
  const [form, setForm] = useState({
    madrasaId: '',
    studentId: '',
    standard: 3,
    examName: 'First Term Board Assessment 2026',
    academicYear: '2026-2027',
    examDate: new Date().toISOString().slice(0, 10),
    rank: 1,
    remarks: '',
    subjects: [
      { subject: 'Quran Recitation & Tajweed', maxMarks: 50, marksObtained: 45, grade: 'A' },
      { subject: 'Fiqh (Islamic Jurisprudence)', maxMarks: 50, marksObtained: 42, grade: 'A' },
      { subject: 'Thareekh (Islamic History)', maxMarks: 50, marksObtained: 44, grade: 'A' },
      { subject: 'Akhlaq & Islamic Manners', maxMarks: 50, marksObtained: 48, grade: 'A+' },
      { subject: 'Lisan-ul-Quran (Arabic)', maxMarks: 50, marksObtained: 40, grade: 'B+' },
    ],
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch Madrasas
  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });
  const madrasas = madrasasData?.data || [];
  const activeMadrasaId = selectedMadrasaId || (madrasas[0]?._id ? String(madrasas[0]._id) : '');

  // Fetch Students for this madrasa
  const { data: studentsData } = useQuery({
    queryKey: ['madrasa-students-all', activeMadrasaId],
    queryFn: () => madrasaApi.listStudents({ madrasaId: activeMadrasaId || undefined, limit: 100 }),
    enabled: !!activeMadrasaId,
  });
  const students = studentsData?.data?.items || [];

  // Fetch Results
  const { data: resultsData, isLoading } = useQuery({
    queryKey: ['madrasa-results', activeMadrasaId],
    queryFn: () => madrasaApi.listResults({ madrasaId: activeMadrasaId || undefined }),
    enabled: !!activeMadrasaId,
  });
  const results = resultsData?.data || [];

  const createResultMutation = useMutation({
    mutationFn: (data: any) => madrasaApi.createResult(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-results'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => madrasaApi.updateResult(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-results'] });
      setEditingResult(null);
      resetForm();
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: (id: string) => madrasaApi.deleteResult(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-results'] });
    },
  });

  const resetForm = () => {
    setForm({
      madrasaId: activeMadrasaId,
      studentId: students[0]?._id || '',
      standard: students[0]?.standard || 3,
      examName: 'First Term Board Assessment 2026',
      academicYear: '2026-2027',
      examDate: new Date().toISOString().slice(0, 10),
      rank: 1,
      remarks: '',
      subjects: [
        { subject: 'Quran Recitation & Tajweed', maxMarks: 50, marksObtained: 45, grade: 'A' },
        { subject: 'Fiqh (Islamic Jurisprudence)', maxMarks: 50, marksObtained: 42, grade: 'A' },
        { subject: 'Thareekh (Islamic History)', maxMarks: 50, marksObtained: 44, grade: 'A' },
        { subject: 'Akhlaq & Islamic Manners', maxMarks: 50, marksObtained: 48, grade: 'A+' },
        { subject: 'Lisan-ul-Quran (Arabic)', maxMarks: 50, marksObtained: 40, grade: 'B+' },
      ],
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setForm((p) => ({
      ...p,
      madrasaId: activeMadrasaId,
      studentId: students[0]?._id || '',
      standard: students[0]?.standard || 3,
    }));
    setShowAddModal(true);
  };

  const handleSubjectMarkChange = (index: number, marks: number) => {
    const subs = [...form.subjects];
    subs[index].marksObtained = marks;
    const max = subs[index].maxMarks || 50;
    const pct = (marks / max) * 100;
    if (pct >= 90) subs[index].grade = 'A+';
    else if (pct >= 80) subs[index].grade = 'A';
    else if (pct >= 70) subs[index].grade = 'B+';
    else if (pct >= 60) subs[index].grade = 'B';
    else if (pct >= 50) subs[index].grade = 'C+';
    else if (pct >= 40) subs[index].grade = 'C';
    else subs[index].grade = 'D';

    setForm((p) => ({ ...p, subjects: subs }));
  };

  const filteredResults = results.filter((r: any) => {
    if (selectedStandard !== 'ALL' && r.standard !== Number(selectedStandard)) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const sName = r.studentId?.name || '';
      const adm = r.studentId?.admissionNumber || '';
      return sName.toLowerCase().includes(q) || adm.toLowerCase().includes(q) || r.examName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Madrasa Exam Results & Assessment Desk"
        subtitle="Entered and published by Madrasa Manager for board examinations, term tests and evaluation records"
        breadcrumb={[{ label: 'Madrasa', href: '/app/madrasa' }, { label: 'Exam Results' }]}
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
                Enter Student Result
              </Button>
            )}
          </div>
        }
      />

      {/* Madrasa Selector */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
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

        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or adm no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Results Cards List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading student marks and results...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Award size={36} className="mx-auto text-gray-400 mb-2" />
          <h4 className="text-sm font-bold text-gray-800">No Exam Results Recorded</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Click "Enter Student Result" to publish term marks for students in this madrasa.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((r: any) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-100">
                      {r.studentId?.gender === 'FEMALE' ? '👧' : '👦'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{r.studentId?.name || 'Student'}</h4>
                      <p className="text-xs text-gray-400 font-mono">
                        Adm: <strong>{r.studentId?.admissionNumber || '—'}</strong> · Standard: <strong>{r.standard || r.studentId?.standard || '—'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant="emerald" size="sm">
                      {r.overallGrade}
                    </Badge>
                    <p className="text-xs font-black text-emerald-700 mt-1">{r.percentage}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                    <span className="font-bold text-gray-800">{r.examName}</span>
                    <span className="font-mono text-gray-400">{new Date(r.examDate).toLocaleDateString()}</span>
                  </div>

                  {/* Subject Scores */}
                  <div className="bg-gray-50/80 rounded-xl p-3 space-y-1.5 text-xs">
                    {(r.subjects || []).map((sub: any, i: number) => (
                      <div key={i} className="flex justify-between items-center py-0.5 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 font-medium">{sub.subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 font-mono">{sub.marksObtained}/{sub.maxMarks}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {sub.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.remarks && (
                    <p className="text-xs text-amber-800 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 mt-3 italic">
                      "{r.remarks}"
                    </p>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400">By: {r.enteredBy}</span>
                  <button
                    onClick={() => {
                      if (confirm('Delete this exam result entry?')) {
                        deleteResultMutation.mutate(r._id);
                      }
                    }}
                    className="text-rose-600 hover:text-rose-700 font-medium hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enter Result Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Enter Madrasa Student Exam Result"
      >
        <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => {
                const sId = e.target.value;
                const stud = students.find((s: any) => s._id === sId);
                setForm((p) => ({
                  ...p,
                  studentId: sId,
                  standard: stud?.standard || 3,
                }));
              }}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-semibold"
            >
              {students.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.admissionNumber}) — Class {s.standard || '?'}-{s.division || 'A'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Exam Title *</label>
              <input
                value={form.examName}
                onChange={(e) => setForm((p) => ({ ...p, examName: e.target.value }))}
                placeholder="e.g. First Term Board Assessment"
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Rank in Class</label>
              <input
                type="number"
                value={form.rank}
                onChange={(e) => setForm((p) => ({ ...p, rank: Number(e.target.value) }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Subject Marks Entry */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">Subject-wise Marks Scored:</label>
            <div className="space-y-2 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              {form.subjects.map((sub, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={sub.subject}
                    onChange={(e) => {
                      const s = [...form.subjects];
                      s[i].subject = e.target.value;
                      setForm((p) => ({ ...p, subjects: s }));
                    }}
                    className="flex-1 text-xs rounded-lg border border-gray-200 p-2 bg-white"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <input
                      type="number"
                      value={sub.marksObtained}
                      onChange={(e) => handleSubjectMarkChange(i, Number(e.target.value))}
                      className="w-14 text-xs rounded-lg border border-gray-200 p-2 text-center font-bold bg-white"
                    />
                    <span className="text-xs text-gray-400 font-mono">/{sub.maxMarks}</span>
                  </div>
                  <span className="w-8 text-center text-xs font-extrabold text-emerald-700 bg-emerald-50 py-1 rounded">
                    {sub.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Usthad's Assessment & Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="e.g. MashaAllah, commendable recitation and good conduct in class..."
              rows={2}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => createResultMutation.mutate(form)}
              disabled={createResultMutation.isPending || !form.studentId}
            >
              {createResultMutation.isPending ? 'Publishing...' : 'Publish Result'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaResultsPage;
