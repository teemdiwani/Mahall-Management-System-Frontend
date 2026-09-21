import React from 'react';
import { Moon, Book, Users, Megaphone, Loader2 } from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { mosqueApi, announcementsApi } from '../../../api/domainApis';

const MosqueDashboard: React.FC = () => {
  const { data: mosqueRes, isLoading: isMosqueLoading } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: mosqueApi.getInfo,
  });

  const { data: annRes } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  const mosque = mosqueRes?.data;
  const announcements = annRes?.data || [];
  const mosqueAnnouncements = announcements.filter(
    (a: any) =>
      a.category?.toLowerCase() === 'mosque' ||
      a.category?.toLowerCase() === 'urgent'
  );

  const prayerTimings = mosque?.prayerTimings || {
    fajr: '05:15 AM',
    dhuhr: '12:35 PM',
    asr: '04:15 PM',
    maghrib: '06:35 PM',
    isha: '08:00 PM',
    jumah: '12:45 PM',
  };

  const prayers = [
    { name: 'Fajr', adhan: prayerTimings.fajr, iqamah: '05:45 AM' },
    { name: 'Dhuhr', adhan: prayerTimings.dhuhr, iqamah: '01:00 PM' },
    { name: 'Asr', adhan: prayerTimings.asr, iqamah: '04:45 PM' },
    { name: 'Maghrib', adhan: prayerTimings.maghrib, iqamah: '06:45 PM' },
    { name: 'Isha', adhan: prayerTimings.isha, iqamah: '08:20 PM' },
  ];

  const jumahTime = prayerTimings.jumah || mosque?.jumahDetails?.prayerTime || '12:45 PM';
  const programs = mosque?.programs || [];

  return (
    <div>
      <PageHeader
        title="Mosque Management"
        subtitle={mosque?.name ? `${mosque.name} — Imam Dashboard` : 'Al-Noor Mosque — Imam Dashboard'}
        breadcrumb={[{ label: 'Dashboard' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Programs"
          value={String(programs.length)}
          icon={<Book size={20} />}
        />
        <StatCard
          label="Capacity"
          value={mosque?.capacity ? `${mosque.capacity}+` : '1,200+'}
          icon={<Megaphone size={20} />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Imam"
          value={mosque?.imamName ? 'Active' : '1'}
          icon={<Users size={20} />}
          iconBg="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Friday Prayers"
          value="Fridays"
          icon={<Moon size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          subtitle={jumahTime ? `Jumu'ah: ${jumahTime}` : 'N/A'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Prayer Schedule */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Today's Prayer Schedule</CardTitle>
              <Badge variant="emerald">Friday — Jumu'ah: {jumahTime}</Badge>
            </CardHeader>
            {isMosqueLoading ? (
              <div className="py-8 flex justify-center text-gray-400">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {prayers.map((p) => (
                  <div
                    key={p.name}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 text-center"
                  >
                    <p className="text-xs font-semibold text-emerald-600 mb-1">{p.name}</p>
                    <p className="text-lg font-bold text-gray-800">{p.adhan}</p>
                    <p className="text-xs text-gray-500 mt-1">Iqamah: {p.iqamah}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Programs */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Mosque Programs</CardTitle>
              <a href="/app/mosque/programs" className="text-xs text-emerald-600 hover:underline">
                Manage
              </a>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {programs.length === 0 ? (
                <p className="text-sm text-gray-500 py-3 text-center">No mosque programs scheduled</p>
              ) : (
                programs.map((prog: any, idx: number) => (
                  <div
                    key={prog._id || idx}
                    className="flex items-start justify-between p-3 rounded-xl bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{prog.title}</p>
                      <p className="text-xs text-gray-500">{prog.dayTime}</p>
                      {prog.instructor && (
                        <p className="text-xs text-emerald-600 mt-0.5">{prog.instructor}</p>
                      )}
                      {prog.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{prog.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="emerald" size="sm">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          {/* Imam Info */}
          <Card padding="md">
            <CardTitle>Imam Information</CardTitle>
            <div className="mt-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Users size={28} className="text-emerald-600" />
              </div>
              <p className="font-bold text-gray-800">{mosque?.imamName || 'Usthad Abdullah Faizy'}</p>
              <p className="text-sm text-gray-500 mt-1">Senior Khatib & Islamic Scholar</p>
              <p className="text-xs text-gray-400 mt-0.5">15+ years experience</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: 'Phone', value: mosque?.phone || '+91 495 2345678' },
                { label: 'Email', value: mosque?.email || 'masjid@mahallconnect.org' },
                { label: 'Address', value: mosque?.address || 'Mosque Road, North Ward' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0"
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700 font-medium truncate max-w-[160px] text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Mosque Announcements */}
          <Card padding="md">
            <CardTitle>Mosque Announcements</CardTitle>
            <div className="flex flex-col gap-3 mt-4">
              {mosqueAnnouncements.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">No active announcements</p>
              ) : (
                mosqueAnnouncements.slice(0, 4).map((ann: any) => (
                  <div key={ann._id || ann.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          ann.category?.toLowerCase() === 'urgent'
                            ? 'bg-red-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ann.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MosqueDashboard;
