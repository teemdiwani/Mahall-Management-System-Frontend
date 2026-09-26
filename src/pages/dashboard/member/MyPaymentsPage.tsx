import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Home,
  RefreshCw,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Heart,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge, { PaymentStatusBadge } from '../../../components/ui/Badge';
import { paymentsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';
import { loadRazorpayScript } from '../../../utils/loadRazorpay';

export const MyPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [isRefreshingDues, setIsRefreshingDues] = useState(false);

  // Fetch Member's family payments
  const { data: paymentsData, isLoading, refetch } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentsApi.getMyPayments(),
  });

  const payments: any[] = paymentsData?.data || [];

  // Identify family from payments or user context
  const firstPaymentFamily = payments.find((p) => p.familyId)?.familyId;
  const familyName = firstPaymentFamily?.name || 'My Family Household';
  const familyCode = firstPaymentFamily?.familyCode || '';
  const monthlyContribution = firstPaymentFamily?.monthlyContribution || 250;

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'PENDING') return p.status === 'PENDING';
    if (activeTab === 'PAID') return p.status === 'PAID';
    return true;
  });

  // Calculate statistics
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const paidPayments = payments.filter((p) => p.status === 'PAID');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPaidAmount = paidPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Handle Razorpay Payment flow
  const handlePayWithRazorpay = async (payment: any) => {
    setPaymentError(null);
    setPaymentSuccess(null);
    setProcessingPaymentId(payment._id);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay payment gateway. Please check your internet connection.');
      }

      // 2. Request order creation from backend
      const orderRes = await paymentsApi.createRazorpayOrder(payment._id);
      const orderData = orderRes.data;

      // 3. Setup Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Mahallu Committee',
        description: `Contribution for ${payment.month || payment.type} (Ref: ${payment.paymentNumber})`,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&q=80',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setProcessingPaymentId(payment._id);
            // 4. Verify payment on server
            const verifyRes = await paymentsApi.verifyRazorpay(payment._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const verifiedPayment = verifyRes.data;

            setPaymentSuccess(
              `Alhamdulillah! Payment of ₹${payment.amount} successful. Receipt #${verifiedPayment.receiptNumber || 'issued'}.`
            );

            // Refetch queries
            await queryClient.invalidateQueries({ queryKey: ['my-payments'] });
            await queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
            await refetch();

            // Automatically redirect to official invoice page
            navigate(`/app/payments/${payment._id}/invoice`);
          } catch (verifyErr: any) {
            setPaymentError(
              verifyErr?.response?.data?.message ||
                verifyErr?.message ||
                'Payment verification failed. Please contact the Mahallu treasurer.'
            );
          } finally {
            setProcessingPaymentId(null);
          }
        },
        prefill: {
          name: user?.name || firstPaymentFamily?.name || 'Mahall Member',
          email: user?.email || '',
          contact: (user as any)?.phone || firstPaymentFamily?.phone || '',
        },
        notes: {
          paymentId: payment._id,
          familyCode: familyCode,
          month: payment.month || '',
        },
        theme: {
          color: '#059669', // Emerald 600
        },
        modal: {
          ondismiss: () => {
            setProcessingPaymentId(null);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp: any) {
        setPaymentError(
          resp.error?.description || 'Payment was unsuccessful or cancelled. Please try again.'
        );
        setProcessingPaymentId(null);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setPaymentError(
        err?.response?.data?.message || err?.message || 'Could not initiate Razorpay checkout.'
      );
      setProcessingPaymentId(null);
    }
  };

  const handleOpenInvoice = (payment: any) => {
    navigate(`/app/payments/${payment._id}/invoice`);
  };

  const handleTrigger28thCheck = async () => {
    setIsRefreshingDues(true);
    try {
      await paymentsApi.trigger28thDues();
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ['member-dashboard'] });
    } catch (e) {
      // ignore
    } finally {
      setIsRefreshingDues(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Family Payments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your household monthly contributions, online dues, and download official Mahallu receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/app/welfare-donation')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold shadow-xs transition-colors"
          >
            <Heart size={14} className="text-emerald-600 fill-emerald-600" />
            <span>Welfare & Zakat Donation</span>
          </button>
          <button
            onClick={handleTrigger28thCheck}
            disabled={isRefreshingDues}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
          >
            <RefreshCw size={13} className={isRefreshingDues ? 'animate-spin text-emerald-600' : ''} />
            <span>Check 28th Dues</span>
          </button>
        </div>
      </div>

      {/* Payment Alerts */}
      {paymentSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{paymentSuccess}</p>
          </div>
          <button
            onClick={() => setPaymentSuccess(null)}
            className="text-xs text-emerald-700 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {paymentError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{paymentError}</p>
          </div>
          <button
            onClick={() => setPaymentError(null)}
            className="text-xs text-red-700 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Household Overview & Dues Schedule Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Household Info */}
        <Card padding="md" className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center gap-2.5 text-emerald-700 mb-2">
            <Home size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Household Registered</span>
          </div>
          <p className="text-base font-bold text-gray-900">{familyName}</p>
          <div className="flex items-center gap-2 mt-1">
            {familyCode && (
              <span className="font-mono text-xs bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                {familyCode}
              </span>
            )}
            <span className="text-xs text-gray-500">
              Contribution: <strong>₹{monthlyContribution}/mo</strong>
            </span>
          </div>
        </Card>

        {/* 28th Automated Schedule Policy */}
        <Card padding="md" className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex items-center gap-2.5 text-blue-700 mb-2">
            <Calendar size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Billing Policy</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">Automated 28th Cycle</p>
          <p className="text-xs text-gray-500 mt-1">
            Every month on the <strong>28th</strong>, monthly dues are automatically assigned based on your family's verified contribution rate.
          </p>
        </Card>

        {/* Dues Status Summary */}
        <Card
          padding="md"
          className={
            pendingPayments.length > 0
              ? 'border-amber-200 bg-gradient-to-br from-amber-50/60 to-white'
              : 'border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-white'
          }
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Dues</span>
            {pendingPayments.length > 0 ? (
              <Badge variant="amber" size="sm">
                Action Required
              </Badge>
            ) : (
              <Badge variant="emerald" size="sm">
                Up to Date
              </Badge>
            )}
          </div>
          <p className="text-xl font-black text-gray-900">
            {pendingPayments.length > 0 ? `₹${totalPendingAmount}` : '₹0.00'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {pendingPayments.length > 0
              ? `${pendingPayments.length} pending bill(s) awaiting payment`
              : 'All scheduled contributions are cleared'}
          </p>
        </Card>
      </div>

      {/* Payments Table Card */}
      <Card padding="none" className="overflow-hidden border-gray-100 shadow-sm">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/60 flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 rounded-xl overflow-x-auto max-w-full scrollbar-none">
            {(['ALL', 'PENDING', 'PAID'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'ALL' && `All Bills (${payments.length})`}
                {tab === 'PENDING' && `Pending (${pendingPayments.length})`}
                {tab === 'PAID' && `Paid (${paidPayments.length})`}
              </button>
            ))}
          </div>

          <p className="text-[11px] sm:text-xs text-gray-400">
            Official receipts are verified with digital QR & seal
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Fetching payment records from Mahall registry...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30 text-emerald-600" />
            <p className="text-base font-semibold text-gray-700">No payment records found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'PENDING'
                ? 'Great! You have no pending dues for your family household.'
                : 'No recorded payments match the selected criteria.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPayments.map((payment) => {
              const isPending = payment.status === 'PENDING';
              const isPaid = payment.status === 'PAID';
              const isProcessing = processingPaymentId === payment._id;

              return (
                <div
                  key={payment._id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                >
                  {/* Left Column: Payment Details */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-2xl flex-shrink-0 ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isPaid ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900">
                          {payment.type === 'MONTHLY'
                            ? `Monthly Contribution (${payment.month || 'Current Cycle'})`
                            : payment.type === 'TUITION'
                            ? `Madrasa Tuition Fee${payment.studentId?.name ? ` — ${payment.studentId.name}` : ''}`
                            : `${payment.type} Payment`}
                        </h4>
                        <PaymentStatusBadge status={payment.status.toLowerCase() as any} />
                        {payment.type === 'TUITION' && (
                          <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">
                            Madrasa Fee
                          </span>
                        )}
                        {payment.month && (
                          <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                            {payment.month}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                        <span>Ref: <strong className="font-mono text-gray-700">{payment.paymentNumber}</strong></span>
                        <span>·</span>
                        {isPaid && payment.receiptNumber && (
                          <>
                            <span className="text-emerald-700 font-semibold font-mono">
                              Receipt: {payment.receiptNumber}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        <span>
                          {isPaid && payment.paidAt
                            ? `Paid on ${new Date(payment.paidAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}`
                            : `Issued on ${new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Amount & Action Button */}
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 flex-wrap sm:flex-nowrap">
                    <div className="text-left md:text-right">
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                      <p className="text-base sm:text-lg font-black text-gray-900 font-mono">
                        ₹{Number(payment.amount).toFixed(2)}
                      </p>
                    </div>

                    {/* Action Button: Pay with Razorpay if PENDING, View Invoice if PAID */}
                    <div className="flex-shrink-0">
                      {isPending ? (
                        <button
                          onClick={() => handlePayWithRazorpay(payment)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Opening...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={14} />
                              <span>Pay with Razorpay</span>
                            </>
                          )}
                        </button>
                      ) : isPaid ? (
                        <button
                          onClick={() => handleOpenInvoice(payment)}
                          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
                        >
                          <Download size={14} className="text-emerald-700" />
                          <span>Official Invoice</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">No actions</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyPaymentsPage;
