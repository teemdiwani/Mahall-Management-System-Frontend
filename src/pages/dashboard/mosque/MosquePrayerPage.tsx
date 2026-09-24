import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, Edit2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { mosqueApi } from '../../../api/domainApis';

export const MosquePrayerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: mosqueRes, isLoading } = useQuery({
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

  const jumahDetails = mosque?.jumahDetails || {
    khatib: 'Usthad Abdullah Faizy',
    topic: 'Strengthening Mahall Brotherhood & Mutual Support',
    khutbahTime: '12:30 PM',
    prayerTime: '01:00 PM',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
    jumah: '',
    khatib: '',
    topic: '',
    khutbahTime: '',
    prayerTime: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartEdit = () => {
    setFormData({
      fajr: prayerTimings.fajr || '',
      dhuhr: prayerTimings.dhuhr || '',
      asr: prayerTimings.asr || '',
      maghrib: prayerTimings.maghrib || '',
      isha: prayerTimings.isha || '',
      jumah: prayerTimings.jumah || '',
      khatib: jumahDetails.khatib || '',
      topic: jumahDetails.topic || '',
      khutbahTime: jumahDetails.khutbahTime || '',
      prayerTime: jumahDetails.prayerTime || '',
    });
    setIsEditing(true);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const mutation = useMutation({
    mutationFn: (payload: { prayerTimings: any; jumahDetails: any }) =>
      mosqueApi.updateTimings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosque-info'] });
      setIsEditing(false);
      setSuccessMsg('Prayer timings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update prayer timings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      prayerTimings: {
        fajr: formData.fajr,
        dhuhr: formData.dhuhr,
        asr: formData.asr,
        maghrib: formData.maghrib,
        isha: formData.isha,
        jumah: formData.jumah,
      },
      jumahDetails: {
        khatib: formData.khatib,
        topic: formData.topic,
        khutbahTime: formData.khutbahTime,
        prayerTime: formData.prayerTime,
      },
    });
  };

  const prayers = [
    { key: 'fajr', label: 'Fajr', time: prayerTimings.fajr, color: 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20' },
    { key: 'dhuhr', label: 'Dhuhr', time: prayerTimings.dhuhr, color: 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20' },
    { key: 'asr', label: 'Asr', time: prayerTimings.asr, color: 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20' },
    { key: 'maghrib', label: 'Maghrib', time: prayerTimings.maghrib, color: 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/20' },
    { key: 'isha', label: 'Isha', time: prayerTimings.isha, color: 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20' },
    { key: 'jumah', label: 'Jumah', time: prayerTimings.jumah, color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Prayer Schedules & Timings"
          subtitle="Configure daily prayer times and Friday Jumu'ah khutbah details"
          breadcrumb={[{ label: 'Mosque', href: '/app/mosque' }, { label: 'Prayer Timings' }]}
        />
        {!isEditing && (
          <Button onClick={handleStartEdit} className="self-start sm:self-auto flex items-center gap-2">
            <Edit2 size={16} /> Edit Timings
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* View Mode */}
      {!isEditing ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {prayers.map((prayer) => (
              <div
                key={prayer.key}
                className={`p-5 rounded-2xl border-2 transition-all hover:scale-105 shadow-sm ${prayer.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                    {prayer.label}
                  </span>
                  <Clock size={16} className="text-neutral-500" />
                </div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  {prayer.time}
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
                  Adhan / Iqamah
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-emerald-600" size={20} />
                  <CardTitle>Friday Jumu'ah Information</CardTitle>
                </div>
              </CardHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Khatib (Speaker)</p>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">{jumahDetails.khatib}</p>
                </div>
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60">
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Khutbah Topic</p>
                  <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">{jumahDetails.topic}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Khutbah Begins</p>
                    <p className="text-lg font-bold text-emerald-600">{jumahDetails.khutbahTime}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Salat Begins</p>
                    <p className="text-lg font-bold text-emerald-600">{jumahDetails.prayerTime}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mosque Leadership & Details</CardTitle>
              </CardHeader>
              <div className="space-y-3 divide-y divide-neutral-200 dark:divide-neutral-800">
                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Mosque Name</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{mosque?.name || 'Al-Noor Central Masjid'}</span>
                </div>
                <div className="pt-3 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Chief Imam</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{mosque?.imamName || 'Usthad Abdullah Faizy'}</span>
                </div>
                <div className="pt-3 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Muezzin</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{mosque?.muezzinName || 'Bilal Ahmed'}</span>
                </div>
                <div className="pt-3 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Mosque Capacity</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{mosque?.capacity || 1200} worshippers</span>
                </div>
                <div className="pt-3 flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Address</span>
                  <span className="font-semibold text-neutral-900 dark:text-white text-right">{mosque?.address || 'Mosque Road, Mahall District'}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Prayer Timings</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Fajr</label>
                <input
                  type="text"
                  required
                  value={formData.fajr}
                  onChange={(e) => setFormData({ ...formData, fajr: e.target.value })}
                  placeholder="05:15 AM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Dhuhr</label>
                <input
                  type="text"
                  required
                  value={formData.dhuhr}
                  onChange={(e) => setFormData({ ...formData, dhuhr: e.target.value })}
                  placeholder="12:35 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Asr</label>
                <input
                  type="text"
                  required
                  value={formData.asr}
                  onChange={(e) => setFormData({ ...formData, asr: e.target.value })}
                  placeholder="04:15 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Maghrib</label>
                <input
                  type="text"
                  required
                  value={formData.maghrib}
                  onChange={(e) => setFormData({ ...formData, maghrib: e.target.value })}
                  placeholder="06:35 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Isha</label>
                <input
                  type="text"
                  required
                  value={formData.isha}
                  onChange={(e) => setFormData({ ...formData, isha: e.target.value })}
                  placeholder="08:00 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Jumah</label>
                <input
                  type="text"
                  required
                  value={formData.jumah}
                  onChange={(e) => setFormData({ ...formData, jumah: e.target.value })}
                  placeholder="12:45 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jumu'ah Service Details</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Khatib (Speaker)</label>
                <input
                  type="text"
                  required
                  value={formData.khatib}
                  onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                  placeholder="Usthad Abdullah Faizy"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Khutbah Topic</label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="Mutual Support and Brotherhood"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Khutbah Time</label>
                <input
                  type="text"
                  required
                  value={formData.khutbahTime}
                  onChange={(e) => setFormData({ ...formData, khutbahTime: e.target.value })}
                  placeholder="12:30 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Prayer Time</label>
                <input
                  type="text"
                  required
                  value={formData.prayerTime}
                  onChange={(e) => setFormData({ ...formData, prayerTime: e.target.value })}
                  placeholder="01:00 PM"
                  className="w-full px-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-xl text-sm font-semibold shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-300"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Timings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MosquePrayerPage;
