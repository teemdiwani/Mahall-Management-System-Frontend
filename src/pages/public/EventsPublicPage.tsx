import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, Users, Search, Loader2, ArrowRight } from 'lucide-react';
import { eventsApi } from '../../api/domainApis';
import { Link } from 'react-router-dom';

export const EventsPublicPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const { data: eventsRes, isLoading } = useQuery({
    queryKey: ['public-events-list'],
    queryFn: () => eventsApi.list(),
  });

  const allEvents = eventsRes?.data || [
    {
      _id: 'e1',
      title: 'Annual Ramadan Spiritual Intensive & Iftar',
      description: 'Community gathering featuring pre-Iftar spiritual discourse by guest scholar followed by collective Iftar and Taraweeh.',
      date: '2026-03-20',
      time: '05:30 PM - 09:00 PM',
      location: 'Al-Noor Central Masjid Dining Complex',
      category: 'RELIGIOUS',
      capacity: 500,
      attendees: 320,
    },
    {
      _id: 'e2',
      title: 'Free Community Health & Diabetes Screening Camp',
      description: 'Comprehensive health checkup, blood pressure, sugar screening, and free consultations by specialist doctors from Kozhikode Medical College.',
      date: '2026-04-12',
      time: '08:00 AM - 01:00 PM',
      location: 'Mahall Community Hall',
      category: 'HEALTHCARE',
      capacity: 250,
      attendees: 180,
    },
    {
      _id: 'e3',
      title: 'Youth Career Guidance & Civil Services Orientation',
      description: 'Guidance seminar for high school and university students featuring civil servants, tech mentors, and scholarship advisors.',
      date: '2026-04-26',
      time: '10:00 AM - 01:30 PM',
      location: 'Madrasa Auditorium',
      category: 'EDUCATION',
      capacity: 150,
      attendees: 95,
    },
    {
      _id: 'e4',
      title: 'Meelad-un-Nabi Inter-Madrasa Arts Fest',
      description: 'Celebration of the Prophet’s life with Qira’at, Islamic songs, calligraphy exhibitions, and prize distribution for young talents.',
      date: '2026-05-15',
      time: '09:00 AM - 05:00 PM',
      location: 'Main Grounds & Auditorium',
      category: 'CULTURAL',
      capacity: 600,
      attendees: 420,
    },
  ];

  const filteredEvents = allEvents.filter((event: any) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'ALL' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'RELIGIOUS', 'HEALTHCARE', 'EDUCATION', 'CULTURAL'];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-amber-950 via-amber-900 to-emerald-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-4 border border-amber-400/30">
            <Calendar size={14} /> Mahall Community Calendar
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Events & Gatherings
          </h1>
          <p className="text-base sm:text-lg text-amber-100 max-w-2xl mx-auto leading-relaxed">
            Stay engaged with religious discourses, health camps, educational seminars, and community festivals.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="border-b border-gray-100 bg-gray-50 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat === 'ALL' ? 'All Events' : cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
            <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Events Found</h3>
            <p className="text-xs text-gray-500">Try changing your search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt: any) => (
              <div
                key={evt._id}
                className="bg-white rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      {evt.category || 'COMMUNITY'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(evt.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">{evt.description}</p>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-gray-100 bg-gray-50/50 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-emerald-600 shrink-0" />
                    <span>{evt.time || 'Schedule to be announced'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{evt.location || 'Al-Noor Central Masjid'}</span>
                  </div>
                  {evt.capacity && (
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-emerald-600 shrink-0" />
                      <span>{evt.capacity} seats capacity</span>
                    </div>
                  )}

                  <div className="pt-3">
                    <Link
                      to="/login"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      Register / RSVP <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsPublicPage;
