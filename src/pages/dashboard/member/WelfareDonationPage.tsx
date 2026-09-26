import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Download,
  FileText,
  Star,
  Sparkles,
  Users,
  Home,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { paymentsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';
import { loadRazorpayScript } from '../../../utils/loadRazorpay';

const DONATION_CAUSES = [
  {
    type: 'DONATION',
    title: 'Mahall Welfare Fund',
    desc: 'Emergency medical aid, widow assistance, and impoverished family relief within Al-Noor Mahall.',
    icon: Heart,
    color: 'from-rose-500 to-rose-600',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
  },
  {
    type: 'ZAKAT',
    title: 'Zakat Fund',
    desc: 'Obligatory 2.5% wealth purification distributed strictly to verified Mahall eligible beneficiaries.',
    icon: Star,
    color: 'from-amber-500 to-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
  },
  {
    type: 'TUITION',
    title: 'Madrasa Student Aid',
    desc: 'Sponsor education, Islamic books, and tuition fees for underprivileged students in Madrasa.',
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
  },
  {
    type: 'OTHER',
    title: 'Mosque Sadaqah & Maintenance',
    desc: 'Ongoing mosque utility upkeep, clean water facilities, and general community development.',
    icon: Home,
    color: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
];

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000, 10000];

const WelfareDonationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCause, setSelectedCause] = useState<string>('DONATION');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState<string>('500');

  const [donorName, setDonorName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>((user as any)?.phone || '');
  const [notes, setNotes] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<any | null>(null);

  // Load Member's previous payments to display donation history
  const { data: paymentsData, refetch: refetchPayments } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentsApi.getMyPayments(),
  });

  const allPayments: any[] = paymentsData?.data || [];
  const donationHistory = allPayments.filter(
    (p) => p.status === 'PAID' && ['DONATION', 'ZAKAT', 'FITRAH', 'OTHER'].includes(p.type)
  );

  const handlePresetSelect = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(String(amount));
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const num = Number(val);
    if (PRESET_AMOUNTS.includes(num)) {
      setSelectedPreset(num);
    } else {
      setSelectedPreset(null);
    }
  };

  const effectiveAmount = Number(customAmount) || 0;

  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCompletedPayment(null);

    if (effectiveAmount <= 0) {
      setErrorMessage('Please select or enter a donation amount greater than zero.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not initialize Razorpay payment checkout. Please check internet connectivity.');
      }

      // 2. Call backend to create online contribution & Razorpay order
      const res = await paymentsApi.contributeOnline({
        amount: effectiveAmount,
        type: selectedCause as any,
        donorName: donorName.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      const orderData = res.data;
      const paymentRecord = orderData.payment;

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Mahallu Welfare Committee',
        description: `${selectedCause} Donation — ₹${effectiveAmount}`,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&q=80',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setIsProcessing(true);
            // 4. Verify payment with backend
            const verifyRes = await paymentsApi.verifyRazorpay(paymentRecord._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifiedPayment = verifyRes.data;
            setCompletedPayment(verifiedPayment);

            // Invalidate queries to reflect live data everywhere
            await queryClient.invalidateQueries({ queryKey: ['my-payments'] });
            await queryClient.invalidateQueries({ queryKey: ['finance-overview'] });
            await queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
            await queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
            await refetchPayments();
          } catch (verErr: any) {
            setErrorMessage(
              verErr?.response?.data?.message ||
                verErr?.message ||
                'Payment verification failed. Please contact the Mahall treasurer.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: donorName || user?.name || '',
          email: user?.email || '',
          contact: phone || (user as any)?.phone || '',
        },
        notes: {
          paymentId: paymentRecord._id,
          type: selectedCause,
          donorName: donorName,
        },
        theme: {
          color: '#059669', // Emerald
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setErrorMessage(resp.error?.description || 'Donation payment was cancelled or failed.');
        setIsProcessing(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to initiate Razorpay checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Welfare & Zakat Donation"
        subtitle="Support community welfare, educational scholarships, and deserving families with instant digital invoice"
        breadcrumb={[{ label: 'Member' }, { label: 'Welfare Donation' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<FileText size={16} />}
              onClick={() => navigate('/app/my-payments')}
            >
              My Payments & Dues
            </Button>
          </div>
        }
      />

      {/* Completion Modal / Banner */}
      {completedPayment && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                  Donation Confirmed & Verified
                </span>
                <h3 className="text-xl font-bold mt-1">
                  JazakAllahu Khairan! Receipt #{completedPayment.receiptNumber}
                </h3>
                <p className="text-sm text-emerald-100 mt-0.5">
                  Your contribution of ₹{Number(completedPayment.amount).toLocaleString()} for{' '}
                  {completedPayment.type} has been securely received into the Mahall welfare treasury.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
              <Button
                variant="secondary"
                icon={<Download size={16} />}
                onClick={() => navigate(`/app/payments/${completedPayment._id}/invoice`)}
                className="bg-white text-emerald-800 hover:bg-emerald-50 border-0 shadow-md font-bold"
              >
                View & Download Invoice
              </Button>
              <button
                onClick={() => setCompletedPayment(null)}
                className="text-xs text-white/80 hover:text-white px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-bold text-red-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Voluntary Contribution Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3.5 text-emerald-900">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <Heart size={20} />
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold">Voluntary & Non-Compulsory Contribution</p>
          <p className="text-emerald-700 text-xs mt-0.5">
            Members can donate any amount according to their capacity. An official digitally stamped receipt and invoice
            will be issued automatically for your tax and financial records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Donation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <form onSubmit={handleInitiateDonation} className="space-y-6">
              {/* Step 1: Select Fund / Cause */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  1. Choose Welfare Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DONATION_CAUSES.map((cause) => {
                    const isSelected = selectedCause === cause.type;
                    const IconComp = cause.icon;
                    return (
                      <div
                        key={cause.type}
                        onClick={() => setSelectedCause(cause.type)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? `${cause.border} ${cause.bg} ring-2 ring-emerald-500/50 shadow-sm`
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? cause.bg : 'bg-gray-100'} ${cause.text}`}>
                            <IconComp size={16} />
                          </div>
                          <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {cause.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{cause.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  2. Choose or Enter Amount (INR ₹)
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = selectedPreset === amt;
                    return (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => handlePresetSelect(amt)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter custom amount..."
                    required
                    className="w-full pl-8 pr-4 py-3 text-lg font-bold rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Step 3: Optional Donor Info */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  3. Donor Details (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Donor Name / In the name of</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Anonymous or Member Name"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9847111050"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Special Intention / Dua Request / Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. For late mother's Maghfirah, or Medical assistance"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isProcessing}
                  disabled={isProcessing || effectiveAmount <= 0}
                  className="w-full justify-center text-base py-3.5 rounded-xl shadow-md font-bold"
                  icon={<CreditCard size={18} />}
                >
                  Pay ₹{effectiveAmount.toLocaleString()} with Razorpay Gateway
                </Button>
                <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Secured by 256-Bit Razorpay Payment Gateway & Mahallu Financial Ledger
                </p>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: History & Verification Note */}
        <div className="space-y-6">
          <Card padding="md">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-emerald-700" />
              <h4 className="text-sm font-bold text-gray-900">Your Verified Donations</h4>
            </div>

            {donationHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Heart size={28} className="mx-auto mb-2 opacity-30 text-rose-500" />
                <p className="text-xs text-gray-600 font-medium">No previous donations recorded.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Your confirmed contributions will be listed here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {donationHistory.slice(0, 5).map((d) => (
                  <div key={d._id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="emerald" size="sm">
                          {d.type}
                        </Badge>
                        <span className="text-xs font-bold text-gray-900">
                          ₹{Number(d.amount).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        {d.receiptNumber || d.paymentNumber}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Download size={12} />}
                      onClick={() => navigate(`/app/payments/${d._id}/invoice`)}
                      className="text-[11px] px-2 py-1"
                    >
                      Invoice
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Mahallu Seal & Trust */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Direct Bank Transparency</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              All welfare contributions are credited directly into Al-Noor Mahallu registered institutional accounts and
              audited regularly by the Mahall financial committee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelfareDonationPage;
