import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, AlertTriangle, Plus, ArrowLeft,
  Building2, Search, Check, AlertCircle, Calendar,
  Receipt, CheckCircle2, User, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { madrasaApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

const MadrasaFeesPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const [selectedMadrasaId, setSelectedMadrasaId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    madrasaId: '',
    studentId: '',
    month: '2026-09',
    amount: 200,
    feeType: 'MONTHLY_TUITION',
    dueDate: '2026-09-30',
    status: 'PAID',
    paymentMethod: 'CASH',
    receiptNumber: '',
    notes: '',
  });

  const canManage = ['super_admin', 'secretary', 'madrasa_admin'].includes((user?.role || '').toLowerCase());

  // Fetch Madrasas
  const { data: madrasasData } = useQuery({
    queryKey: ['madrasa-institutions'],
    queryFn: madrasaApi.listMadrasas,
  });
  const madrasas = madrasasData?.data || [];
  const activeMadrasaId = selectedMadrasaId || (madrasas[0]?._id ? String(madrasas[0]._id) : '');

  // Fetch Students for this madrasa
  const { data: studentsData } = useQuery({
    queryKey: ['madrasa-students-all', activeMadrasaId],
    queryFn: () => madrasaApi.listStudents({ madrasaId: activeMadrasaId || undefined, limit: 100 }),
    enabled: !!activeMadrasaId,
  });
  const students = studentsData?.data?.items || [];

  // Fetch Fees
  const { data: feesData, isLoading } = useQuery({
    queryKey: ['madrasa-fees', activeMadrasaId, selectedMonth],
    queryFn: () => madrasaApi.listFees({ madrasaId: activeMadrasaId || undefined, month: selectedMonth || undefined }),
    enabled: !!activeMadrasaId,
  });
  const fees = feesData?.data || [];

  const recordFeeMutation = useMutation({
    mutationFn: (data: any) => madrasaApi.recordFeePayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-fees'] });
      qc.invalidateQueries({ queryKey: ['madrasa-parent-portal'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => madrasaApi.updateFeeStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['madrasa-fees'] });
      qc.invalidateQueries({ queryKey: ['madrasa-parent-portal'] });
    },
  });

  const resetForm = () => {
    setForm({
      madrasaId: activeMadrasaId,
      studentId: students[0]?._id || '',
      month: selectedMonth || '2026-09',
      amount: 200,
      feeType: 'MONTHLY_TUITION',
      dueDate: '2026-09-30',
      status: 'PAID',
      paymentMethod: 'CASH',
      receiptNumber: `MDR-${Date.now().toString().slice(-6)}`,
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setForm((p) => ({
      ...p,
      madrasaId: activeMadrasaId,
      studentId: students[0]?._id || '',
    }));
    setShowAddModal(true);
  };

  const filteredFees = fees.filter((f: any) => {
    if (selectedStatus !== 'ALL' && f.status !== selectedStatus) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const sName = f.studentId?.name || '';
      const adm = f.studentId?.admissionNumber || '';
      const rec = f.receiptNumber || '';
      return sName.toLowerCase().includes(q) || adm.toLowerCase().includes(q) || rec.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCollected = fees.filter((f: any) => f.status === 'PAID').reduce((sum: number, f: any) => sum + f.amount, 0);
  const totalPending = fees.filter((f: any) => f.status !== 'PAID').reduce((sum: number, f: any) => sum + f.amount, 0);
  const pendingAlertCount = fees.filter((f: any) => f.status !== 'PAID').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Madrasa Monthly Student Fees & Fee Alerts"
        subtitle="Manage student monthly tuition fees, record receipts, and monitor automated fee alerts sent to parents"
        breadcrumb={[{ label: 'Madrasa', href: '/app/madrasa' }, { label: 'Fees' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft size={15} />}
              onClick={() => navigate('/app/madrasa')}
            >
              Back to Desk
            </Button>
            {canManage && (
              <Button
                size="sm"
                icon={<Plus size={15} />}
                onClick={handleOpenAdd}
              >
                Record Fee Receipt
              </Button>
            )}
          </div>
        }
      />

      {/* Madrasa Selector & Month Filter */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="font-bold text-gray-500 uppercase mr-1 shrink-0">Madrasa:</span>
          {madrasas.map((m: any) => (
            <button
              key={m._id}
              onClick={() => setSelectedMadrasaId(m._id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                activeMadrasaId === m._id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 size={13} />
              <span>{m.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-gray-500 shrink-0">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs rounded-xl border border-gray-200 p-1.5 font-bold outline-none focus:border-emerald-500 bg-white"
            >
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search student or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 pl-9 pr-3 py-1.5 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Total Collected ({selectedMonth})</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">₹{totalCollected}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Pending Dues ({selectedMonth})</p>
            <p className="text-2xl font-black text-amber-600 mt-1">₹{totalPending}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase">Parent Fee Alerts Active</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{pendingAlertCount} Alerts</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Fees Ledger Table */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">Student Fee Records</h3>
            <Badge variant="emerald" size="sm">{filteredFees.length} Records</Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                selectedStatus === 'ALL' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('PAID')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                selectedStatus === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setSelectedStatus('PENDING')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                selectedStatus === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 size={28} className="animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Loading fee ledger...</p>
          </div>
        ) : filteredFees.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No fee records found for the selected criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3 rounded-l-lg">Student & Admission</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Month</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Receipt / Mode</th>
                  <th className="py-3 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFees.map((f: any) => {
                  const isPaid = f.status === 'PAID';
                  return (
                    <tr key={f._id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3">
                        <p className="font-bold text-gray-900">{f.studentId?.name || 'Student'}</p>
                        <p className="text-[11px] text-gray-400 font-mono">Adm: {f.studentId?.admissionNumber || '—'}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700">
                        Class {f.studentId?.standard || '?'}-{f.studentId?.division || 'A'}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-gray-800">{f.month}</td>
                      <td className="py-3 px-3 font-black text-gray-900">₹{f.amount}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono">
                        {f.receiptNumber ? (
                          <span>{f.receiptNumber} ({f.paymentMethod || 'UPI'})</span>
                        ) : (
                          <span className="text-gray-400 italic">Pending Clearance</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isPaid && canManage && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            onClick={() =>
                              updateFeeMutation.mutate({
                                id: f._id,
                                data: {
                                  status: 'PAID',
                                  paymentMethod: 'CASH',
                                  receiptNumber: `MDR-CASH-${Date.now().toString().slice(-5)}`,
                                },
                              })
                            }
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Fee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Madrasa Student Fee Payment"
      >
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-semibold"
            >
              {students.map((s: any) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.admissionNumber}) — Class {s.standard}-{s.division}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Month *</label>
              <input
                value={form.month}
                onChange={(e) => setForm((p) => ({ ...p, month: e.target.value }))}
                placeholder="2026-09"
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status *</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500 font-bold"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING (Will trigger alert)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-emerald-500"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI</option>
                <option value="ONLINE">ONLINE PORTAL</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              onClick={() => recordFeeMutation.mutate(form)}
              disabled={recordFeeMutation.isPending || !form.studentId}
            >
              {recordFeeMutation.isPending ? 'Saving...' : 'Save Fee Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MadrasaFeesPage;
