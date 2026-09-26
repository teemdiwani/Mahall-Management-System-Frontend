import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Home,
  DollarSign,
  FileText,
  Calendar,
  Bell,
  Heart,
  Plane,
  Moon,
  Loader2,
  Users,
  Phone,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Card from '../../../components/ui/Card';
import Badge, { PaymentStatusBadge, ApplicationStatusBadge } from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import { StatCard } from '../../../components/ui/EmptyState';
import { dashboardApi } from '../../../api/dashboardApi';
import MadrasaParentPortalSection from '../../../components/madrasa/MadrasaParentPortalSection';

const getRelationshipBadgeVariant = (rel: string): 'emerald' | 'blue' | 'teal' | 'purple' | 'gray' => {
  const upper = (rel || '').toUpperCase();
  if (upper === 'HEAD') return 'emerald';
  if (upper === 'SPOUSE') return 'blue';
  if (['SON', 'DAUGHTER', 'CHILD'].includes(upper)) return 'teal';
  if (['FATHER', 'MOTHER', 'GRANDFATHER', 'GRANDMOTHER'].includes(upper)) return 'purple';
  return 'gray';
};

const MemberDashboard: React.FC = () => {
  const { user, refreshMe } = useAuth();
  const queryClient = useQueryClient();

  const [searchPhoneInput, setSearchPhoneInput] = useState('');
  const [isLinkingFamily, setIsLinkingFamily] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['member-dashboard'],
    queryFn: () => dashboardApi.getMemberDashboard(),
  });

  const d = data?.data;

  const handleLinkFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhoneInput.trim()) return;

    setLinkError(null);
    setLinkSuccess(null);
    setIsLinkingFamily(true);

    try {
      const res = await dashboardApi.linkFamilyByPhone(searchPhoneInput.trim());
      setLinkSuccess(res?.data?.message || 'Family household connected successfully!');
      setSearchPhoneInput('');
      await queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['my-family'] });
      await refreshMe();
      setTimeout(() => setLinkSuccess(null), 5000);
    } catch (err: any) {
      setLinkError(
        err?.response?.data?.message || err?.message || 'No family found matching this phone number.'
      );
    } finally {
      setIsLinkingFamily(false);
    }
  };

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

  const familyMembers: any[] = d?.familyMembers || [];
  const familyName = d?.family?.name || 'My Family';
  const familyCount = familyMembers.length || d?.familyMembersCount || 1;
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 right-16 w-32 h-32 rounded-full bg-white/5 translate-y-1/4" />
        <div className="relative">
          <p className="text-emerald-100 text-xs sm:text-sm mb-1">Assalamu Alaikum,</p>
          <h1 className="text-xl sm:text-2xl font-bold mb-0.5">{user?.name ?? 'Member'}</h1>
          <p className="text-emerald-100 text-xs sm:text-sm">
            Welcome to Al-Noor Mahall · {d?.family?.familyCode ? `Family Code: ${d.family.familyCode}` : 'Member Portal'}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          label="My Family"
          value={`${familyCount} members`}
          icon={<Home size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          subtitle={familyName}
        />
        <StatCard
          label="Monthly Dues"
          value={`₹${d?.duesAmount || 250}`}
          icon={<DollarSign size={20} />}
          iconBg={duesStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}
          subtitle={duesStatus === 'PAID' ? 'Cleared' : '28th Automated Due'}
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

      {/* Family Household & Members Section */}
      <div className="mb-6">
        {d?.family ? (
          <Card padding="md" className="border-emerald-100/80 shadow-sm overflow-hidden relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-1.5 rounded-lg bg-emerald-100/60 text-emerald-700">
                    <Home size={18} />
                  </span>
                  <h3 className="text-base font-bold text-gray-900">{familyName}</h3>
                  <Badge variant="emerald" size="sm">
                    {d.family.familyCode || 'Active Household'}
                  </Badge>
                  <Badge variant="teal" size="sm" dot>
                    {d.family.status || 'ACTIVE'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>{d.family.area || d.family.ward || 'Mahall Ward'}</span>
                  <span>·</span>
                  <span>{d.family.address}</span>
                  {d.family.phone && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-emerald-700 font-medium flex items-center gap-1">
                        <Phone size={11} /> {d.family.phone}
                      </span>
                    </>
                  )}
                  {d.familyHead?.name && (
                    <>
                      <span>·</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600" /> Head: {d.familyHead.name}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <Link
                to="/app/my-family"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto flex-shrink-0"
              >
                <span>Manage Family Portal</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* All Members List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-600" />
                  <span>Household Members ({familyMembers.length || familyCount})</span>
                </h4>
                <span className="text-[11px] text-gray-400">All registered census members</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(familyMembers.length > 0
                  ? familyMembers
                  : [
                      {
                        _id: 'default',
                        name: user?.name || 'Head of Family',
                        relationship: 'HEAD',
                        phone: user?.phone || d.family.phone || '',
                      },
                    ]
                ).map((m: any) => (
                  <div
                    key={m._id || m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={m.name || 'Member'} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{m.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant={getRelationshipBadgeVariant(m.relationship)} size="sm">
                            {m.relationship}
                          </Badge>
                          {m.memberCode && (
                            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                              {m.memberCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 pl-2">
                      {m.phone ? (
                        <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-emerald-800 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                          <Phone size={10} className="text-emerald-600" />
                          <span>{m.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No phone</span>
                      )}
                      {m.occupation && (
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[90px] text-right">
                          {m.occupation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card padding="md" className="border-amber-200 bg-amber-50/40 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Home size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Connect Your Family Household</h3>
                  <p className="text-xs text-gray-600 mt-0.5 max-w-lg">
                    Enter any family member's registered phone number (Head, Spouse, Son, Daughter) to automatically
                    match and display your complete household details and census records.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLinkFamily} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchPhoneInput}
                    onChange={(e) => setSearchPhoneInput(e.target.value)}
                    placeholder="e.g. 9847111050"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:border-emerald-500 outline-none bg-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLinkingFamily || !searchPhoneInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  {isLinkingFamily ? <Loader2 size={12} className="animate-spin" /> : <Search size={12} />}
                  <span>Connect</span>
                </button>
              </form>
            </div>
            {linkError && <p className="text-xs text-red-600 mt-2 pl-1 font-medium">{linkError}</p>}
            {linkSuccess && (
              <p className="text-xs text-emerald-700 font-semibold mt-2 pl-1 flex items-center gap-1">
                <CheckCircle2 size={14} /> {linkSuccess}
              </p>
            )}
          </Card>
        )}
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
                  <div key={p._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 capitalize truncate">{p.type} Contribution</p>
                      <p className="text-xs text-gray-400 truncate">{p.month || 'Direct'} · {p.receiptNumber || 'Ref: ' + (p.paymentNumber || p._id?.slice(-8))}</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-800 font-mono">₹{p.amount}</span>
                      <PaymentStatusBadge status={p.status.toLowerCase() as any} />
                      {p.status === 'PAID' ? (
                        <Link
                          to={`/app/payments/${p._id}/invoice`}
                          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                        >
                          Invoice
                        </Link>
                      ) : (
                        <Link
                          to="/app/my-payments"
                          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                        >
                          Pay
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {duesStatus === 'PENDING' && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-amber-700">
                  Your monthly contribution of <strong>₹{d?.duesAmount || 250}</strong> for this month is currently pending.
                </p>
                <Link to="/app/my-payments" className="text-xs font-bold bg-amber-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-amber-700 transition-colors shadow-sm">
                  Pay with Razorpay
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
