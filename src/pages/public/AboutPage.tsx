import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Heart, BookOpen, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const leadership = [
    { name: 'Janab K.P. Alavi Haji', role: 'Mahall President', term: '2022 – Present', bio: 'Community visionary with over 30 years of social leadership and philanthropic governance in Kozhikode.' },
    { name: 'Usthad Abdullah Faizy', role: 'Chief Imam & Khatib', term: '2015 – Present', bio: 'Distinguished Islamic scholar, graduate of Darul Huda, leading religious guidance and community dars.' },
    { name: 'P.M. Mohammed Kutty', role: 'General Secretary', term: '2023 – Present', bio: 'Oversees day-to-day operations, official documentation, government liaisons, and assembly proceedings.' },
    { name: 'C.H. Basheer Ahmad', role: 'Treasurer', term: '2021 – Present', bio: 'Chartered accountant leading financial transparency, zakat auditing, and community fund accounting.' },
  ];

  const milestones = [
    { year: '1974', title: 'Foundation Laid', desc: 'The historic foundation of Al-Noor Masjid was laid by eminent community elders.' },
    { year: '1988', title: 'Madrasa Establishment', desc: 'Inauguration of Al-Noor Noorul Islam Madrasa providing structured Islamic curricula.' },
    { year: '2005', title: 'Welfare & Zakat Cell', desc: 'Formalization of centralized Zakat collection, emergency medical aid, and pension schemes.' },
    { year: '2018', title: 'Community Complex Expansion', desc: 'Addition of the community dining hall, library, and modern administrative offices.' },
    { year: '2024', title: 'Digital Mahall Platform', desc: 'Launch of the integrated digital Mahall management system with digital IDs and records.' },
  ];

  const values = [
    {
      icon: <Shield className="text-emerald-600" size={24} />,
      title: 'Trust & Transparency',
      desc: '100% financial auditing, open general body accounts, and verifiable welfare distributions.',
    },
    {
      icon: <Heart className="text-rose-500" size={24} />,
      title: 'Compassion & Dignity',
      desc: 'Uncompromising discretion and empathy for families seeking medical or financial assistance.',
    },
    {
      icon: <BookOpen className="text-blue-600" size={24} />,
      title: 'Lifelong Education',
      desc: 'Fostering moral uprightness and intellectual excellence for our children and youth.',
    },
    {
      icon: <Users className="text-amber-600" size={24} />,
      title: 'Community Unity',
      desc: 'Bringing every family together regardless of economic background under the shade of brotherhood.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white py-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-6 border border-emerald-400/30">
            <Award size={14} /> Five Decades of Service (1974 - 2024)
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Building a Vibrant, Caring & Connected Mahall
          </h1>
          <p className="text-lg text-emerald-100 max-w-3xl mx-auto leading-relaxed">
            Al-Noor Mahall serves over 580 registered Muslim families in Kozhikode through spiritual nourishment,
            educational advancement, compassionate welfare, and modern civic infrastructure.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Our Mission & Purpose</span>
            <h2 className="text-3xl font-bold text-gray-900 leading-snug">
              Serving the Community from Cradle to Grave with Divine Values
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a self-sustaining Mahall community where every child receives quality Islamic education,
              no household sleeps hungry, illnesses are treated without destitution, and the bonds of kinship
              and mutual love flourish.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Centralized Zakat & Medical Aid Fund with zero administrative deductions',
                'Comprehensive 10-level Madrasa system affiliated with recognized board',
                'Dispute resolution and family counselling services led by senior scholars',
                'Respectful and dignified funeral arrangements & cemetery maintenance',
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col justify-center text-center">
              <span className="text-4xl font-black text-emerald-700 mb-1">580+</span>
              <span className="text-sm font-semibold text-gray-700">Registered Families</span>
              <span className="text-xs text-gray-500 mt-1">Under Mahall Census</span>
            </div>
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-100 flex flex-col justify-center text-center">
              <span className="text-4xl font-black text-teal-700 mb-1">2,450+</span>
              <span className="text-sm font-semibold text-gray-700">Mahall Members</span>
              <span className="text-xs text-gray-500 mt-1">Across 4 Sub-wards</span>
            </div>
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-center text-center">
              <span className="text-4xl font-black text-blue-700 mb-1">104</span>
              <span className="text-sm font-semibold text-gray-700">Madrasa Students</span>
              <span className="text-xs text-gray-500 mt-1">Classes 1 to 10</span>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col justify-center text-center">
              <span className="text-4xl font-black text-amber-700 mb-1">50 yrs</span>
              <span className="text-sm font-semibold text-gray-700">Heritage of Harmony</span>
              <span className="text-xs text-gray-500 mt-1">Established in 1974</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Our Principles</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Guided by Faith, Governance & Care</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Elected Governance</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">Mahall Executive Leadership</h2>
          <p className="text-sm text-gray-500 mt-2">
            Elected by the Mahall General Assembly to safeguard community welfare and spiritual dignity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((leader, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:border-emerald-300 transition-colors">
              <div className="h-2 bg-emerald-600" />
              <div className="p-5">
                <span className="text-xs font-bold text-emerald-600">{leader.term}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{leader.name}</h3>
                <p className="text-xs font-semibold text-emerald-700 mb-3">{leader.role}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{leader.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Milestones */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 border-t border-gray-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-emerald-600 text-xs font-bold tracking-wider uppercase">Our Journey</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">Milestones Over 50 Years</h2>
          </div>
          <div className="relative border-l-2 border-emerald-200 ml-4 md:ml-32 space-y-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative pl-6 md:pl-8 group">
                <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-white border-4 border-emerald-600 group-hover:scale-125 transition-transform" />
                <span className="text-xs font-black text-emerald-600 tracking-wide uppercase">{m.year}</span>
                <h3 className="text-base font-bold text-gray-900">{m.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-10 sm:p-14 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Are you a Mahall resident?</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Register your family into the official Mahall Census, access welfare programs, enroll students in madrasa, and stay updated.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-emerald-800 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-md flex items-center gap-2 text-sm"
            >
              Register Family Online <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-emerald-800/60 hover:bg-emerald-800 text-white font-semibold rounded-xl border border-emerald-400/40 transition-colors text-sm"
            >
              Contact Mahall Office
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
