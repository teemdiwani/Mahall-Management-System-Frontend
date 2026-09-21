import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, AlertTriangle, Bell, Search, Loader2 } from 'lucide-react';
import { announcementsApi } from '../../api/domainApis';

export const AnnouncementsPublicPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: annRes, isLoading } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: announcementsApi.list,
  });

  const allAnnouncements = annRes?.data || [
    {
      _id: 'a1',
      title: 'Ramadan 1447 Moon Sighting & Timetable Release',
      content: 'The Hilal sighting committee of Kozhikode will convene on 29th Sha’ban. The official Ramadan calendar and Iftar timetable have been published and are available at the Mahall office and online.',
      category: 'RAMADAN',
      isUrgent: false,
      date: '2026-03-10',
    },
    {
      _id: 'a2',
      title: 'Janazah Notice: Marhoom K.T. Abdul Khader Haji',
      content: 'Inna lillahi wa inna ilayhi raji’un. K.T. Abdul Khader Haji (Age 76, House #142) passed away. Janazah prayer will be held today after Asr prayer at Al-Noor Central Masjid, followed by burial at the Mahall cemetery.',
      category: 'FUNERAL',
      isUrgent: true,
      date: '2026-03-15',
    },
    {
      _id: 'a3',
      title: 'Annual General Assembly (Mahall General Body) Meeting',
      content: 'All registered family heads are requested to attend the Annual General Assembly meeting on Sunday, 5th April at 09:30 AM at the Mahall Community Hall to approve the audited financial accounts.',
      category: 'MEETING',
      isUrgent: false,
      date: '2026-03-14',
    },
    {
      _id: 'a4',
      title: 'Zakat al-Fitr & Eid Welfare Distribution Drive',
      content: 'Collection of Zakat al-Fitr has commenced. Families are requested to deposit their contributions to the centralized Zakat fund before 27th Ramadan to ensure timely distribution to eligible households.',
      category: 'WELFARE',
      isUrgent: false,
      date: '2026-03-08',
    },
  ];

  const filtered = allAnnouncements.filter((a: any) => {
    const matchesCat = activeCategory === 'ALL' || a.category === activeCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.content && a.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', 'FUNERAL', 'RAMADAN', 'MEETING', 'WELFARE', 'GENERAL'];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-semibold mb-4 border border-slate-400/30">
            <Megaphone size={14} /> Official Mahall Notice Board
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Announcements & Notices
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stay informed with verified news, bereavement notices, general body updates, and community alerts.
          </p>
        </div>
      </section>

      {/* Filter / Search Bar */}
      <section className="border-b border-gray-100 bg-gray-50 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'All Notices' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
            <Bell className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Announcements Found</h3>
            <p className="text-xs text-gray-500">There are no notices matching your selected filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((item: any) => {
              const isUrgent = item.isUrgent || item.category === 'FUNERAL';
              return (
                <div
                  key={item._id}
                  className={`p-6 sm:p-7 rounded-3xl border transition-all ${
                    isUrgent
                      ? 'bg-red-50/40 border-red-200 shadow-sm'
                      : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isUrgent
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {item.category || 'NOTICE'}
                      </span>
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                          <AlertTriangle size={13} /> URGENT NOTICE
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">{item.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AnnouncementsPublicPage;
