import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Moon, BookOpen, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { mosqueApi } from '../../api/domainApis';

export const MosquePublicPage: React.FC = () => {
  const { data: mosqueRes } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: mosqueApi.getInfo,
  });

  const mosque = mosqueRes?.data;
  const prayerTimings = mosque?.prayerTimings || {
    fajr: '05:15 AM',
    dhuhr: '12:35 PM',
    asr: '04:15 PM',
    maghrib: '06:35 PM',
    isha: '08:00 PM',
    jumah: '12:45 PM',
  };

  const jumah = mosque?.jumahDetails || {
    khatib: 'Usthad Abdullah Faizy',
    topic: 'Strengthening Mahall Brotherhood & Mutual Support',
    khutbahTime: '12:30 PM',
    prayerTime: '01:00 PM',
  };

  const programs = mosque?.programs || [
    {
      title: 'Daily Darsul Quran',
      dayTime: 'Daily after Fajr (30 mins)',
      instructor: 'Usthad Abdullah Faizy',
      description: 'Tafseer of selected Surahs with practical lessons for daily life.',
    },
    {
      title: 'Weekly Hadith Majlis',
      dayTime: 'Every Thursday after Maghrib',
      instructor: 'Usthad Abdullah Faizy',
      description: 'Riyad us-Saliheen reading and community du’a for health and well-being.',
    },
    {
      title: 'Youth Moral Circle',
      dayTime: 'Every Saturday 7:00 PM',
      instructor: 'Hafiz Salman Nadwi',
      description: 'Interactive discussions on contemporary challenges facing young Muslims.',
    },
  ];

  const prayers = [
    { name: 'Fajr', adhan: prayerTimings.fajr, iqamah: '05:45 AM' },
    { name: 'Dhuhr', adhan: prayerTimings.dhuhr, iqamah: '01:00 PM' },
    { name: 'Asr', adhan: prayerTimings.asr, iqamah: '04:45 PM' },
    { name: 'Maghrib', adhan: prayerTimings.maghrib, iqamah: '06:45 PM' },
    { name: 'Isha', adhan: prayerTimings.isha, iqamah: '08:20 PM' },
  ];

  const facilities = [
    { title: 'Air-Conditioned Prayer Hall', desc: 'Spacious carpeted prayer hall accommodating over 1,200 worshippers in comfort.' },
    { title: 'Separate Women’s Section', desc: 'Dedicated air-conditioned mezzanine prayer hall with private entrance and wudu facilities.' },
    { title: 'Modern Wudu & Washrooms', desc: 'Clean, continuous running water with specialized seating for elderly and disabled worshippers.' },
    { title: 'Islamic Reference Library', desc: 'Over 1,500 classical and contemporary Islamic texts, Qur’an translations, and journals.' },
    { title: 'Funeral & Janazah Suite', desc: 'Modern mortuary cooler and dignified ghusl facility available 24/7 for community members.' },
    { title: 'Secure Parking', desc: 'Covered parking space for two-wheelers and adjoining car parking with security monitoring.' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                <Moon size={14} /> House of Allah • Central Juma Masjid
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {mosque?.name || 'Al-Noor Central Juma Masjid'}
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg leading-relaxed max-w-xl">
                The spiritual heart of our community, welcoming worshippers for five daily prayers, Jumu'ah congregations, and continuous Islamic learning.
              </p>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-emerald-200 pt-2">
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-emerald-400" /> {mosque?.address || 'Mosque Road, North Ward, Mahall District'}</span>
                <span className="flex items-center gap-1.5"><Users size={16} className="text-emerald-400" /> Capacity: {mosque?.capacity || 1200} worshippers</span>
              </div>
            </div>

            {/* Next Prayer Highlight Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Friday Congregation</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-xs font-bold">JUMU'AH</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-emerald-200 block">Khatib & Speaker</span>
                  <p className="font-bold text-lg text-white">{jumah.khatib}</p>
                </div>
                <div>
                  <span className="text-xs text-emerald-200 block">Khutbah Topic</span>
                  <p className="text-sm font-medium text-emerald-100">{jumah.topic}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-emerald-200 block">Khutbah Starts</span>
                    <span className="text-base font-black text-white">{jumah.khutbahTime}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-emerald-200 block">Salat Starts</span>
                    <span className="text-base font-black text-white">{jumah.prayerTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Prayer Timings Table */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Congregational Prayers</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Daily Prayer Timetable</h2>
          <p className="text-sm text-gray-500 mt-1">Timings updated according to Kozhikode lunar calculations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {prayers.map((p, idx) => (
            <div key={idx} className="p-5 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 text-center hover:border-emerald-300 hover:shadow-md transition-all">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">{p.name}</span>
              <div className="text-2xl font-black text-gray-900 my-1">{p.adhan}</div>
              <span className="text-xs text-gray-500 block">Iqamah: <strong className="text-gray-700">{p.iqamah}</strong></span>
            </div>
          ))}
        </div>
      </section>

      {/* Mosque Facilities */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Amenities</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Masjid Facilities & Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{fac.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Islamic Study Circles & Dars */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Spiritual Learning</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Ongoing Mosque Programs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((prog: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold mb-2">
                  <BookOpen size={16} />
                  <span>{prog.dayTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{prog.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{prog.description}</p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Instructor</span>
                <strong className="text-gray-800">{prog.instructor}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mosque Administration & Imam */}
      <section className="py-14 bg-emerald-50/60 px-4 sm:px-6 border-t border-emerald-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Spiritual Leadership & Staff</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm text-left">
              <span className="text-xs font-bold text-emerald-600">Chief Imam & Khatib</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{mosque?.imamName || 'Usthad Abdullah Faizy'}</h3>
              <p className="text-xs text-gray-600 mt-2">
                Available for spiritual guidance, family counselling, and solemnization of marriage after Asr prayer.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm text-left">
              <span className="text-xs font-bold text-emerald-600">Muezzin & Mosque In-Charge</span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{mosque?.muezzinName || 'Bilal Ahmed'}</h3>
              <p className="text-xs text-gray-600 mt-2">
                Responsible for the call to prayer, prayer hall maintenance, and sound system management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MosquePublicPage;
