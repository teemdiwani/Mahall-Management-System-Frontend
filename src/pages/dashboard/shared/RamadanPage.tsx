import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Moon, DollarSign, Heart, Star, Book, CreditCard, Loader2, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { ramadanApi, paymentsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const defaultTimetable = [
  { date: '2026-02-18', suhoorEnd: '5:12 AM', fajr: '5:17 AM', iftar: '6:36 PM' },
  { date: '2026-02-19', suhoorEnd: '5:12 AM', fajr: '5:17 AM', iftar: '6:36 PM' },
  { date: '2026-02-20', suhoorEnd: '5:11 AM', fajr: '5:16 AM', iftar: '6:37 PM' },
  { date: '2026-02-21', suhoorEnd: '5:11 AM', fajr: '5:16 AM', iftar: '6:37 PM' },
  { date: '2026-02-22', suhoorEnd: '5:10 AM', fajr: '5:15 AM', iftar: '6:38 PM' },
  { date: '2026-02-23', suhoorEnd: '5:10 AM', fajr: '5:15 AM', iftar: '6:38 PM' },
  { date: '2026-02-24', suhoorEnd: '5:09 AM', fajr: '5:14 AM', iftar: '6:39 PM' },
];

const ramadanPrograms = [
  { title: 'Daily Taraweeh Prayer (20 Rakaats)', time: '8:15 PM', imam: 'Hafiz Salman Faizy & Hafiz Bilal Ahmed', type: 'prayer' },
  { title: 'Fajr Quran Tafsir Circle', time: 'After Fajr (5:45 AM)', imam: 'Chief Imam Moulavi Ibrahim', type: 'education' },
  { title: "Women's Quran Halaqa & Tajweed", time: '10:00 AM', imam: 'Ustaza Hana Al-Bukhari', type: 'education' },
  { title: 'Community Iftar & Kanji Distribution', time: '6:15 PM', imam: 'Daily at Mahall Hall', type: 'food' },
  { title: 'Qiyam-ul-Layl (Last 10 Nights)', time: '2:30 AM', imam: 'Visiting Qaris', type: 'prayer' },
  { title: 'Central Zakat & Fitrah Collection Desk', time: 'All Days 9AM - 8PM', imam: 'Treasurer Mustafa Al-Amin', type: 'finance' },
];

const RamadanPage: React.FC = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showIftarModal, setShowIftarModal] = useState(false);
  const [showZakatModal, setShowZakatModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Forms
  const [iftarForm, setIftarForm] = useState({
    amount: '2500',
    donorName: user?.name || '',
    phone: user?.phone || '',
    notes: 'Community Iftar Sponsorship',
  });

  const [zakatForm, setZakatForm] = useState({
    type: 'FITRAH',
    personsCount: 4,
    customAmount: '',
    donorName: user?.name || '',
    phone: user?.phone || '',
    notes: 'Zakat al-Fitr (Fitrah)',
  });

  const { data: scheduleRes, isLoading } = useQuery({
    queryKey: ['ramadan-schedule'],
    queryFn: ramadanApi.getSchedule,
  });

  const s = scheduleRes?.data;
  const timetable = s?.dailyTimetable?.length > 0 ? s.dailyTimetable : defaultTimetable;
  const iftarPrograms = s?.iftarPrograms || [];
  const stats = s?.stats || {
    totalIftarRaised: 0,
    iftarSponsorsCount: 0,
    totalZakatRaised: 0,
    totalFitrahRaised: 0,
    activePrograms: 0,
  };

  const fitrahRate = s?.fitrahRate || 100;
  const calculatedFitrahAmount = zakatForm.type === 'FITRAH' ? zakatForm.personsCount * fitrahRate : Number(zakatForm.customAmount || 0);

  const handleIftarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iftarForm.amount || Number(iftarForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Razorpay payment gateway failed to load. Please check your internet connection.');
        setIsPaying(false);
        return;
      }

      const { data: orderData } = await paymentsApi.contributeOnline({
        amount: Number(iftarForm.amount),
        type: 'IFTAR',
        donorName: iftarForm.donorName || user?.name || 'Anonymous Donor',
        phone: iftarForm.phone || user?.phone,
        notes: `[Iftar Fund] ${iftarForm.notes}`,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Central Mahallu',
        description: 'Ramadan Community Iftar Sponsorship',
        order_id: orderData.orderId,
        prefill: {
          name: iftarForm.donorName || user?.name || '',
          contact: iftarForm.phone || user?.phone || '',
          email: user?.email || '',
        },
        theme: { color: '#059669' },
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyRazorpay(orderData.payment._id, response);
            qc.invalidateQueries({ queryKey: ['ramadan-schedule'] });
            setShowIftarModal(false);
            navigate(`/app/payments/${orderData.payment._id}/invoice`);
          } catch (err: any) {
            alert('Payment verification failed: ' + (err.message || 'Signature mismatch'));
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setIsPaying(false);
    }
  };

  const handleZakatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = zakatForm.type === 'FITRAH' ? calculatedFitrahAmount : Number(zakatForm.customAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Razorpay payment gateway failed to load. Please check your internet connection.');
        setIsPaying(false);
        return;
      }

      const { data: orderData } = await paymentsApi.contributeOnline({
        amount: finalAmount,
        type: zakatForm.type as any,
        donorName: zakatForm.donorName || user?.name || 'Anonymous Donor',
        phone: zakatForm.phone || user?.phone,
        notes: zakatForm.type === 'FITRAH' ? `Fitrah for ${zakatForm.personsCount} family persons` : zakatForm.notes,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Central Mahallu',
        description: `${zakatForm.type === 'FITRAH' ? 'Zakat al-Fitr (Fitrah)' : 'Zakat al-Mal'} Payment`,
        order_id: orderData.orderId,
        prefill: {
          name: zakatForm.donorName || user?.name || '',
          contact: zakatForm.phone || user?.phone || '',
          email: user?.email || '',
        },
        theme: { color: '#059669' },
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyRazorpay(orderData.payment._id, response);
            qc.invalidateQueries({ queryKey: ['ramadan-schedule'] });
            setShowZakatModal(false);
            navigate(`/app/payments/${orderData.payment._id}/invoice`);
          } catch (err: any) {
            alert('Payment verification failed: ' + (err.message || 'Signature mismatch'));
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Ramadan ${s?.year || 2026} (${s?.hijriYear || '1447 AH'})`}
        subtitle="Live community Iftar sponsorship, daily prayer timetable, and Razorpay Zakat & Fitrah desk"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Ramadan' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
              icon={<Heart size={16} />}
              onClick={() => setShowIftarModal(true)}
            >
              Sponsor Iftar (Razorpay)
            </Button>
            <Button
              variant="outline"
              icon={<CreditCard size={16} />}
              onClick={() => setShowZakatModal(true)}
            >
              Pay Zakat / Fitrah
            </Button>
          </div>
        }
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 text-[220px] font-bold leading-none text-white opacity-10">☽</div>
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles size={14} className="text-amber-300" />
              <span>Blessed Month of Fasting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">Ramadan {s?.hijriYear || '1447 AH'}</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-lg leading-relaxed">
              Support our community Iftar meals, sponsor daily Kanji for hundreds of fasting brothers and sisters, and fulfill your Zakat al-Fitr before Eid prayer.
            </p>
          </div>
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3.5 border border-white/15 text-center sm:text-right">
              <p className="text-2xl sm:text-3xl font-black text-amber-300">₹{(stats.totalIftarRaised || 0).toLocaleString()}</p>
              <p className="text-emerald-200 text-xs font-medium">Iftar Fund Raised</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Iftar Programs"
          value={String(iftarPrograms.length || 30)}
          icon={<Heart size={20} />}
          subtitle={`${stats.iftarSponsorsCount || 0} online sponsors`}
        />
        <StatCard
          label="Iftar Fund Collected"
          value={`₹${(stats.totalIftarRaised || 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          subtitle="Live from Razorpay"
        />
        <StatCard
          label="Fitrah Rate"
          value={`₹${fitrahRate}`}
          icon={<Star size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle="Per head for 2026"
        />
        <StatCard
          label="Taraweeh Khatam"
          value="20 Rakaats"
          icon={<Moon size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          subtitle="Nightly 8:15 PM"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timetable */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card padding="md">
            <CardHeader>
              <div>
                <CardTitle>Ramadan Timetable (Kozhikode Standard Time)</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Calculated based on Sunni lunar sighting and local longitude</p>
              </div>
              <Badge variant="emerald">Live Timetable</Badge>
            </CardHeader>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-3.5 py-2.5 text-left">Date</th>
                    <th className="px-3.5 py-2.5 text-left">Suhoor Ends</th>
                    <th className="px-3.5 py-2.5 text-left">Fajr Azaan</th>
                    <th className="px-3.5 py-2.5 text-left">Iftar / Maghrib</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                  {timetable.map((row: any, i: number) => (
                    <tr key={i} className={`${i === 0 ? 'bg-emerald-50/60 font-semibold' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                      <td className="px-3.5 py-3 font-medium text-gray-900">
                        {new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {i === 0 && <Badge variant="emerald" size="sm" className="ml-2">Today</Badge>}
                      </td>
                      <td className="px-3.5 py-3 text-gray-600 font-mono">{row.suhoorEnd}</td>
                      <td className="px-3.5 py-3 text-gray-600 font-mono">{row.fajr}</td>
                      <td className="px-3.5 py-3 font-bold text-emerald-700 font-mono text-sm">{row.iftar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Iftar Programs with Live DB Integration */}
          <Card padding="md">
            <CardHeader>
              <div>
                <CardTitle>Iftar Meal Sponsorship & Programs</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Community Iftar meals served daily at the Central Mahall Hall</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Heart size={14} className="text-rose-500" />}
                onClick={() => setShowIftarModal(true)}
              >
                Sponsor a Day
              </Button>
            </CardHeader>
            <div className="flex flex-col gap-3 mt-3">
              {iftarPrograms.map((prog: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50 rounded-xl gap-2 hover:bg-gray-100/70 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{prog.date}</p>
                      <Badge variant={prog.status === 'BOOKED' ? 'emerald' : 'amber'} size="sm">
                        {prog.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">Sponsor: {prog.sponsor}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Menu: {prog.menu || 'Dates, Traditional Malabar Kanji & Beverages'}</p>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <p className="text-xs sm:text-sm font-black text-gray-800">{prog.count}+ Attendees</p>
                    <span className="text-[11px] text-gray-400">{prog.venue || 'Mahall Hall'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Quick Pay Box */}
          <Card padding="md" className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white shadow-xs">
            <CardTitle className="text-emerald-950 flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <span>Zakat & Fitrah 1447 AH</span>
            </CardTitle>
            <div className="flex flex-col gap-3 mt-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Zakat al-Fitr (Fitrah Rate)</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-3xl font-black text-amber-900">₹{fitrahRate}</p>
                  <span className="text-xs text-amber-700 font-medium">per family member</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Obligatory upon every Muslim before Eid prayer</p>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Zakat al-Mal (Wealth)</p>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  2.5% of qualifying liquid savings, gold, silver, and commercial business assets. Nisab rate applies.
                </p>
              </div>

              <Button
                fullWidth
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                icon={<CreditCard size={16} />}
                onClick={() => setShowZakatModal(true)}
              >
                Pay Fitrah / Zakat (Razorpay)
              </Button>
            </div>
          </Card>

          {/* Programs Sidebar */}
          <Card padding="md">
            <CardTitle>Ramadan Special Halaqas</CardTitle>
            <div className="flex flex-col gap-2 mt-4">
              {ramadanPrograms.map((prog, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      prog.type === 'prayer'
                        ? 'bg-emerald-50 text-emerald-600'
                        : prog.type === 'education'
                        ? 'bg-blue-50 text-blue-600'
                        : prog.type === 'finance'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}
                  >
                    {prog.type === 'prayer' ? (
                      <Moon size={14} />
                    ) : prog.type === 'education' ? (
                      <Book size={14} />
                    ) : prog.type === 'finance' ? (
                      <DollarSign size={14} />
                    ) : (
                      <Heart size={14} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{prog.title}</p>
                    <p className="text-xs text-gray-400">{prog.time}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">{prog.imam}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Sponsor Iftar Modal */}
      <Modal isOpen={showIftarModal} onClose={() => setShowIftarModal(false)} title="Sponsor Community Iftar Fund (Razorpay)">
        <form onSubmit={handleIftarSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <Heart size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              &quot;Whoever feeds a fasting person will have a reward like that of the fasting person.&quot; (Tirmidhi). Contributions directly fund daily Kanji, dates, fresh fruits, and dinner for 350+ attendees daily.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preset Contribution</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['500', '1000', '2500', '5000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setIftarForm(p => ({ ...p, amount: amt }))}
                  className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    iftarForm.amount === amt
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400 shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Custom Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={iftarForm.amount}
              onChange={e => setIftarForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="Enter amount..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Donor Name / Family</label>
              <input
                type="text"
                value={iftarForm.donorName}
                onChange={e => setIftarForm(p => ({ ...p, donorName: e.target.value }))}
                placeholder="e.g. Al-Noor Family"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={iftarForm.phone}
                onChange={e => setIftarForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dedication / Niyyah (Optional)</label>
            <input
              type="text"
              value={iftarForm.notes}
              onChange={e => setIftarForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. In memory of parents / Family wellness"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setShowIftarModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={isPaying || !iftarForm.amount || Number(iftarForm.amount) <= 0}
            >
              {isPaying ? <Loader2 size={16} className="animate-spin mr-2" /> : <CreditCard size={16} className="mr-2" />}
              Pay ₹{Number(iftarForm.amount || 0).toLocaleString()} via Razorpay
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pay Zakat / Fitrah Modal */}
      <Modal isOpen={showZakatModal} onClose={() => setShowZakatModal(false)} title="Pay Zakat / Fitrah Online (Razorpay)">
        <form onSubmit={handleZakatSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contribution Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setZakatForm(p => ({ ...p, type: 'FITRAH', notes: 'Zakat al-Fitr (Fitrah)' }))}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  zakatForm.type === 'FITRAH'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Zakat al-Fitr (Fitrah)
              </button>
              <button
                type="button"
                onClick={() => setZakatForm(p => ({ ...p, type: 'ZAKAT', notes: 'Zakat al-Mal (Wealth)' }))}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  zakatForm.type === 'ZAKAT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Zakat al-Mal (Wealth)
              </button>
            </div>
          </div>

          {zakatForm.type === 'FITRAH' ? (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900">Number of Family Members</p>
                  <p className="text-[11px] text-amber-700">₹{fitrahRate} per person</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZakatForm(p => ({ ...p, personsCount: Math.max(1, p.personsCount - 1) }))}
                    className="w-8 h-8 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-amber-950 font-mono w-6 text-center">{zakatForm.personsCount}</span>
                  <button
                    type="button"
                    onClick={() => setZakatForm(p => ({ ...p, personsCount: p.personsCount + 1 }))}
                    className="w-8 h-8 rounded-lg bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800">Total Fitrah Dues:</span>
                <span className="text-lg font-black text-amber-950">₹{calculatedFitrahAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Zakat Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={zakatForm.customAmount}
                onChange={e => setZakatForm(p => ({ ...p, customAmount: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Donor Name</label>
              <input
                type="text"
                value={zakatForm.donorName}
                onChange={e => setZakatForm(p => ({ ...p, donorName: e.target.value }))}
                placeholder="Name of donor"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={zakatForm.phone}
                onChange={e => setZakatForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setShowZakatModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={isPaying || (zakatForm.type === 'FITRAH' ? calculatedFitrahAmount <= 0 : !zakatForm.customAmount || Number(zakatForm.customAmount) <= 0)}
            >
              {isPaying ? <Loader2 size={16} className="animate-spin mr-2" /> : <CreditCard size={16} className="mr-2" />}
              Pay ₹{(zakatForm.type === 'FITRAH' ? calculatedFitrahAmount : Number(zakatForm.customAmount || 0)).toLocaleString()} via Razorpay
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RamadanPage;
