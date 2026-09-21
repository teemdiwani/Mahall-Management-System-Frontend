import React, { useState } from 'react';
import { Star, DollarSign, Users, Plus, Loader2, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import { welfareApi } from '../../../api/domainApis';

const ZakatPage: React.FC = () => {
  const qc = useQueryClient();
  const [showDistribute, setShowDistribute] = useState(false);
  const [form, setForm] = useState({ description: '', requestedAmount: '', beneficiaryName: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['welfare-zakat'],
    queryFn: welfareApi.getZakat,
  });

  const distribute = useMutation({
    mutationFn: (d: any) => welfareApi.distributeZakat(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['welfare-zakat'] });
      setShowDistribute(false);
      setForm({ description: '', requestedAmount: '', beneficiaryName: '' });
    },
  });

  const d = data?.data;

  return (
    <div>
      <PageHeader
        title="Zakat Fund"
        subtitle="Zakat collection, distribution records and fund balance"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Welfare' }, { label: 'Zakat' }]}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowDistribute(true)}>Record Distribution</Button>}
      />

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Collected" value={`₹${(d?.totalCollected || 0).toLocaleString()}`} icon={<DollarSign size={20} />} iconBg="bg-emerald-50 text-emerald-600" />
            <StatCard label="Total Distributed" value={`₹${(d?.totalDistributed || 0).toLocaleString()}`} icon={<Users size={20} />} iconBg="bg-blue-50 text-blue-600" />
            <StatCard label="Available Balance" value={`₹${(d?.balance || 0).toLocaleString()}`} icon={<Star size={20} />} iconBg="bg-amber-50 text-amber-600" />
            <StatCard label="Beneficiaries" value={String(d?.distributedCount || 0)} icon={<TrendingUp size={20} />} iconBg="bg-purple-50 text-purple-600" />
          </div>

          {/* Fund Balance Visual */}
          <div className="mb-6">
            <Card padding="md">
              <CardHeader>
                <CardTitle>Zakat Fund Status</CardTitle>
                <Badge variant="emerald">Live Balance</Badge>
              </CardHeader>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Distributed: ₹{(d?.totalDistributed || 0).toLocaleString()}</span>
                  <span>Balance: ₹{(d?.balance || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all"
                    style={{ width: d?.totalCollected ? `${Math.min(100, (d.totalDistributed / d.totalCollected) * 100).toFixed(0)}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {d?.totalCollected ? `${((d.totalDistributed / d.totalCollected) * 100).toFixed(1)}% distributed` : '0% distributed'}
                </p>
              </div>
            </Card>
          </div>

          {/* Recent Distributions */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Recent Distributions</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3 mt-2">
              {(d?.recentDistributions || []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No distributions recorded yet</p>
              ) : (
                (d?.recentDistributions || []).map((item: any) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Avatar name={item.applicant?.name || 'Z'} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{item.applicant?.name || item.description}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <p className="text-xs text-gray-400">{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</p>
                    </div>
                    {item.requestedAmount && (
                      <p className="text-sm font-bold text-emerald-700">₹{item.requestedAmount.toLocaleString()}</p>
                    )}
                    <Badge variant="emerald" size="sm">{item.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Distribution Modal */}
      <Modal isOpen={showDistribute} onClose={() => setShowDistribute(false)} title="Record Zakat Distribution">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Beneficiary Name</label>
            <input value={form.beneficiaryName} onChange={e => setForm(p => ({ ...p, beneficiaryName: e.target.value }))}
              placeholder="Name of the recipient"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Purpose / Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Reason for distribution..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
            <input type="number" value={form.requestedAmount} onChange={e => setForm(p => ({ ...p, requestedAmount: e.target.value }))}
              placeholder="0"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDistribute(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => distribute.mutate({ type: 'ZAKAT', description: form.description, requestedAmount: Number(form.requestedAmount), applicantName: form.beneficiaryName })}
              disabled={distribute.isPending || !form.description || !form.requestedAmount}>
              {distribute.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
              Record Distribution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ZakatPage;
