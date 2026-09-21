import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Book, Heart, DollarSign, Calendar, Building2, ChevronRight, Phone, Mail, MapPin, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { mosqueApi, eventsApi, announcementsApi } from '../../api/domainApis';

const stats = [
  { label: 'Member Families', value: '580+', icon: <Users size={20} />, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Total Members', value: '2,450+', icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Madrasa Students', value: '104', icon: <Book size={20} />, color: 'bg-purple-50 text-purple-600' },
  { label: 'Years of Service', value: '50+', icon: <Building2 size={20} />, color: 'bg-amber-50 text-amber-600' },
];

const services = [
  { icon: <Heart size={24} />, title: 'Welfare & Zakat', description: 'Financial assistance for families in need, Zakat distribution and welfare services.', color: 'bg-rose-50 border-rose-100', iconColor: 'text-rose-500' },
  { icon: <Book size={24} />, title: 'Madrasa Education', description: 'Quality Islamic education for children aged 5–16 with qualified teachers.', color: 'bg-purple-50 border-purple-100', iconColor: 'text-purple-500' },
  { icon: <DollarSign size={24} />, title: 'Community Finance', description: 'Transparent monthly collection, donation management and financial reporting.', color: 'bg-teal-50 border-teal-100', iconColor: 'text-teal-500' },
  { icon: <Users size={24} />, title: 'Family Services', description: 'Marriage support, funeral services, and family welfare programs.', color: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-500' },
  { icon: <Calendar size={24} />, title: 'Events & Programs', description: 'Religious programs, community events, blood donation camps and more.', color: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-500' },
  { icon: <Building2 size={24} />, title: 'Mosque Services', description: 'Daily prayers, Friday Jumu\'ah, Ramadan programs and Islamic education.', color: 'bg-emerald-50 border-emerald-100', iconColor: 'text-emerald-500' },
];

const HomePage: React.FC = () => {
  const { data: mosqueRes } = useQuery({
    queryKey: ['mosque-info'],
    queryFn: mosqueApi.getInfo,
  });

  const { data: eventsRes } = useQuery({
    queryKey: ['public-events'],
    queryFn: () => eventsApi.list({ status: 'UPCOMING' }),
  });

  const { data: annRes } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: announcementsApi.list,
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

  const prayers = [
    { name: 'Fajr', adhan: prayerTimings.fajr, iqamah: '05:45 AM' },
    { name: 'Dhuhr', adhan: prayerTimings.dhuhr, iqamah: '01:00 PM' },
    { name: 'Asr', adhan: prayerTimings.asr, iqamah: '04:45 PM' },
    { name: 'Maghrib', adhan: prayerTimings.maghrib, iqamah: '06:45 PM' },
    { name: 'Isha', adhan: prayerTimings.isha, iqamah: '08:20 PM' },
  ];
  const jumahTime = prayerTimings.jumah || mosque?.jumahDetails?.prayerTime || '12:45 PM';

  const upcomingEvents = (eventsRes?.data || []).slice(0, 3);
  const latestAnnouncements = (annRes?.data || []).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white/3 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-emerald-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {mosque?.name || 'Al-Noor Mahall'}, Kozhikode · Est. 1975
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Mahall,<br />
                <span className="text-emerald-300">Connected</span><br />
                Digitally.
              </h1>
              <p className="text-emerald-100 text-lg leading-relaxed mb-8 max-w-lg">
                One platform for families, members, services, finance, welfare, education and community activities. Join 2,450+ members already connected.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-2xl hover:bg-emerald-50 transition-colors text-center shadow-lg"
                >
                  Member Login
                </Link>
                <Link
                  to="/services"
                  className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors text-center"
                >
                  Explore Services
                </Link>
              </div>
            </div>

            {/* Prayer Times Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Moon size={18} className="text-emerald-300" />
                <p className="text-sm font-semibold text-emerald-200">Today's Prayer Times</p>
                <span className="ml-auto text-xs text-emerald-300">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex flex-col gap-2">
                {prayers.map((p) => (
                  <div key={p.name} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                    <span className="text-white font-medium">{p.name}</span>
                    <div className="text-right">
                      <p className="text-white font-bold">{p.adhan}</p>
                      <p className="text-emerald-300 text-xs">Iqamah: {p.iqamah}</p>
                    </div>
                  </div>
                ))}
              </div>
              {jumahTime && (
                <div className="mt-4 bg-white/10 rounded-xl p-3">
                  <p className="text-emerald-200 text-sm">🕌 Friday Jumu'ah: <span className="font-bold text-white">{jumahTime}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-2">Our Services</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything Your Community Needs</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From education to welfare, finance to events — Al-Noor Mahall provides comprehensive community services.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(service => (
            <div key={service.title} className={`rounded-2xl p-6 border ${service.color} hover:shadow-sm transition-shadow cursor-pointer group`}>
              <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm ${service.iconColor}`}>
                {service.icon}
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">{service.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              <div className="flex items-center gap-1 mt-4 text-emerald-600 text-sm font-medium">
                Learn more <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events & Announcements */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Events</p>
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                </div>
                <Link to="/events" className="text-sm text-emerald-600 hover:underline font-medium">View all →</Link>
              </div>
              <div className="flex flex-col gap-4">
                {upcomingEvents.map((ev: any) => (
                  <div key={ev._id || ev.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                    <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center flex-shrink-0">
                      <p className="text-xs text-emerald-600 font-semibold uppercase">{new Date(ev.date).toLocaleString('en', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-gray-800">{new Date(ev.date).getDate()}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{ev.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{ev.venue} · {ev.time || (ev.date ? new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')}</p>
                      <p className="text-xs text-emerald-600 mt-1">{ev.registeredUsers?.length ?? ev.registeredCount ?? 0} registered</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Notice Board</p>
                  <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
                </div>
                <Link to="/announcements" className="text-sm text-emerald-600 hover:underline font-medium">View all →</Link>
              </div>
              <div className="flex flex-col gap-4">
                {latestAnnouncements.map((ann: any) => (
                  <div key={ann._id || ann.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${ann.category?.toLowerCase() === 'urgent' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${ann.category?.toLowerCase() === 'urgent' ? 'text-red-500' : 'text-emerald-600'}`}>
                        {ann.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{ann.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{ann.publishedBy || 'Mahall Committee'} · {new Date(ann.publishedAt || ann.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-3">Join Al-Noor Mahall Community</h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto">Register as a member to access all services, track payments, apply for welfare, and stay connected with your community.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors">
                Register as Member
              </Link>
              <Link to="/login" className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
                Member Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: <MapPin size={20} />, label: 'Address', value: 'Meenangadi Road, Kozhikode, Kerala — 673001' },
              { icon: <Phone size={20} />, label: 'Phone', value: '+91 495 234 5678' },
              { icon: <Mail size={20} />, label: 'Email', value: 'info@alnoor.org' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  {item.icon}
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-gray-300 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
