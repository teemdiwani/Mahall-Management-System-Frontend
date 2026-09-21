import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, FileCheck, ShieldAlert, GraduationCap, Building, ArrowRight, Phone } from 'lucide-react';

export const ServicesPublicPage: React.FC = () => {
  const services = [
    {
      icon: <Heart className="text-rose-500" size={28} />,
      title: 'Welfare & Zakat Assistance',
      category: 'Social Support',
      desc: 'Financial grants for life-saving medical treatments, monthly destitute pensions, monthly ration kits, and housing repair support.',
      features: ['100% verified beneficiary selection', 'Zero overhead deductions from Zakat', 'Discreet bank transfer or direct relief'],
    },
    {
      icon: <Users className="text-purple-600" size={28} />,
      title: 'Nikah & Marriage Registry',
      category: 'Family Life',
      desc: 'Official marriage registration, solemnization by Mahall Qazi/Imam, digital marriage certificate issuance, and pre-marital guidance.',
      features: ['Official Mahall marriage certificate', 'Pre-marital counselling sessions', 'Mosque ceremony coordination'],
    },
    {
      icon: <ShieldAlert className="text-emerald-600" size={28} />,
      title: 'Funeral & Janazah Services',
      category: 'Cemetery & Burial',
      desc: 'Round-the-clock emergency support for departed souls: ritual bathing (ghusl), burial shroud (kafan), janazah congregation, and cemetery grave plot.',
      features: ['24/7 mortuary cooler access', 'Trained ghusl team for men & women', 'Permanent cemetery record tracking'],
    },
    {
      icon: <FileCheck className="text-blue-600" size={28} />,
      title: 'Dispute Resolution & Conciliation',
      category: 'Arbitration',
      desc: 'The Mahall Arbitration Committee assists families in resolving civil, marital, and inheritance disagreements peacefully under Shariah guidelines.',
      features: ['Confidential hearings', 'Senior scholar arbitration', 'Avoid costly court litigation'],
    },
    {
      icon: <GraduationCap className="text-amber-600" size={28} />,
      title: 'Higher Education Scholarships',
      category: 'Education',
      desc: 'Annual education scholarships and career counselling for deserving students pursuing professional degrees (engineering, medicine, nursing, civil services).',
      features: ['Merit-cum-means selection', 'Guidance mentorship circles', 'Direct college tuition support'],
    },
    {
      icon: <Building className="text-teal-600" size={28} />,
      title: 'Community Hall & Equipment Rental',
      category: 'Infrastructure',
      desc: 'Subsidized rental of Mahall Community Hall, dining equipment, sound systems, and marquees for weddings and family gatherings.',
      features: ['Seating capacity of 400+', 'Subsidized rates for Mahall families', 'Full kitchen and catering utensils'],
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-400/30">
            Comprehensive Community Care
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Mahall Community Services
          </h1>
          <p className="text-base sm:text-lg text-teal-100 max-w-2xl mx-auto leading-relaxed">
            From social welfare and educational support to marriage solemnization and funeral care — serving our members through every stage of life.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl border border-gray-200 bg-white hover:border-teal-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
                  {s.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
                  {s.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{s.desc}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <ul className="space-y-2 mb-5">
                  {s.features.map((f, fIdx) => (
                    <li key={fIdx} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 group"
                >
                  Apply for this service <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Assistance Banner */}
      <section className="py-12 bg-red-50 border-t border-red-100 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Urgent Support</span>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">Need Emergency Funeral or Medical Relief?</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Our 24/7 emergency response helpline is always on standby for sudden bereavement or critical hospitalization.
            </p>
          </div>
          <a
            href="tel:+914952345678"
            className="shrink-0 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Phone size={16} /> +91 495 2345678
          </a>
        </div>
      </section>
    </div>
  );
};

export default ServicesPublicPage;
