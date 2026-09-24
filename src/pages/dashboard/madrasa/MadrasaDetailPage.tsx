import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Users, UserCheck, ArrowLeft,
  Plus, Search, Phone, Mail, Clock,
  AlertCircle, Loader2
} from 'lucide-react';
import { StatCard } from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import Tabs from '../../../components/ui/Tabs';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');

  // Modals state
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: '',
    gender: 'MALE',
    dateOfBirth: '',
    guardianName: '',
    guardianPhone: '',
  });

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    designation: 'Mudarris (Usthad)',
    phone: '',
    email: '',
    qualification: '',
    subjects: '',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch detailed madrasa data
  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-detail', id],
    queryFn: () => madrasaApi.getMadrasaDetails(id!),
    enabled: !!id,
  });

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: (payload: any) => madrasaApi.createStudent({ ...payload, madrasaId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-detail', id] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowAddStudent(false);
      setStudentForm({ name: '', gender: 'MALE', dateOfBirth: '', guardianName: '', guardianPhone: '' });
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: (payload: any) =>
      madrasaApi.createTeacher({
        ...payload,
        madrasaId: id,
        subjects: payload.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-detail', id] });
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      setShowAddTeacher(false);
      setTeacherForm({ name: '', designation: 'Mudarris (Usthad)', phone: '', email: '', qualification: '', subjects: '' });
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
        <p className="text-sm text-gray-500">Loading Madrasa records...</p>
      </div>
    );
  }

  const detail = data?.data;
  if (!detail || !detail.madrasa) {
    return (
      <div className="py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-800">Madrasa Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The requested institution does not exist or has been removed.</p>
        <Button onClick={() => navigate('/app/madrasa')}>Return to Madrasa Dashboard</Button>
      </div>
    );
  }

  const { madrasa, students = [], teachers = [], stats } = detail;

  const filteredStudents = students.filter(
    (s: any) =>
      !studentSearch ||
      s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.guardianName?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t: any) =>
      !teacherSearch ||
      t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.designation?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.qualification?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <button
          onClick={() => navigate('/app/madrasa')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Madrasa Overview
        </button>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                <Building2 size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-900">{madrasa.name}</h1>
                  <Badge variant="emerald">{madrasa.code}</Badge>
                  {madrasa.regNumber && <Badge variant="blue">{madrasa.regNumber}</Badge>}
                  <Badge variant={madrasa.status === 'ACTIVE' ? 'emerald' : 'gray'}>{madrasa.status}</Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>🏛️ {madrasa.board}</span>
                  <span className="text-gray-300">•</span>
                  <span>📍 {madrasa.location}</span>
                  {madrasa.establishedYear && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span>Est. {madrasa.establishedYear}</span>
                    </>
                  )}
                </p>
                <div className="mt-2 text-xs text-gray-600 flex items-center gap-4 flex-wrap font-medium">
                  <span className="text-emerald-700">
                    <strong>Sadar Usthad:</strong> {madrasa.sadarUsthad}
                  </span>
                  <span>
                    <Phone size={11} className="inline mr-1 text-gray-400" />
                    {madrasa.phone}
                  </span>
                  {madrasa.timings && (
                    <span>
                      <Clock size={11} className="inline mr-1 text-gray-400" />
                      {madrasa.timings}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2 self-start lg:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<UserCheck size={15} />}
                  onClick={() => setShowAddTeacher(true)}
                >
                  Add Usthad
                </Button>
                <Button
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={() => setShowAddStudent(true)}
                >
                  Enroll Student
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards - Census Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Students"
          value={String(stats?.studentCount ?? students.length)}
          icon={<Users size={20} />}
          change="Active Learners"
          changeType="up"
        />
        <StatCard
          label="Teaching Faculty"
          value={String(stats?.teacherCount ?? teachers.length)}
          icon={<UserCheck size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          change="Sadar & Mudarris Staff"
          changeType="up"
        />
        <StatCard
          label="Board Affiliation"
          value="SKIMVB"
          icon={<Building2 size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          change={madrasa.regNumber || 'Certified Unit'}
          changeType="neutral"
        />
        <StatCard
          label="Institution Location"
          value={madrasa.location}
          icon={<Building2 size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          change={madrasa.timings || 'Daily Sessions'}
          changeType="neutral"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
        <Tabs
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
          variant="pills"
          tabs={[
            { key: 'students', label: 'Students Roster', icon: <Users size={16} />, count: students.length },
            { key: 'teachers', label: 'Usthad (Faculty)', icon: <UserCheck size={16} />, count: teachers.length },
          ]}
        />

        {/* Tab 1: Students Roster */}
        {activeTab === 'students' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students in this madrasa..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
              {canManage && (
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddStudent(true)}>
                  Add Student
                </Button>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Users size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No students enrolled yet</p>
                <p className="text-xs text-gray-400 mt-1">Enroll learners into this madrasa using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Admission #</th>
                      <th className="px-4 py-3 font-semibold">Guardian Contact</th>
                      <th className="px-4 py-3 font-semibold">Gender</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((s: any) => (
                      <tr key={s._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={s.name} size="sm" />
                            <span className="font-semibold text-gray-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{s.admissionNumber}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          <p className="font-medium text-gray-800">{s.guardianName}</p>
                          <p className="text-gray-400">{s.guardianPhone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={s.gender === 'MALE' ? 'blue' : 'purple'} size="sm">
                            {s.gender}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={s.status === 'ACTIVE' ? 'emerald' : s.status === 'GRADUATED' ? 'blue' : 'gray'}
                            size="sm"
                          >
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Usthad (Faculty) */}
        {activeTab === 'teachers' && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  placeholder="Search usthads in this madrasa..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>
              {canManage && (
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddTeacher(true)}>
                  Add Usthad
                </Button>
              )}
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <UserCheck size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No faculty members assigned</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map((t: any) => (
                  <div
                    key={t._id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <Avatar name={t.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-sm truncate">{t.name}</h4>
                            <Badge variant={t.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                              {t.status}
                            </Badge>
                          </div>
                          <p className="text-xs font-semibold text-emerald-700 mt-0.5">{t.designation}</p>
                          <p className="text-xs text-gray-500">{t.qualification}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                        <p>
                          <Phone size={11} className="inline mr-1 text-gray-400" />
                          {t.phone}
                        </p>
                        {t.email && (
                          <p>
                            <Mail size={11} className="inline mr-1 text-gray-400" />
                            {t.email}
                          </p>
                        )}
                        {t.subjects && t.subjects.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {t.subjects.map((sub: string) => (
                              <Badge key={sub} variant="blue" size="sm">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      <Modal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} title={`Enroll Student - ${madrasa.name}`}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Student Full Name *</label>
            <input
              value={studentForm.name}
              onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Maryam Al-Rashid"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={studentForm.gender}
                onChange={(e) => setStudentForm((p) => ({ ...p, gender: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={studentForm.dateOfBirth}
                onChange={(e) => setStudentForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Guardian Name *</label>
              <input
                value={studentForm.guardianName}
                onChange={(e) => setStudentForm((p) => ({ ...p, guardianName: e.target.value }))}
                placeholder="Parent/Guardian"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Guardian Phone *</label>
              <input
                value={studentForm.guardianPhone}
                onChange={(e) => setStudentForm((p) => ({ ...p, guardianPhone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddStudent(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => createStudentMutation.mutate(studentForm)}
              disabled={
                createStudentMutation.isPending ||
                !studentForm.name ||
                !studentForm.guardianName
              }
            >
              {createStudentMutation.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Enroll Student
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Usthad Modal */}
      <Modal isOpen={showAddTeacher} onClose={() => setShowAddTeacher(false)} title={`Add Usthad - ${madrasa.name}`}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Usthad Full Name *</label>
            <input
              value={teacherForm.name}
              onChange={(e) => setTeacherForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Usthad K.T. Abdul Majeed Faizy"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Designation *</label>
              <input
                value={teacherForm.designation}
                onChange={(e) => setTeacherForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="e.g. Mudarris, Sadar Usthad"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
              <input
                value={teacherForm.phone}
                onChange={(e) => setTeacherForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Qualification *</label>
            <input
              value={teacherForm.qualification}
              onChange={(e) => setTeacherForm((p) => ({ ...p, qualification: e.target.value }))}
              placeholder="e.g. Faizy, Aalim, Hafiz, BA Arabic"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Subjects (comma separated)</label>
            <input
              value={teacherForm.subjects}
              onChange={(e) => setTeacherForm((p) => ({ ...p, subjects: e.target.value }))}
              placeholder="e.g. Quran, Fiqh, Tareekh"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="usthad@mahallconnect.org"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddTeacher(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => createTeacherMutation.mutate(teacherForm)}
              disabled={createTeacherMutation.isPending || !teacherForm.name || !teacherForm.phone || !teacherForm.qualification}
            >
              {createTeacherMutation.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Save Usthad
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaDetailPage;
