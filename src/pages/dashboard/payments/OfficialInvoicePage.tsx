import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  Building,
  CreditCard,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { paymentsApi } from '../../../api/domainApis';

export const OfficialInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-invoice', id],
    queryFn: () => paymentsApi.getInvoice(id!),
    enabled: Boolean(id),
  });

  const payment = data?.data;

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/app/my-payments');
  };

  // Convert amount to words helper
  const numberToWords = (num: number): string => {
    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return 'Zero';
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
    if (num < 1000)
      return (
        a[Math.floor(num / 100)] +
        ' Hundred' +
        (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '')
      );
    if (num < 100000)
      return (
        numberToWords(Math.floor(num / 1000)) +
        ' Thousand' +
        (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '')
      );
    return `${num}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Generating official Mahallu invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <AlertCircle size={44} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Invoice Record Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            The requested payment invoice could not be retrieved from the Mahall registry.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Payments</span>
          </button>
        </div>
      </div>
    );
  }

  const family = payment.familyId || {};
  const familyHead = family.familyHead || {};
  const receiptNo = payment.receiptNumber || `RCP-${payment._id?.slice(-8)?.toUpperCase()}`;
  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const paymentTime = payment.paidAt
    ? new Date(payment.paidAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const amount = Number(payment.amount) || 0;
  const amountInWords = `${numberToWords(amount)} Rupees Only`;

  return (
    <div className="min-h-screen bg-gray-100/70 print:bg-white text-gray-800">
      {/* Explicit Print Styling: guarantees navigation bars & buttons NEVER print */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, .print\\:hidden, #invoice-action-bar, #invoice-back-button, #invoice-print-button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-paper {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Non-Printable Top Navigation & Action Header */}
      <header
        id="invoice-action-bar"
        className="no-print print:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-8 py-3.5 shadow-sm"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Back Button - Excluded from Print */}
          <button
            id="invoice-back-button"
            onClick={handleBack}
            className="no-print inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200/80 px-3.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Payments</span>
          </button>

          {/* Title & Print Action */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 font-mono">
              <FileCheck size={14} className="text-emerald-600" />
              <span>{receiptNo}</span>
            </span>

            <button
              id="invoice-print-button"
              onClick={handlePrint}
              className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all"
            >
              <Printer size={16} />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Printable Invoice Body */}
      <main className="py-4 sm:py-8 md:py-10 px-2.5 sm:px-4 print:p-0 print:m-0">
        <div
          ref={printRef}
          className="invoice-paper max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4 sm:p-8 md:p-12 print:p-4 print:shadow-none print:border-none print:max-w-none print:w-full"
        >
          {/* Official Islamic Bismillah Header */}
          <div className="text-center mb-4">
            <p className="text-base sm:text-lg font-serif text-emerald-900 tracking-wide mb-1.5 font-bold">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight uppercase">
              Al-Noor Juma Masjid & Central Mahallu Committee
            </h1>
            <p className="text-xs text-gray-600 font-medium mt-0.5">
              Registered Under State Waqf Board & Central Mahall Directorate · Reg. No: ML-684/2012
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Noor Nagar, Main Road, Calicut, Kerala - 673001 · Phone: +91 495 272 0000 · Email: finance@alnoormahall.org
            </p>
          </div>

          {/* Aesthetic Color Divider */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-800 rounded-full mb-6"></div>

          {/* Receipt Title and Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mb-1.5">
                {payment.type === 'ZAKAT'
                  ? 'Official Zakat al-Mal Receipt'
                  : payment.type === 'FITRAH'
                  ? 'Official Zakat al-Fitr (Fitrah) Receipt'
                  : payment.type === 'IFTAR'
                  ? 'Ramadan Community Iftar Fund Receipt'
                  : payment.type === 'TUITION'
                  ? 'Official Madrasa Education Fee Receipt'
                  : payment.type === 'DONATION'
                  ? 'Official Mahall Charity & Donation Receipt'
                  : 'Official Mahallu Tax & Maintenance Receipt'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-mono flex items-center gap-2">
                <span>Receipt No:</span>
                <span className="text-emerald-700 font-black">{receiptNo}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Billing Cycle: <strong className="text-gray-800">{payment.month || 'Direct'}</strong> · Payment Ref: {payment.paymentNumber}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                <CheckCircle size={15} className="text-emerald-700" />
                <span>PAID & VERIFIED</span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center sm:justify-end gap-1">
                <Calendar size={13} className="text-gray-400" />
                <span>Issued on: {paymentDate} {paymentTime && `at ${paymentTime}`}</span>
              </p>
            </div>
          </div>

          {/* Family & Payee Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-5 rounded-xl bg-gray-50/80 border border-gray-200/70 print:bg-transparent print:border-gray-300">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building size={14} className="text-emerald-700" />
                <span>Household / Family Information</span>
              </p>
              <p className="text-base font-bold text-gray-900">{family.name || 'Member Household'}</p>
              <p className="text-xs text-gray-600 mt-1">
                Family Code: <strong className="font-mono text-emerald-800 font-bold">{family.familyCode || 'N/A'}</strong>
              </p>
              {familyHead?.name && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Head of Household: <strong className="text-gray-800">{familyHead.name}</strong>
                </p>
              )}
              <p className="text-xs text-gray-600 mt-0.5">
                Address: {family.address || 'Mahall Residential Ward'}
              </p>
              {(family.phone || familyHead?.phone) && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Registered Contact: {family.phone || familyHead?.phone}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-700" />
                <span>Transaction & Gateway Information</span>
              </p>
              <p className="text-xs text-gray-600">
                Payment Channel: <strong className="text-gray-900 font-semibold">{payment.paymentMethod || 'Razorpay Online Gateway'}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1 font-mono">
                Transaction ID:{' '}
                <span className="text-gray-900 font-semibold break-all">
                  {payment.transactionId || payment.razorpayPaymentId || 'ONLINE_TXN'}
                </span>
              </p>
              {payment.razorpayOrderId && (
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  Gateway Order ID: {payment.razorpayOrderId}
                </p>
              )}
              <p className="text-xs text-gray-600 mt-1">
                Contribution Type: <strong className="capitalize text-emerald-800">{payment.type} Contribution</strong>
              </p>
            </div>
          </div>

          {/* Itemized Dues Table */}
          <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Cycle / Month</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                <tr>
                  <td className="py-3.5 px-4 font-mono text-gray-500">01</td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-gray-900 text-sm">
                      {payment.type === 'MONTHLY'
                        ? 'Mahall Monthly Maintenance & Welfare Contribution'
                        : payment.type === 'TUITION'
                        ? `Madrasa Monthly Tuition Fee${payment.studentId?.name ? ` — ${payment.studentId.name} (${payment.studentId.standard || 'Class'} ${payment.studentId.division || ''})` : ''}`
                        : payment.type === 'ZAKAT'
                        ? 'Official Zakat al-Mal (Islamic Wealth Tax & Welfare Relief)'
                        : payment.type === 'FITRAH'
                        ? 'Zakat al-Fitr (Fitrah) Contribution for Eid-ul-Fitr'
                        : payment.type === 'IFTAR'
                        ? 'Ramadan Community Iftar Sponsorship & Daily Meals Fund'
                        : payment.type === 'DONATION'
                        ? 'Official Community & Mosque Development Donation'
                        : `${payment.type} Payment`}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {payment.type === 'TUITION'
                        ? 'Madrasa Academic Education & Tuition Dues · Verified via Razorpay Official Gateway'
                        : payment.type === 'ZAKAT' || payment.type === 'FITRAH'
                        ? 'Al-Noor Central Welfare & Zakat Trust · Verified via Razorpay Official Gateway'
                        : payment.type === 'IFTAR'
                        ? 'Ramadan Fasting & Community Meals Program · Verified via Razorpay Official Gateway'
                        : '28th Automated Schedule · Verified via Razorpay Official Gateway'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">
                    {payment.month || 'Current Cycle'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      PAID
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-gray-900 font-mono text-sm">
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                  <td colSpan={4} className="py-3.5 px-4 text-right text-gray-700 uppercase tracking-wider text-xs">
                    Grand Total Paid:
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-800 font-mono text-lg font-black">
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words & Verification Note */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 mb-8 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Amount In Words:
              </span>
              <p className="text-xs font-bold text-emerald-950 italic">
                {amountInWords}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck size={16} />
              <span>Razorpay Secured & Digitally Reconciled</span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-200 items-center sm:items-end">
            <div className="text-center">
              <div className="h-10 border-b border-dashed border-gray-400 mx-auto w-32 flex items-center justify-center">
                <span className="text-[11px] font-serif italic text-gray-400">Digital Seal</span>
              </div>
              <p className="text-[11px] font-bold text-gray-800 mt-2">Treasurer / Finance Secretary</p>
              <p className="text-[10px] text-gray-500">Al-Noor Mahall Committee</p>
            </div>

            {/* Official Green Round Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center p-1 text-center bg-emerald-50/50">
                <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-tighter">AL-NOOR MAHALL</span>
                <span className="text-[10px] font-black text-emerald-700">★ PAID ★</span>
                <span className="text-[7px] text-emerald-600 font-mono">SEAL 2026</span>
              </div>
              <span className="text-[9px] text-gray-400 mt-1">Official Committee Stamp</span>
            </div>

            <div className="text-center">
              <div className="h-10 border-b border-dashed border-gray-400 mx-auto w-32 flex items-center justify-center">
                <span className="text-[11px] font-serif italic text-gray-400">Authorized</span>
              </div>
              <p className="text-[11px] font-bold text-gray-800 mt-2">General Secretary</p>
              <p className="text-[10px] text-gray-500">Al-Noor Mahall Directorate</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-3">
            <p>This is a computer-generated official receipt issued by Al-Noor Mahallu Management System.</p>
            <p>Jazakallahu Khair for your timely contribution towards the maintenance and welfare of our Mahallu.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfficialInvoicePage;
