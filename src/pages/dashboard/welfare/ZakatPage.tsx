import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, DollarSign, Users, Plus, Loader2, TrendingUp, CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader, StatCard } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Avatar from '../../../components/ui/Avatar';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { welfareApi, paymentsApi } from '../../../api/domainApis';
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

const ZakatPage: React.FC = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useTabs('contributions');

  const [showDistribute, setShowDistribute] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [distributeForm, setDistributeForm] = useState({ description: '', requestedAmount: '', beneficiaryName: '' });
  const [payForm, setPayForm] = useState({
    zakatType: 'ZAKAT',
    amount: '5000',
    donorName: user?.name || '',
    phone: user?.phone || '',
    notes: 'Zakat al-Mal (Wealth)',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['welfare-zakat'],
    queryFn: welfareApi.getZakat,
  });

  const distribute = useMutation({
    mutationFn: (d: any) => welfareApi.distributeZakat(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['welfare-zakat'] });
      setShowDistribute(false);
      setDistributeForm({ description: '', requestedAmount: '', beneficiaryName: '' });
    },
  });

  const handlePayZakatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.amount || Number(payForm.amount) <= 0) {
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
        amount: Number(payForm.amount),
        type: payForm.zakatType as any,
        donorName: payForm.donorName || user?.name || 'Anonymous Donor',
        phone: payForm.phone || user?.phone,
        notes: payForm.notes,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Central Mahallu',
        description: `${payForm.zakatType === 'ZAKAT' ? 'Official Zakat al-Mal' : 'Zakat al-Fitr'} Payment`,
        order_id: orderData.orderId,
        prefill: {
          name: payForm.donorName || user?.name || '',
          contact: payForm.phone || user?.phone || '',
          email: user?.email || '',
        },
        theme: { color: '#059669' },
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyRazorpay(orderData.payment._id, response);
            qc.invalidateQueries({ queryKey: ['welfare-zakat'] });
            setShowPayModal(false);
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

  const d = data?.data;
  const recentDistributions = d?.recentDistributions || [];
  const recentContributions = d?.recentContributions || [];

  return (
    <div>
      <PageHeader
        title="Zakat & Welfare Fund"
        subtitle="Live Zakat collection via Razorpay, transparent disbursement records & live fund balance"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Welfare' }, { label: 'Zakat' }]}
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              icon={<Plus size={16} />}
              onClick={() => setShowDistribute(true)}
            >
              Record Distribution
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
              icon={<CreditCard size={16} />}
              onClick={() => setShowPayModal(true)}
            >
              Pay Zakat Online (Razorpay)
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-emerald-600" size={28} /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Collected"
              value={`₹${(d?.totalCollected || 0).toLocaleString()}`}
              icon={<DollarSign size={20} />}
              iconBg="bg-emerald-50 text-emerald-600"
              subtitle={`${d?.collectedCount || 0} donations received`}
            />
            <StatCard
              label="Total Distributed"
              value={`₹${(d?.totalDistributed || 0).toLocaleString()}`}
              icon={<Users size={20} />}
              iconBg="bg-blue-50 text-blue-600"
              subtitle={`${d?.distributedCount || 0} relief grants`}
            />
            <StatCard
              label="Available Balance"
              value={`₹${(d?.balance || 0).toLocaleString()}`}
              icon={<Star size={20} />}
              iconBg="bg-amber-50 text-amber-600"
              subtitle="Ready for disbursement"
            />
            <StatCard
              label="Beneficiaries Aided"
              value={String(d?.distributedCount || 0)}
              icon={<TrendingUp size={20} />}
              iconBg="bg-purple-50 text-purple-600"
              subtitle="Verified families"
            />
          </div>

          {/* Fund Balance Visual */}
          <div className="mb-6">
            <Card padding="md">
              <CardHeader>
                <CardTitle>Zakat Fund Live Pool Status</CardTitle>
                <Badge variant="emerald">Real-time Ledger</Badge>
              </CardHeader>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Distributed: ₹{(d?.totalDistributed || 0).toLocaleString()}</span>
                  <span>Net Available Balance: ₹{(d?.balance || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: d?.totalCollected ? `${Math.min(100, (d.totalDistributed / d.totalCollected) * 100).toFixed(0)}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {d?.totalCollected ? `${((d.totalDistributed / d.totalCollected) * 100).toFixed(1)}% disbursed to deserving families` : '0% distributed'}
                </p>
              </div>
            </Card>
          </div>

          {/* Tabs for Contributions & Distributions */}
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
            tabs={[
              { key: 'contributions', label: `Live Contributions (${recentContributions.length})` },
              { key: 'distributions', label: `Disbursements & Grants (${recentDistributions.length})` },
            ]}
            className="mb-5"
          />

          {activeTab === 'contributions' && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Recent Verified Zakat & Fitrah Contributions</CardTitle>
                <Badge variant="emerald">Razorpay Verified</Badge>
              </CardHeader>
              <div className="flex flex-col gap-3 mt-3">
                {recentContributions.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-400 mb-3">No online contributions recorded yet.</p>
                    <Button size="sm" onClick={() => setShowPayModal(true)}>Be the First to Pay Zakat</Button>
                  </div>
                ) : (
                  recentContributions.map((c: any) => (
                    <div key={c._id} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/70 rounded-xl transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.familyId?.name || c.memberId?.name || 'Zakat Donor'} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {c.familyId?.name || c.memberId?.name || 'Verified Mahall Donor'}
                          </p>
                          <p className="text-xs text-gray-500">{c.notes || `${c.type} Fund Contribution`}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Receipt: <span className="font-mono text-emerald-700 font-semibold">{c.receiptNumber || 'OFFICIAL'}</span> · {new Date(c.paidAt || c.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-700">₹{c.amount?.toLocaleString()}</p>
                          <Badge variant="emerald" size="sm">PAID</Badge>
                        </div>
                        <button
                          onClick={() => navigate(`/app/payments/${c._id}/invoice`)}
                          title="View Official Mahall Invoice"
                          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-xs"
                        >
                          <ExternalLink size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {activeTab === 'distributions' && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Recent Verified Disbursements & Welfare Aid</CardTitle>
                <Badge variant="blue">Committee Approved</Badge>
              </CardHeader>
              <div className="flex flex-col gap-3 mt-3">
                {recentDistributions.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No disbursements recorded yet</p>
                ) : (
                  recentDistributions.map((item: any) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Avatar name={item.applicant?.name || 'Recipient'} size="sm" />
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
          )}
        </>
      )}

      {/* Pay Zakat Online Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Pay Zakat / Fitrah Online (Razorpay)">
        <form onSubmit={handlePayZakatSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
            <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900 leading-relaxed">
              Official Mahall Zakat Portal: Payments are instantly verified via Razorpay gateway and deposited directly into the Mahall Zakat Account. An official downloadable receipt with QR code will be generated immediately.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contribution Category</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayForm(p => ({ ...p, zakatType: 'ZAKAT', notes: 'Zakat al-Mal (Wealth)' }))}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  payForm.zakatType === 'ZAKAT'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Zakat al-Mal (Wealth)
              </button>
              <button
                type="button"
                onClick={() => setPayForm(p => ({ ...p, zakatType: 'FITRAH', notes: 'Zakat al-Fitr (Fitrah)' }))}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  payForm.zakatType === 'FITRAH'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                Zakat al-Fitr (Fitrah)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount (₹)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['1000', '2500', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPayForm(p => ({ ...p, amount: amt }))}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    payForm.amount === amt
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  ₹{Number(amt).toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              required
              min="1"
              value={payForm.amount}
              onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="Enter custom amount..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3.5 py-2.5 font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Donor Name</label>
              <input
                type="text"
                value={payForm.donorName}
                onChange={e => setPayForm(p => ({ ...p, donorName: e.target.value }))}
                placeholder="Name of donor"
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={payForm.phone}
                onChange={e => setPayForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91..."
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Intention / Notes (Niyyah)</label>
            <input
              type="text"
              value={payForm.notes}
              onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="e.g. Zakat on savings, gold, business..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={isPaying || !payForm.amount || Number(payForm.amount) <= 0}
            >
              {isPaying ? <Loader2 size={16} className="animate-spin mr-2" /> : <CreditCard size={16} className="mr-2" />}
              Pay ₹{Number(payForm.amount || 0).toLocaleString()} via Razorpay
            </Button>
          </div>
        </form>
      </Modal>

      {/* Distribution Modal */}
      <Modal isOpen={showDistribute} onClose={() => setShowDistribute(false)} title="Record Zakat Distribution">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Beneficiary Name</label>
            <input value={distributeForm.beneficiaryName} onChange={e => setDistributeForm(p => ({ ...p, beneficiaryName: e.target.value }))}
              placeholder="Name of the recipient"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Purpose / Description</label>
            <textarea value={distributeForm.description} onChange={e => setDistributeForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Reason for distribution..."
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
            <input type="number" value={distributeForm.requestedAmount} onChange={e => setDistributeForm(p => ({ ...p, requestedAmount: e.target.value }))}
              placeholder="0"
              className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 focus:outline-none focus:border-emerald-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDistribute(false)}>Cancel</Button>
            <Button className="flex-1"
              onClick={() => distribute.mutate({ type: 'ZAKAT', description: distributeForm.description, requestedAmount: Number(distributeForm.requestedAmount), applicantName: distributeForm.beneficiaryName })}
              disabled={distribute.isPending || !distributeForm.description || !distributeForm.requestedAmount}>
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
