import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserCheck, Loader2, Building2,
  Plus, ChevronRight, Sparkles, School,
  Calendar, Award, DollarSign, Bell, BookOpen
} from 'lucide-react';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { madrasaApi } from '../../../api/domainApis';
import { dashboardApi } from '../../../api/dashboardApi';
import { useAuth } from '../../../context/AuthContext';

const MadrasaDashboard: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

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
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-dashboard'],
    queryFn: dashboardApi.getMadrasaDashboard,
  });

  const createMadrasaMutation = useMutation({
    mutationFn: madrasaApi.createMadrasa,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-dashboard'] });
      qc.invalidateQueries({ queryKey: ['madrasa-institutions'] });
      setShowAddModal(false);
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
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading Mahallu Madrasa roster and census data...</p>
        </div>
      </div>
    );
  }

  const d = data?.data;
  const cards = d?.cards || {
    totalMadrasas: 0,
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    activeTeachers: 0,
  };

  const madrasas = d?.madrasas || [];
  const madrasaBreakdown = d?.madrasaBreakdown || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahallu Madrasa Education Desk"
        subtitle="Institutional overview, student enrollments and Usthad (faculty) rosters under this Mahallu"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Madrasa' }]}
        action={
          canManage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Building2 size={15} />}
                onClick={() => navigate('/app/madrasa/directory')}
              >
                All Madrasas
              </Button>
              <Button
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Madrasa
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* 4 Main KPI Cards - Pure Census Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Madrasas in Mahallu"
          value={String(cards.totalMadrasas || madrasas.length)}
          icon={<Building2 size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          change="Central & Branch Units"
          changeType="up"
        />
        <StatCard
          label="Total Enrolled Students"
          value={String(cards.totalStudents)}
          icon={<Users size={20} />}
          change="Active Enrollments"
          changeType="up"
        />
        <StatCard
          label="Total Teaching Usthad"
          value={String(cards.activeTeachers)}
          icon={<UserCheck size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          change="Sadar & Mudarris Staff"
          changeType="up"
        />
        <StatCard
          label="Boys / Girls Ratio"
          value={`${cards.maleStudents || 0}B : ${cards.femaleStudents || 0}G`}
          icon={<Users size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          change="Student Gender Ratio"
          changeType="up"
        />
      </div>

      {/* Madrasa Operations & Academic Desks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              Madrasa Academic Management & Parent Desks
            </h2>
            <p className="text-xs text-gray-500">
              Manage classes 1 to 10/12, timetables, exam results, monthly fees, and official parent announcements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Classes */}
          <div
            onClick={() => navigate('/app/madrasa/classes')}
            className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <School size={20} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-purple-700 transition-colors">
                Classes & Standards
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Configure 1 to 10/12 standards, divisions & Usthad
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
              <span>{cards.totalClasses || 17} Classes</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Timetables */}
          <div
            onClick={() => navigate('/app/madrasa/timetables')}
            className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Calendar size={20} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                Class Timetables
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Secretary upload & class-wise periods
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
              <span>Weekly Schedules</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Exam Results */}
          <div
            onClick={() => navigate('/app/madrasa/results')}
            className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Award size={20} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-amber-700 transition-colors">
                Exam Results Desk
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Manager marks entry, grades & remarks
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
              <span>Board Assessments</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Monthly Fees */}
          <div
            onClick={() => navigate('/app/madrasa/fees')}
            className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <DollarSign size={20} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-700 transition-colors">
                Monthly Fees & Alerts
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Tuition fee ledger & parent alerts
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
              <span>Fee Notices</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Madrasa Announcements */}
          <div
            onClick={() => navigate('/app/madrasa/announcements')}
            className="p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Bell size={20} />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-rose-700 transition-colors">
                Parent Circulars
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Official notices & parent circulars
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-rose-700">
              <span>Live Notices</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ALL MADRASAS OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={18} className="text-emerald-600" />
              Mahallu Madrasa Institutions ({madrasas.length})
            </h2>
            <p className="text-xs text-gray-500">
              Overview of all Madrasa institutions under this mahal with student and usthad counts.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/madrasa/directory')}
            className="text-xs text-emerald-700 font-semibold"
          >
            Manage Directory <ChevronRight size={14} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {madrasas.map((m: any) => (
            <div
              key={m._id}
              onClick={() => navigate(`/app/madrasa/${m._id}`)}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-sm">
                        {m.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono">{m.code}</p>
                    </div>
                  </div>
                  <Badge variant={m.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                    {m.status}
                  </Badge>
                </div>

                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <p className="text-emerald-700 font-medium">
                    <strong>Sadar Usthad:</strong> {m.sadarUsthad}
                  </p>
                  <p className="text-gray-500">📍 {m.location}</p>
                  {m.regNumber && <p className="text-gray-400 font-mono">Reg: {m.regNumber}</p>}
                </div>

                {/* Census Stat Badges */}
                <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-emerald-50/60 rounded-lg py-2 px-2">
                    <p className="text-[10px] text-emerald-800 uppercase font-semibold">Students</p>
                    <p className="text-base font-extrabold text-emerald-700">{m.studentCount || 0}</p>
                  </div>
                  <div className="bg-blue-50/60 rounded-lg py-2 px-2">
                    <p className="text-[10px] text-blue-800 uppercase font-semibold">Usthads</p>
                    <p className="text-base font-extrabold text-blue-700">{m.usthadCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
                <span>View Students & Usthad Roster</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Students per Madrasa */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Students Enrolled per Madrasa</CardTitle>
            <Badge variant="emerald">Live Data</Badge>
          </CardHeader>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={madrasaBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="madrasaName"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="studentsCount" fill="#10b981" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Usthad Faculty per Madrasa */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Usthad Faculty per Madrasa</CardTitle>
            <Badge variant="blue">Faculty Roster</Badge>
          </CardHeader>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={madrasaBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="usthadCount" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Teaching Usthad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Access Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Madrasa Census & Academic Overview Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-emerald-500/10 pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Mahallu Madrasa Census & Directory
            </div>
            <h3 className="text-xl font-black">Madrasa Demographics & Faculty Management</h3>
            <p className="text-emerald-100/80 text-xs mt-2 max-w-xl leading-relaxed">
              Track student admissions and Usthad faculty directory across all {madrasas.length} Madrasas under this Mahallu.
              Madrasa operational funds and fees are handled independently by each respective institution.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold border-0"
              icon={<Building2 size={16} />}
              onClick={() => navigate('/app/madrasa/directory')}
            >
              All Madrasas Directory
            </Button>
            <Button
              variant="outline"
              className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-800/40"
              icon={<Users size={16} />}
              onClick={() => navigate('/app/madrasa/students')}
            >
              View All Students ({cards.totalStudents})
            </Button>
            <Button
              variant="outline"
              className="border-emerald-400/40 text-emerald-100 hover:bg-emerald-800/40"
              icon={<UserCheck size={16} />}
              onClick={() => navigate('/app/madrasa/teachers')}
            >
              Usthad Faculty Roster ({cards.activeTeachers})
            </Button>
          </div>
        </div>

        {/* Academic Profile */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Academic Term & Timing</CardTitle>
          </CardHeader>
          <div className="text-sm space-y-3">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-xs">Current Academic Year:</span>
              <span className="font-bold text-gray-800 text-xs">2026-2027</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-xs">Operating Madrasas:</span>
              <span className="font-bold text-emerald-700 text-xs">{madrasas.length} Institutions</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-xs">Standard Sessions:</span>
              <span className="font-bold text-gray-800 text-xs">06:30 AM – 08:30 AM</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-500 text-xs">Hifz Academy Sessions:</span>
              <span className="font-bold text-gray-800 text-xs">Morning & Evening</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500 text-xs">Board Affiliation:</span>
              <span className="font-bold text-gray-800 text-xs">Samastha (SKIMVB)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Add Madrasa Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Madrasa in Mahallu">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Madrasa Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Al-Huda Branch Madrasa"
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. MDR-04"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Board Reg #</label>
              <input
                value={form.regNumber}
                onChange={(e) => setForm((p) => ({ ...p, regNumber: e.target.value }))}
                placeholder="e.g. SKIMVB-1024"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Ward *</label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. South Ward"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Sadar Usthad *</label>
              <input
                value={form.sadarUsthad}
                onChange={(e) => setForm((p) => ({ ...p, sadarUsthad: e.target.value }))}
                placeholder="Headmaster Usthad"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">Timings</label>
              <input
                value={form.timings}
                onChange={(e) => setForm((p) => ({ ...p, timings: e.target.value }))}
                placeholder="06:30 AM – 08:30 AM"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => createMadrasaMutation.mutate(form)}
              disabled={createMadrasaMutation.isPending || !form.name || !form.code || !form.sadarUsthad}
            >
              {createMadrasaMutation.isPending && <Loader2 size={14} className="animate-spin mr-2" />}
              Save Madrasa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaDashboard;
