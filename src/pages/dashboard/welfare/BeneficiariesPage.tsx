import React, { useState } from 'react';
import { Users, Search, Loader2, Heart, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import { welfareApi } from '../../../api/domainApis';

const TYPE_LABELS: Record<string, string> = {
  WELFARE: 'General Welfare', ZAKAT: 'Zakat', MEDICAL: 'Medical Aid',
  SCHOLARSHIP: 'Scholarship', FINANCIAL_AID: 'Financial Aid', EMERGENCY: 'Emergency',
};

const TYPE_COLORS: Record<string, any> = {
  WELFARE: 'emerald', ZAKAT: 'amber', MEDICAL: 'red',
  SCHOLARSHIP: 'blue', FINANCIAL_AID: 'purple', EMERGENCY: 'red',
};

const BeneficiariesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['welfare-beneficiaries', typeFilter],
    queryFn: () => welfareApi.listBeneficiaries({ type: typeFilter || undefined }),
  });

  const items = (data?.data?.items || data?.data || []) as any[];
  const filtered = items.filter((b: any) =>
    !search || b.applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDisbursed = items.reduce((sum: number, b: any) => sum + (b.requestedAmount || 0), 0);

  return (
    <div>
      <PageHeader
        title="Beneficiaries"
        subtitle="Approved welfare recipients and assistance history"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Welfare' }, { label: 'Beneficiaries' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Beneficiaries" value={String(items.length)} icon={<Users size={20} />} />
        <StatCard label="Total Disbursed" value={`₹${totalDisbursed.toLocaleString()}`} icon={<Heart size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Completed Cases" value={String(items.filter((b: any) => b.status === 'COMPLETED').length)} icon={<CheckCircle size={20} />} iconBg="bg-blue-50 text-blue-600" />
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search beneficiaries..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 outline-none" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm rounded-xl border border-gray-200 px-3 py-2 bg-gray-50 focus:outline-none focus:border-emerald-400">
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p>No beneficiaries found</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((b: any) => (
              <div key={b._id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                <Avatar name={b.applicant?.name || 'B'} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-800">{b.applicant?.name || b.description?.slice(0, 20)}</p>
                    <Badge variant={TYPE_COLORS[b.type] || 'gray'} size="sm">{TYPE_LABELS[b.type] || b.type}</Badge>
                    <Badge variant={b.status === 'COMPLETED' ? 'emerald' : 'amber'} size="sm">{b.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{b.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {b.requestedAmount && <p className="text-xs font-semibold text-emerald-700">₹{b.requestedAmount.toLocaleString()}</p>}
                    <p className="text-xs text-gray-400">{new Date(b.updatedAt || b.createdAt).toLocaleDateString()}</p>
                    {b.family && <p className="text-xs text-gray-400">Family: {b.family.familyCode}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BeneficiariesPage;
