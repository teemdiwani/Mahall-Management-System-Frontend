import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Home, DollarSign, FileText, Calendar, Bell, Heart, Plane, Moon, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import { PaymentStatusBadge, ApplicationStatusBadge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/ui/EmptyState';
import { dashboardApi } from '../../../api/dashboardApi';
import MadrasaParentPortalSection from '../../../components/madrasa/MadrasaParentPortalSection';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['member-dashboard'],
    queryFn: dashboardApi.getMemberDashboard,
  });

  const d = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading your member portal from database...</p>
        </div>
      </div>
    );
  }

  const familyName = d?.family?.name || 'My Family';
  const familyCount = d?.familyMembersCount || 1;
  const duesStatus = d?.currentMonthDuesStatus || 'PENDING';
  const recentPayments = d?.recentPayments || [];
  const recentApplications = d?.recentApplications || [];
  const announcements = d?.announcements || [];
  const events = d?.upcomingEvents || [];
  const prayers = d?.mosquePrayerTimings || {
    fajr: '05:15 AM',
    dhuhr: '12:35 PM',
    asr: '04:15 PM',
    maghrib: '06:35 PM',
    isha: '08:00 PM',
    jumah: '12:45 PM',
  };

  return (
    <div>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full bg-white/5 translate-y-1/4" />
        <div className="relative">
          <p className="text-emerald-100 text-sm mb-1">Assalamu Alaikum,</p>
          <h1 className="text-2xl font-bold mb-0.5">{user?.name ?? 'Member'}</h1>
          <p className="text-emerald-100 text-sm">
            Welcome to Al-Noor Mahall · {d?.family?.familyCode ? `Family Code: ${d.family.familyCode}` : 'Member Portal'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="My Family"
          value={`${familyCount} members`}
          icon={<Home size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          subtitle={familyName}
        />
        <StatCard
          label="Monthly Dues"
          value="₹250"
          icon={<DollarSign size={20} />}
          iconBg={duesStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
          subtitle={duesStatus === 'PAID' ? 'September Cleared' : 'Payment Due'}
        />
        <StatCard
          label="Mahall Requests"
          value={String(recentApplications.length)}
          icon={<FileText size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle={recentApplications.length > 0 ? 'Live in review' : 'None active'}
        />
        <StatCard
          label="Upcoming Events"
          value={String(events.length)}
          icon={<Calendar size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          subtitle="Community calendar"
        />
      </div>

      {/* Madrasa Parent Portal Section (Dynamically displayed ONLY when member's children study in Mahallu Madrasa) */}
      <div className="mb-6">
        <MadrasaParentPortalSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* My Recent Payments */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">My Recent Payments</h3>
              <Link to="/app/my-payments" className="text-xs text-emerald-600 hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentPayments.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No payment history found.</p>
              ) : (
                recentPayments.slice(0, 5).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{p.type} Contribution</p>
                      <p className="text-xs text-gray-400">{p.month || 'Direct'} · {p.receiptNumber || 'Pending Verification'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-800">₹{p.amount}</span>
                      <PaymentStatusBadge status={p.status.toLowerCase() as any} />
                    </div>
                  </div>
                ))
              )}
            </div>
            {duesStatus === 'PENDING' && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                <p className="text-sm text-amber-700">
                  Your monthly contribution of <strong>₹250</strong> for this month is currently pending.
                </p>
                <Link to="/app/my-payments" className="text-xs font-semibold bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
                  Pay Now
                </Link>
              </div>
            )}
          </Card>

          {/* Mahall Requests */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Mahall Requests</h3>
              <Link
                to="/app/applications?new=true"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                + New Request
              </Link>
            </div>
            {recentApplications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No requests submitted yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentApplications.map((app: any) => (
                  <div key={app._id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{app.title}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {app.type} · {app.applicationNumber} · {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status.toLowerCase() as any} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Events */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">Upcoming Events</h3>
              <Link to="/app/events" className="text-xs text-emerald-600 hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {events.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No upcoming events scheduled right now.</p>
              ) : (
                events.map((ev: any) => (
                  <div key={ev._id} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors">
                    <div className="bg-white rounded-xl px-3 py-2 text-center border border-gray-100 flex-shrink-0">
                      <p className="text-xs text-gray-400 uppercase">{new Date(ev.startDate).toLocaleString('en', { month: 'short' })}</p>
                      <p className="text-lg font-bold text-gray-800">{new Date(ev.startDate).getDate()}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{ev.title}</p>
                      <p className="text-xs text-gray-500">{ev.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Today's Prayer Times */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Moon size={16} className="text-emerald-600" />
              Masjid Prayer Timetable
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="font-medium text-gray-600">Fajr</span>
                <span className="font-bold text-gray-900">{prayers.fajr}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="font-medium text-gray-600">Dhuhr</span>
                <span className="font-bold text-gray-900">{prayers.dhuhr}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="font-medium text-gray-600">Asr</span>
                <span className="font-bold text-gray-900">{prayers.asr}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="font-medium text-gray-600">Maghrib</span>
                <span className="font-bold text-gray-900">{prayers.maghrib}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="font-medium text-gray-600">Isha</span>
                <span className="font-bold text-gray-900">{prayers.isha}</span>
              </div>
              <div className="flex justify-between py-1.5 text-emerald-700 bg-emerald-50 px-2 rounded-lg mt-1 font-semibold">
                <span>Friday Jum'ah</span>
                <span>{prayers.jumah}</span>
              </div>
            </div>
          </Card>

          {/* Mahall Announcements */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" />
              Latest Announcements
            </h3>
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 3).map((a: any) => (
                <div key={a._id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-800">{a.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">{a.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">{a.author}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Service Links */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Mahall Services</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/zakat" className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-center transition-colors">
                <Heart size={18} className="text-emerald-600 mb-1" />
                <span className="text-xs font-medium text-gray-700">Zakat & Fitrah</span>
              </Link>
              <Link to="/app/hajj" className="flex flex-col items-center p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 text-center transition-colors">
                <Plane size={18} className="text-blue-600 mb-1" />
                <span className="text-xs font-medium text-gray-700">Hajj / Umrah</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
