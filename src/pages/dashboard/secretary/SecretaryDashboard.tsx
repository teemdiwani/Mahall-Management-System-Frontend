import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Home, FileText, Bell, Calendar, Loader2 } from 'lucide-react';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import { ApplicationStatusBadge } from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import { dashboardApi } from '../../../api/dashboardApi';

const SecretaryDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['secretary-dashboard'],
    queryFn: dashboardApi.getSecretaryDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading Secretary records from database...</p>
        </div>
      </div>
    );
  }

  const d = data?.data;
  const cards = d?.cards || {
    totalMembers: 0,
    totalFamilies: 0,
    pendingApplications: 0,
    upcomingEvents: 0,
    upcomingMeetings: 0,
    totalVolunteers: 0,
  };

  const recentApps = d?.recentApplications || [];
  const announcements = d?.recentAnnouncements || [];

  return (
    <div>
      <PageHeader
        title="Secretary Administration Desk"
        subtitle="Manage community members, family records, general applications and official notices"
        breadcrumb={[{ label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Members"
          value={cards.totalMembers.toString()}
          icon={<Users size={20} />}
          change="Live Records"
          changeType="up"
        />
        <StatCard
          label="Active Families"
          value={cards.totalFamilies.toString()}
          icon={<Home size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          change="Registered"
          changeType="up"
        />
        <StatCard
          label="Pending Applications"
          value={cards.pendingApplications.toString()}
          icon={<FileText size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          subtitle="Needs review"
        />
        <StatCard
          label="Active Announcements"
          value={announcements.length.toString()}
          icon={<Bell size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle="Broadcasted"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Recent Applications */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Recent Applications Awaiting Review</CardTitle>
              <Link to="/app/applications" className="text-xs text-emerald-600 hover:underline">View all</Link>
            </CardHeader>
            <div className="flex flex-col gap-1">
              {recentApps.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No pending applications found.</p>
              ) : (
                recentApps.map((app: any) => (
                  <div key={app._id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar name={app.applicant?.name || 'Applicant'} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{app.title}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {app.applicant?.name} · {app.type} · {app.family?.familyCode}
                        </p>
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status.toLowerCase() as any} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Management Links */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Secretary Administrative Modules</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/app/members" className="p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors border border-gray-100 flex items-center gap-3">
                <Users size={18} className="text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Members Directory</p>
                  <p className="text-xs text-gray-400">View and update records</p>
                </div>
              </Link>
              <Link to="/app/families" className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 flex items-center gap-3">
                <Home size={18} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Family Registry</p>
                  <p className="text-xs text-gray-400">Manage ward allocations</p>
                </div>
              </Link>
              <Link to="/app/events" className="p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors border border-gray-100 flex items-center gap-3">
                <Calendar size={18} className="text-indigo-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Events & Programs</p>
                  <p className="text-xs text-gray-400">{cards.upcomingEvents} Upcoming</p>
                </div>
              </Link>
              <Link to="/app/announcements" className="p-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors border border-gray-100 flex items-center gap-3">
                <Bell size={18} className="text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Publish Notice</p>
                  <p className="text-xs text-gray-400">Community broadcasts</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Active Announcements */}
        <div>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Active Notices</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {announcements.map((a: any) => (
                <div key={a._id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{a.content}</p>
                  <span className="inline-block mt-2 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
                    Audience: {a.targetAudience}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
