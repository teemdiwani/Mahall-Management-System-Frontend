import React from 'react';
import { Moon, DollarSign, Heart, Star, Book } from 'lucide-react';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const ramadanTimetable = [
  { date: '2027-02-18', suhoorEnd: '5:10 AM', fajr: '5:15 AM', iftar: '6:28 PM' },
  { date: '2027-02-19', suhoorEnd: '5:09 AM', fajr: '5:14 AM', iftar: '6:29 PM' },
  { date: '2027-02-20', suhoorEnd: '5:08 AM', fajr: '5:13 AM', iftar: '6:29 PM' },
  { date: '2027-02-21', suhoorEnd: '5:07 AM', fajr: '5:12 AM', iftar: '6:30 PM' },
  { date: '2027-02-22', suhoorEnd: '5:06 AM', fajr: '5:11 AM', iftar: '6:30 PM' },
  { date: '2027-02-23', suhoorEnd: '5:05 AM', fajr: '5:10 AM', iftar: '6:31 PM' },
  { date: '2027-02-24', suhoorEnd: '5:04 AM', fajr: '5:09 AM', iftar: '6:31 PM' },
];

const iftarPrograms = [
  { date: 'Daily', sponsor: 'Mahall Community Fund', venue: 'Mahall Hall', count: 200, status: 'planned' },
  { date: '10th Ramadan', sponsor: 'Ibrahim & Sons', venue: 'Mosque', count: 350, status: 'planned' },
  { date: '20th Ramadan', sponsor: 'Al-Baraka Group', venue: 'Mahall Hall', count: 400, status: 'planned' },
  { date: '27th Ramadan (Lailatul Qadr)', sponsor: 'Community', venue: 'Mosque Grounds', count: 600, status: 'planned' },
];

const ramadanPrograms = [
  { title: 'Daily Taraweeh', time: '8:30 PM', imam: 'Moulavi Ibrahim', type: 'prayer' },
  { title: 'Fajr Tafsir Circle', time: 'After Fajr', imam: 'Moulavi Ibrahim', type: 'education' },
  { title: "Women's Quran Halaqa", time: '10:00 AM', imam: 'Ustaza Hana', type: 'education' },
  { title: 'Iftar Program', time: '6:25 PM', imam: 'Daily', type: 'food' },
  { title: 'Suhoor Gathering', time: '4:30 AM', imam: 'Community', type: 'food' },
  { title: 'Zakat & Fitrah Collection', time: 'Last 10 days', imam: 'Treasurer', type: 'finance' },
];

const RamadanPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Ramadan 2027"
        subtitle="Programs, timetable, Iftar and community Ramadan services"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Ramadan' }]}
      />

      {/* Countdown Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 text-[200px] font-bold leading-none text-white opacity-5">☽</div>
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm mb-1">Next Ramadan</p>
            <h2 className="text-3xl font-bold">Ramadan 1448 AH</h2>
            <p className="text-emerald-100 mt-1">Expected to begin February 18, 2027</p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-4xl font-bold">~150</p>
              <p className="text-emerald-200 text-sm">days away</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Iftar Programs" value="30" icon={<Heart size={20} />} subtitle="Daily + special" />
        <StatCard label="Zakat Target" value="₹3L" icon={<DollarSign size={20} />} iconBg="bg-amber-50 text-amber-600" />
        <StatCard label="Fitrah Rate" value="₹100" icon={<Star size={20} />} iconBg="bg-purple-50 text-purple-600" subtitle="Per person" />
        <StatCard label="Taraweeh" value="Nightly" icon={<Moon size={20} />} iconBg="bg-teal-50 text-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timetable */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Ramadan Timetable (First Week)</CardTitle>
              <Badge variant="emerald">Kozhikode</Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date', 'Suhoor Ends', 'Fajr', 'Iftar / Maghrib'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ramadanTimetable.map((row, i) => (
                    <tr key={row.date} className={`${i === 0 ? 'bg-emerald-50' : 'bg-white'} hover:bg-gray-50`}>
                      <td className="px-3 py-2.5 font-medium text-gray-800">
                        {new Date(row.date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                        {i === 0 && <Badge variant="emerald" size="sm" className="ml-2">1st</Badge>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{row.suhoorEnd}</td>
                      <td className="px-3 py-2.5 text-gray-600">{row.fajr}</td>
                      <td className="px-3 py-2.5 font-semibold text-emerald-700">{row.iftar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Iftar Programs */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Iftar Programs</CardTitle>
              <Button variant="secondary" size="sm">Sponsor Iftar</Button>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {iftarPrograms.map((prog, i) => (
                <div key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{prog.date}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{prog.venue}</p>
                    {prog.sponsor !== 'Mahall Community Fund' && (
                      <p className="text-xs text-emerald-600 mt-0.5">Sponsor: {prog.sponsor}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{prog.count}+ people</p>
                    <Badge variant="blue" size="sm">{prog.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Programs Sidebar */}
        <div className="flex flex-col gap-5">
          <Card padding="md">
            <CardTitle>Ramadan Programs</CardTitle>
            <div className="flex flex-col gap-2 mt-4">
              {ramadanPrograms.map((prog, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                    ${prog.type === 'prayer' ? 'bg-emerald-50 text-emerald-600' :
                      prog.type === 'education' ? 'bg-blue-50 text-blue-600' :
                      prog.type === 'finance' ? 'bg-amber-50 text-amber-600' :
                      'bg-orange-50 text-orange-600'}`}>
                    {prog.type === 'prayer' ? <Moon size={14} /> :
                     prog.type === 'education' ? <Book size={14} /> :
                     prog.type === 'finance' ? <DollarSign size={14} /> :
                     <Heart size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{prog.title}</p>
                    <p className="text-xs text-gray-400">{prog.time}</p>
                    {prog.imam !== 'Daily' && prog.imam !== 'Community' && prog.imam !== 'Treasurer' && (
                      <p className="text-xs text-emerald-600">{prog.imam}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Zakat & Fitrah */}
          <Card padding="md">
            <CardTitle>Zakat & Fitrah 2027</CardTitle>
            <div className="flex flex-col gap-3 mt-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-700">Zakat al-Fitr (Fitrah)</p>
                <p className="text-2xl font-bold text-amber-800 my-1">₹100</p>
                <p className="text-xs text-amber-600">Per person · Due before Eid prayer</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700">Zakat al-Mal</p>
                <p className="text-sm text-emerald-800 mt-1">2.5% of qualifying assets. Nisab threshold applies.</p>
                <button className="text-xs text-emerald-700 font-semibold underline mt-1">Calculate Zakat</button>
              </div>
              <Button fullWidth>Pay Zakat / Fitrah</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RamadanPage;
