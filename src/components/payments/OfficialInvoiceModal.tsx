import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle,
  Building,
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Hash,
  FileCheck,
} from 'lucide-react';

interface OfficialInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
}

export const OfficialInvoiceModal: React.FC<OfficialInvoiceModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const family = payment.familyId || {};
  const familyHead = family.familyHead || {};
  const member = payment.memberId || {};
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

  // Convert amount to words
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

  const amountInWords = `${numberToWords(amount)} Rupees Only`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-100 overflow-hidden relative print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Modal Top Bar - Hidden during Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileCheck size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Mahallu Official Invoice & Receipt</h3>
              <p className="text-xs text-gray-500">Official verified receipt issued by Al-Noor Mahallu Committee</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Printer size={14} />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div ref={printRef} className="p-8 sm:p-10 text-gray-800 bg-white print:p-6 print:m-0 print:text-black">
          {/* Islamic Bismillah Header */}
          <div className="text-center mb-4">
            <p className="text-base font-serif text-emerald-900 tracking-wide mb-1 font-semibold">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight uppercase">
              Al-Noor Juma Masjid & Mahallu Committee
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Registered Under State Waqf Board & Mahall Directorate Reg. No: ML-684/2012
            </p>
            <p className="text-xs text-gray-500">
              Noor Nagar, Main Road, Calicut, Kerala - 673001 · Phone: +91 495 272 0000 · Email: finance@alnoormahall.org
            </p>
          </div>

          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 mb-6"></div>

          {/* Receipt Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mb-1">
                Official Mahallu Tax & Maintenance Receipt
              </span>
              <h2 className="text-lg font-bold text-gray-900 font-mono flex items-center gap-2">
                <span>Receipt No:</span>
                <span className="text-emerald-700">{receiptNo}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Billing Cycle: <strong className="text-gray-800">{payment.month || 'Direct'}</strong> · Payment Ref: {payment.paymentNumber}
              </p>
            </div>

            <div className="text-right sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>PAID & VERIFIED</span>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center justify-end gap-1">
                <Calendar size={12} className="text-gray-400" />
                <span>Date: {paymentDate} {paymentTime && `at ${paymentTime}`}</span>
              </p>
            </div>
          </div>

          {/* Family & Payee Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-gray-50 border border-gray-100 print:bg-transparent print:border-gray-300">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building size={13} className="text-emerald-600" />
                <span>Household / Family Information</span>
              </p>
              <p className="text-sm font-bold text-gray-900">{family.name || 'Member Household'}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                Family Code: <strong className="font-mono text-emerald-800">{family.familyCode || 'N/A'}</strong>
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
                  Phone: {family.phone || familyHead?.phone}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard size={13} className="text-emerald-600" />
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

          {/* Itemized Table */}
          <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left border-collapse">
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
                    <p className="font-bold text-gray-900">
                      {payment.type === 'MONTHLY'
                        ? 'Mahall Monthly Maintenance & Welfare Contribution'
                        : `${payment.type} Contribution`}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      28th Automated Schedule · Verified via Razorpay Official Gateway
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-700">
                    {payment.month || 'Current Cycle'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
                  <td colSpan={4} className="py-3 px-4 text-right text-gray-700 uppercase tracking-wider text-xs">
                    Grand Total Paid:
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 font-mono text-base font-black">
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in words */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 mb-8 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Amount In Words:
              </span>
              <p className="text-xs font-bold text-emerald-900 italic">
                {amountInWords}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck size={16} />
              <span>Razorpay Secured & Digitally Reconciled</span>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 items-end">
            <div className="text-center">
              <div className="h-10 border-b border-dashed border-gray-400 mx-auto w-32 flex items-center justify-center">
                <span className="text-[11px] font-serif italic text-gray-400">Digital Seal</span>
              </div>
              <p className="text-[11px] font-bold text-gray-700 mt-2">Treasurer / Finance Secretary</p>
              <p className="text-[10px] text-gray-400">Al-Noor Mahall Committee</p>
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
              <p className="text-[11px] font-bold text-gray-700 mt-2">General Secretary</p>
              <p className="text-[10px] text-gray-400">Al-Noor Mahall Directorate</p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-3">
            <p>This is a computer-generated official receipt issued by Al-Noor Mahallu Management System.</p>
            <p>Jazakallahu Khair for your timely contribution towards the maintenance and welfare of our Mahallu.</p>
          </div>
        </div>

        {/* Modal Bottom Actions - Hidden during Print */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between print:hidden">
          <p className="text-xs text-gray-500">
            Receipt ID: <code className="font-mono text-emerald-700">{receiptNo}</code>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              <Printer size={15} />
              <span>Print / Download Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialInvoiceModal;
