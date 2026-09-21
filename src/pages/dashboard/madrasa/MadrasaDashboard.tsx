import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, UserCheck, TrendingUp, Loader2 } from 'lucide-react';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { dashboardApi } from '../../../api/dashboardApi';

const MadrasaDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-dashboard'],
    queryFn: dashboardApi.getMadrasaDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading Madrasa roster from database...</p>
        </div>
      </div>
    );
  }

  const d = data?.data;
  const cards = d?.cards || {
    totalStudents: 0,
    totalClasses: 0,
    activeTeachers: 0,
    attendanceRate: 94.8,
  };

  const classes = d?.classes || [];
  const breakdown = d?.breakdown || [];

  return (
    <div>
      <PageHeader
        title="Madrasa Education Desk"
        subtitle="Al-Noor Madrasa — Classes, Student Enrollments and Faculty Administration"
        breadcrumb={[{ label: 'Dashboard' }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Enrolled Students"
          value={cards.totalStudents.toString()}
          icon={<Users size={20} />}
          change="Active Enrollments"
          changeType="up"
        />
        <StatCard
          label="Active Classes"
          value={cards.totalClasses.toString()}
          icon={<BookOpen size={20} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Teaching Staff"
          value={cards.activeTeachers.toString()}
          icon={<UserCheck size={20} />}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Avg Attendance"
          value={`${cards.attendanceRate}%`}
          icon={<TrendingUp size={20} />}
          iconBg="bg-teal-50 text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Class Strength Chart */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Students Enrolled per Class</CardTitle>
              <Badge variant="emerald">Live Roster</Badge>
            </CardHeader>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="className" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="studentsCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Classes Directory */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Class Allocations & Rooms</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classes.map((c: any) => (
                <div key={c._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.roomNumber || 'Main Block'}</p>
                    </div>
                    <Badge variant="blue">{c.grade}</Badge>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200/60 flex justify-between items-center text-xs">
                    <span className="text-gray-500">Teacher:</span>
                    <span className="font-semibold text-gray-800">{c.teacherName}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel: Quick Info */}
        <div className="flex flex-col gap-4">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Academic Term</CardTitle>
            </CardHeader>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Term:</span>
                <span className="font-semibold text-gray-800">2026-2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timings:</span>
                <span className="font-semibold text-gray-800">06:30 AM – 08:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Working Days:</span>
                <span className="font-semibold text-gray-800">Monday to Saturday</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MadrasaDashboard;
