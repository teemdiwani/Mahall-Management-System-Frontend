import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseNo: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', phone: '', houseNo: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-400/30">
            <MessageSquare size={14} /> Mahall Secretariat
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Get in Touch With Us
          </h1>
          <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Have an inquiry regarding family registration, certificates, or community welfare? We are here to serve you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Office Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-7 rounded-3xl bg-emerald-50/60 border border-emerald-100 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Mahall Office Information</h2>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Physical Address</h3>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    Al-Noor Mahall Office & Community Centre<br />
                    Mosque Road, North Ward, Kozhikode, Kerala 673001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Phone & Helplines</h3>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    Office: +91 495 2345678<br />
                    24/7 Janazah Emergency: +91 98470 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Email</h3>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    office@alnoormahall.org<br />
                    secretary@alnoormahall.org
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-emerald-200/60 pt-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Secretariat Timings</h3>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    <strong>Mon – Sat:</strong> 09:00 AM – 01:00 PM & 04:30 PM – 07:30 PM<br />
                    <strong>Friday:</strong> Closed during Jumu'ah hours (12:00 PM – 02:00 PM)<br />
                    <strong>Sunday:</strong> 09:30 AM – 12:30 PM (Office only)
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Help Card */}
            <div className="p-6 rounded-3xl bg-teal-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Need quick answers on WhatsApp?</h4>
                <p className="text-xs text-teal-200 mt-0.5">Send a message to our official community bot</p>
              </div>
              <a
                href="https://wa.me/914952345678"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shrink-0"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact & Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
              <p className="text-xs text-gray-500 mb-6">
                Your message will be routed directly to the General Secretary or appropriate department committee.
              </p>

              {submitted && (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3 mb-6">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium">
                    Thank you! Your inquiry has been recorded. Our secretariat will contact you shortly.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohammed Farooq"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone / Mobile *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">House Number (if Mahall member)</label>
                    <input
                      type="text"
                      placeholder="e.g. 108 / Ward 2"
                      value={formData.houseNo}
                      onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Department *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="">Select Topic</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Family Census Registration">Family Census Registration</option>
                      <option value="Madrasa Admissions">Madrasa Admissions</option>
                      <option value="Welfare / Medical Assistance">Welfare / Medical Assistance</option>
                      <option value="Marriage Solemnization">Marriage Solemnization</option>
                      <option value="Hall / Equipment Booking">Hall / Equipment Booking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Message or Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your query or request with relevant family details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={15} /> Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
