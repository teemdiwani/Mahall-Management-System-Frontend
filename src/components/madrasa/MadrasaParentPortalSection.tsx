import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Calendar, Award, DollarSign, Clock, CheckCircle2,
  AlertTriangle, Bell, User, ChevronRight, FileText,
  Sparkles, Check, Download, AlertCircle, Phone, MapPin,
  CreditCard, Loader2
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { madrasaApi } from '../../api/domainApis';
import { loadRazorpayScript } from '../../utils/loadRazorpay';

interface Props {
  isStandalone?: boolean;
}

export const MadrasaParentPortalSection: React.FC<Props> = ({ isStandalone = false }) => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'timetable' | 'results' | 'fees' | 'attendance'>('timetable');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null);
  const [feeError, setFeeError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['madrasa-parent-portal'],
    queryFn: madrasaApi.getParentPortal,
  });

  const handlePayFeeWithRazorpay = async (fee: any) => {
    setFeeError(null);
    setProcessingFeeId(fee._id);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Could not load Razorpay payment gateway. Please check your connection.');
      }

      const orderRes = await madrasaApi.createRazorpayOrder(fee._id);
      const orderData = orderRes.data;

      const currentStudent = students[selectedStudentIndex] || students[0];
      const studentObj = currentStudent?.student;

      const options = {
        key: orderData.keyId,
        amount: orderData.amountInPaise,
        currency: orderData.currency || 'INR',
        name: 'Al-Noor Madrasa Directorate',
        description: `Madrasa Tuition Fee - ${orderData.studentName} (${fee.month})`,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&q=80',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setProcessingFeeId(fee._id);
            const verifyRes = await madrasaApi.verifyRazorpay(fee._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await qc.invalidateQueries({ queryKey: ['madrasa-parent-portal'] });
            await qc.invalidateQueries({ queryKey: ['member-dashboard'] });
            await qc.invalidateQueries({ queryKey: ['my-payments'] });

            const targetInvoiceId = verifyRes.data?.payment?._id || fee._id;
            navigate(`/app/payments/${targetInvoiceId}/invoice`);
          } catch (verifyErr: any) {
            setFeeError(
              verifyErr?.response?.data?.message ||
                verifyErr?.message ||
                'Payment verification failed. Please contact the Madrasa desk.'
            );
          } finally {
            setProcessingFeeId(null);
          }
        },
        prefill: {
          name: studentObj?.guardianName || studentObj?.name || 'Parent',
          contact: studentObj?.guardianPhone || '',
        },
        notes: {
          feeId: fee._id,
          month: fee.month,
          studentName: orderData.studentName,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: () => {
            setProcessingFeeId(null);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on('payment.failed', (resp: any) => {
        setFeeError(resp.error?.description || 'Payment was unsuccessful or cancelled.');
        setProcessingFeeId(null);
      });

      razorpayInstance.open();
    } catch (err: any) {
      setFeeError(err?.response?.data?.message || err?.message || 'Could not initiate Razorpay checkout.');
      setProcessingFeeId(null);
    }
  };

  if (isLoading) {
    return (
      <Card padding="md" className="border-emerald-100 bg-white">
        <div className="flex items-center gap-3 py-6 justify-center text-gray-500">
          <BookOpen className="animate-spin text-emerald-600" size={24} />
          <p className="text-sm font-medium">Loading Madrasa Parent Portal...</p>
        </div>
      </Card>
    );
  }

  const portalData = data?.data;
  const hasChildren = portalData?.hasChildrenInMadrasa;
  const students = portalData?.students || [];
  const announcements = portalData?.announcements || [];
  const stats = portalData?.stats;

  // If user does not have any children in madrasa, render nothing (or quiet info if standalone)
  if (!hasChildren || students.length === 0) {
    if (!isStandalone) {
      return null;
    }
    return (
      <Card padding="lg" className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">No Enrolled Madrasa Students Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
          Your member profile does not have any active students currently enrolled in the Mahallu Madrasas.
          If your children study in our madrasa, please contact the Madrasa Secretary or submit an enrollment application.
        </p>
      </Card>
    );
  }

  const currentStudentData = students[selectedStudentIndex] || students[0];
  const { student, timetable, examResults = [], fees = [], feeAlert, attendance } = currentStudentData;
  const madrasaInfo = student.madrasaId;

  // Filter timetable for selected day
  const scheduleForDay = (timetable?.schedule || []).filter((s: any) => s.day === selectedDay);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-5">
      {/* ─── Premium Parent Portal Header Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 p-6 md:p-7 text-white shadow-xl">
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl" />
        <div className="absolute left-1/3 bottom-0 translate-y-10 w-48 h-48 rounded-full bg-teal-400/10 pointer-events-none blur-xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles size={14} className="text-amber-300" />
                Mahallu Madrasa Parent Desk · രക്ഷിതാക്കളുടെ പോർട്ടൽ
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {madrasaInfo?.name || 'Mahallu Central Madrasa'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100/80">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-400" /> {madrasaInfo?.location || 'Central Ward'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" /> {madrasaInfo?.phone || '+91 9847111221'}
                </span>
                <span>•</span>
                <span className="text-emerald-300 font-medium">
                  Sadar Usthad: {madrasaInfo?.sadarUsthad || 'Faizy'}
                </span>
              </div>
            </div>

            {/* Overall Parent KPI Pills */}
            <div className="flex items-center gap-2.5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[85px]">
                <p className="text-[10px] text-emerald-200 font-semibold uppercase">My Children</p>
                <p className="text-xl font-black text-white">{students.length}</p>
              </div>
              <div className={`backdrop-blur-md rounded-2xl p-3 border text-center min-w-[95px] ${
                stats?.hasPendingFeeAlert
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                  : 'bg-white/10 border-white/10 text-white'
              }`}>
                <p className="text-[10px] font-semibold uppercase">Fees Due</p>
                <p className="text-xl font-black">₹{stats?.totalFeesDue || 0}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center min-w-[85px]">
                <p className="text-[10px] text-emerald-200 font-semibold uppercase">Avg Attendance</p>
                <p className="text-xl font-black text-emerald-300">{stats?.avgAttendance || 96}%</p>
              </div>
            </div>
          </div>

          {/* Children Selector Tabs (When multiple children are studying) */}
          <div className="mt-6 pt-5 border-t border-white/15">
            <p className="text-[11px] font-semibold text-emerald-200 mb-2 uppercase tracking-wider">
              Select Child to View Details ({students.length} Enrolled):
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {students.map((item: any, idx: number) => {
                const s = item.student;
                const isSelected = selectedStudentIndex === idx;
                const hasDue = item.feeAlert?.hasPending;
                return (
                  <button
                    key={s._id}
                    onClick={() => setSelectedStudentIndex(idx)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isSelected
                        ? 'bg-white text-emerald-950 shadow-md ring-2 ring-white font-bold scale-[1.02]'
                        : 'bg-white/15 text-white hover:bg-white/25 border border-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isSelected ? 'bg-emerald-700 text-white' : 'bg-white/20 text-white'
                    }`}>
                      {s.gender === 'FEMALE' ? '👧' : '👦'}
                    </div>
                    <span>{s.name}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                      isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-black/20 text-white'
                    }`}>
                      Class {s.standard || '?'}-{s.division || 'A'}
                    </span>
                    {hasDue && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Fee due" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Active Fee Alert Notice (If Fee is Pending for Selected Child) ──── */}
      {feeAlert?.hasPending && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={22} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide bg-amber-100 px-2 py-0.5 rounded-md">
                  Madrasa Fee Notice
                </span>
                <span className="text-xs text-amber-700 font-semibold">
                  For {student.name} (Adm: {student.admissionNumber})
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 mt-1">
                Monthly Tuition Fee of <span className="text-amber-800 text-base font-black">₹{feeAlert.totalPending}</span> is pending for {feeAlert.pendingMonths.join(', ')}.
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Kindly clear the fee to ensure continuous academic evaluation and uninterrupted hall tickets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            {fees.find((f: any) => f.status === 'PENDING') && (
              <button
                disabled={processingFeeId === fees.find((f: any) => f.status === 'PENDING')?._id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                onClick={() => handlePayFeeWithRazorpay(fees.find((f: any) => f.status === 'PENDING'))}
              >
                {processingFeeId === fees.find((f: any) => f.status === 'PENDING')?._id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Opening Razorpay...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>Pay ₹{feeAlert.totalPending} with Razorpay</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fee Action Error Banner */}
      {feeError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{feeError}</span>
          </div>
          <button onClick={() => setFeeError(null)} className="font-bold text-red-800 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Current Student Profile Summary Card ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200 text-emerald-800 flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-inner">
              {student.gender === 'FEMALE' ? '🧕' : '👳'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900">{student.name}</h3>
                <Badge variant={student.status === 'ACTIVE' ? 'emerald' : 'gray'} size="sm">
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                Adm No: <strong>{student.admissionNumber}</strong> · Roll: <strong>{student.rollNumber || '—'}</strong> · Standard: <strong>{student.standard || 'Class'} (Div {student.division || 'A'})</strong>
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Institution: {madrasaInfo?.name || 'Central Madrasa'} ({madrasaInfo?.code})
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-center">
            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Exam Rank</p>
              <p className="text-sm font-black text-gray-800">
                {examResults[0]?.rank ? `#${examResults[0].rank}` : 'Top Tier'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Attendance</p>
              <p className="text-sm font-black text-emerald-600">
                {attendance?.attendanceRate || 96}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Fee Status</p>
              <p className={`text-sm font-black ${feeAlert?.hasPending ? 'text-amber-600' : 'text-emerald-600'}`}>
                {feeAlert?.hasPending ? 'Pending' : 'Cleared'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 Interactive Sub-Tabs for the Selected Child ───────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'timetable'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <Calendar size={14} className={activeTab === 'timetable' ? 'text-emerald-600' : 'text-gray-400'} />
          Class Timetable
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <Award size={14} className={activeTab === 'results' ? 'text-emerald-600' : 'text-gray-400'} />
          Exam Results & Progress ({examResults.length})
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'fees'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <DollarSign size={14} className={activeTab === 'fees' ? 'text-emerald-600' : 'text-gray-400'} />
          Monthly Fees
          {feeAlert?.hasPending && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <CheckCircle2 size={14} className={activeTab === 'attendance' ? 'text-emerald-600' : 'text-gray-400'} />
          Attendance Log
        </button>
      </div>

      {/* ─── Tab Content 1: Class Timetable ─────────────────────────────────── */}
      {activeTab === 'timetable' && (
        <Card padding="md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                {timetable?.title || `Class ${student.standard}-${student.division} Weekly Schedule`}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Uploaded by {timetable?.uploadedBy || 'Madrasa Secretary'} · Academic Year 2026-2027
              </p>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedDay === day
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Periods List */}
          {scheduleForDay.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-xl">
              <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-700">No scheduled periods for {selectedDay}</p>
              <p className="text-xs text-gray-400 mt-1">Friday is weekly holiday. Regular classes run Mon–Thu & Sat–Sun.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scheduleForDay.map((p: any) => (
                <div
                  key={`${p.day}-${p.periodNumber}`}
                  className="p-4 rounded-xl border border-gray-200/90 bg-gradient-to-b from-white to-gray-50 hover:border-emerald-400 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[10px] uppercase">
                      Period {p.periodNumber}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 font-mono">
                      <Clock size={12} className="text-gray-400" />
                      {p.timeSlot}
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-gray-900 mt-2">{p.subject}</h5>
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    Usthad: {p.usthadName}
                  </p>
                </div>
              ))}
            </div>
          )}

          {timetable?.notes && (
            <div className="mt-4 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-start gap-2">
              <Sparkles size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Notice from Secretary:</strong> {timetable.notes}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ─── Tab Content 2: Exam Results & Progress ──────────────────────────── */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {examResults.length === 0 ? (
            <Card padding="lg" className="text-center py-10">
              <Award size={36} className="mx-auto text-gray-400 mb-2" />
              <h4 className="text-sm font-bold text-gray-800">No Exam Results Published Yet</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Term exam marks are entered by the Madrasa Manager and published after board verification.
              </p>
            </Card>
          ) : (
            examResults.map((r: any) => (
              <Card key={r._id} padding="md" className="border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-gray-900">{r.examName}</h4>
                      <Badge variant="emerald" size="sm">
                        {r.overallGrade}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Exam Date: {new Date(r.examDate).toLocaleDateString()} · Entered by {r.enteredBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Total Score</p>
                      <p className="text-lg font-black text-gray-900">
                        {r.totalMarksObtained} <span className="text-xs font-normal text-gray-400">/ {r.totalMaxMarks}</span>
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col items-center justify-center text-emerald-800">
                      <span className="text-xs font-bold">Percentage</span>
                      <span className="text-sm font-black">{r.percentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Marks Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3 rounded-l-lg">Subject Name</th>
                        <th className="py-2.5 px-3 text-center">Max Marks</th>
                        <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                        <th className="py-2.5 px-3 text-center rounded-r-lg">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(r.subjects || []).map((sub: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="py-2.5 px-3 font-semibold text-gray-800">{sub.subject}</td>
                          <td className="py-2.5 px-3 text-center text-gray-500 font-mono">{sub.maxMarks}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-gray-900 font-mono">{sub.marksObtained}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-50 text-emerald-700">
                              {sub.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Teacher / Usthad Remarks */}
                {r.remarks && (
                  <div className="mt-4 p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
                    <Award size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Usthad's Assessment & Remarks:</strong> "{r.remarks}"
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* ─── Tab Content 3: Monthly Fees ────────────────────────────────────── */}
      {activeTab === 'fees' && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-600" />
                Monthly Madrasa Fees for {student.name}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Standard monthly tuition fee: ₹200. Clear via UPI or cash at madrasa office.
              </p>
            </div>
            {feeAlert?.hasPending && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                ₹{feeAlert.totalPending} Pending
              </span>
            )}
          </div>

          {fees.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No fee records found for this student.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {fees.map((fee: any) => {
                const isPaid = fee.status === 'PAID';
                return (
                  <div key={fee._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {isPaid ? <Check size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {fee.month} Tuition Fee
                        </p>
                        <p className="text-xs text-gray-400">
                          Due: {new Date(fee.dueDate).toLocaleDateString()} {fee.receiptNumber ? `· Receipt: ${fee.receiptNumber}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-extrabold text-gray-900 font-mono">₹{fee.amount}</span>
                      {isPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
                            PAID
                          </span>
                          <button
                            onClick={() => navigate(`/app/payments/${fee.paymentId || fee._id}/invoice`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-sm"
                          >
                            <Download size={13} className="text-emerald-700" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={processingFeeId === fee._id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                          onClick={() => handlePayFeeWithRazorpay(fee)}
                        >
                          {processingFeeId === fee._id ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Opening Razorpay...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={14} />
                              <span>Pay with Razorpay</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ─── Tab Content 4: Attendance Log ──────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Attendance Statistics & Recent Record
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Official attendance marked daily by the class Usthad
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-semibold uppercase">Rate: </span>
              <span className="text-base font-black text-emerald-700">{attendance?.attendanceRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Sessions</p>
              <p className="text-lg font-black text-gray-800">{attendance?.totalSessions || 30}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center">
              <p className="text-[10px] text-emerald-700 font-bold uppercase">Present Days</p>
              <p className="text-lg font-black text-emerald-800">{attendance?.presentSessions || 29}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-center">
              <p className="text-[10px] text-amber-700 font-bold uppercase">Leaves/Absent</p>
              <p className="text-lg font-black text-amber-800">
                {(attendance?.totalSessions || 30) - (attendance?.presentSessions || 29)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-center">
              <p className="text-[10px] text-blue-700 font-bold uppercase">Status</p>
              <p className="text-xs font-extrabold text-blue-800 mt-1">Excellent</p>
            </div>
          </div>

          <p className="text-xs font-bold text-gray-700 mb-2">Recent Session Log:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {(attendance?.recent || []).map((att: any, i: number) => {
              const isPresent = att.status === 'PRESENT';
              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg border text-center text-xs ${
                    isPresent
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="text-[10px] text-gray-400 font-mono">
                    {new Date(att.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="font-bold text-[11px] mt-0.5">
                    {att.status}
                  </p>
                  {att.remarks && (
                    <p className="text-[9px] text-gray-500 truncate" title={att.remarks}>{att.remarks}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ─── Official Madrasa Announcements for Parents/Students ────────────── */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Bell size={16} />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Official Madrasa Announcements
              </h4>
              <p className="text-xs text-gray-400">
                Direct notices and circulars for parents & students from Madrasa Management
              </p>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            {announcements.length} Live Notices
          </Badge>
        </div>

        {announcements.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No current announcements for this madrasa.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {announcements.map((a: any) => (
              <div
                key={a._id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-emerald-50/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white border border-gray-200 text-emerald-800">
                      {a.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">{a.title}</h5>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">{a.content}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200/60 text-[10px] text-gray-400 flex items-center justify-between">
                  <span>By: {a.publishedBy}</span>
                  <span className="text-emerald-600 font-semibold">{a.classTarget}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      </div>
  );
};

export default MadrasaParentPortalSection;
