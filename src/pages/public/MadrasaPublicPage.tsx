import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, Clock, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export const MadrasaPublicPage: React.FC = () => {
  const levels = [
    { grade: 'Primary (Classes 1–4)', age: 'Age 5–9', subjects: ['Qur’an Reading & Noorani Qaida', 'Basics of Salah & Wudu', 'Islamic Etiquette & Adab', 'Short Surahs Memorization'] },
    { grade: 'Middle (Classes 5–7)', age: 'Age 10–12', subjects: ['Advanced Tajweed Rules', 'Fiqh of Purification & Fasting', 'Seerah of Prophet Muhammad (PBUH)', 'Basic Arabic Grammar'] },
    { grade: 'Secondary (Classes 8–10)', age: 'Age 13–16', subjects: ['Comprehensive Islamic Jurisprudence', 'Hadith Sciences & Morality', 'Contemporary Moral Issues', 'Public Speaking & Dawah Skills'] },
  ];

  const highlights = [
    { title: 'Recognized Curriculum', desc: 'Syllabus aligned with the Islamic Educational Board of India with state-level examinations.' },
    { title: 'Experienced Mudarris', desc: 'Faculty holding Sanad from premier Islamic universities dedicated to child moral development.' },
    { title: 'Smart Classrooms', desc: 'Digital audio-visual aids for Tajweed pronunciation correction and interactive Islamic history.' },
    { title: 'Annual Meelad & Arts Fest', desc: 'Annual competitions in Qira’at, Islamic songs, elocution, quiz, and calligraphy.' },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
              <GraduationCap size={14} /> Noorul Islam Madrasa (Govt. Reg. #412)
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Nurturing Faith, Knowledge & Moral Excellence in Every Child
            </h1>
            <p className="text-purple-100 text-base sm:text-lg leading-relaxed">
              Serving 100+ children from our Mahall with structured, compassionate Islamic education from foundational reading to advanced Islamic jurisprudence.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-white text-purple-900 font-bold rounded-xl text-sm hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-2"
              >
                Enroll Your Child <ArrowRight size={15} />
              </Link>
              <Link
                to="/contact"
                className="px-5 py-2.5 bg-purple-800/60 text-white font-medium rounded-xl text-sm border border-purple-400/30 hover:bg-purple-800 transition-colors"
              >
                Inquire Admissions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-gray-100 bg-purple-50/40 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-purple-900">104</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Enrolled Students</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-900">10</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Class Standards</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-900">8</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Certified Teachers</div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-900">100%</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">Board Pass Rate</div>
          </div>
        </div>
      </section>

      {/* Curriculum Levels */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-purple-600 text-xs font-bold tracking-wider uppercase">Academic Structure</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Syllabus & Progression</h2>
          <p className="text-sm text-gray-500 mt-1">A step-by-step curriculum fostering Quranic literacy and ethical character.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((lvl, idx) => (
            <div key={idx} className="p-6 rounded-2xl border-2 border-purple-100 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">{lvl.age}</span>
                  <BookOpen size={18} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{lvl.grade}</h3>
                <ul className="space-y-2 mb-6">
                  {lvl.subjects.map((sub, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 size={14} className="text-purple-600 mt-0.5 shrink-0" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Schedule & Timings */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-purple-600 text-xs font-bold tracking-wider uppercase">School Timings</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Class Schedules</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="text-purple-600" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Morning Shift</h3>
                  <span className="text-xs text-purple-600 font-semibold">Primary & Secondary</span>
                </div>
              </div>
              <div className="text-2xl font-black text-gray-800 my-2">07:00 AM – 08:30 AM</div>
              <p className="text-xs text-gray-600">Monday through Saturday. Designed to precede regular school hours without conflict.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900">Weekend Special Dars</h3>
                  <span className="text-xs text-purple-600 font-semibold">Hifz & Tajweed Intensive</span>
                </div>
              </div>
              <div className="text-2xl font-black text-gray-800 my-2">08:00 AM – 11:30 AM</div>
              <p className="text-xs text-gray-600">Every Sunday. Dedicated to Quran memorization and youth leadership mentoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-purple-600 text-xs font-bold tracking-wider uppercase">Why Choose Al-Noor</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Holistic Islamic Education</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{h.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MadrasaPublicPage;
