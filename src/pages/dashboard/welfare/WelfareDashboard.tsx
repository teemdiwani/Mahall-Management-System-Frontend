import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, FileText, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import { ApplicationStatusBadge } from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';
import Badge from '../../../components/ui/Badge';
import { dashboardApi } from '../../../api/dashboardApi';

const WelfareDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['welfare-dashboard'],
    queryFn: dashboardApi.getWelfareDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading Welfare desk from database...</p>
        </div>
      </div>
    );
  }

  const d = data?.data;
  const cards = d?.cards || {
    pending: 0,
    underReview: 0,
    approved: 0,
    completed: 0,
    totalDisbursed: 0,
    totalZakatFund: 0,
    netZakatBalance: 0,
  };

  const cases = d?.recentCases || [];

  return (
    <div>
      <PageHeader
        title="Welfare & Zakat Officer Desk"
        subtitle="Confidential beneficiary assessments, Zakat disbursements and medical aid"
        breadcrumb={[{ label: 'Dashboard' }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="New Requests"
          value={cards.pending.toString()}
          icon={<FileText size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          subtitle="Pending initial review"
        />
        <StatCard
          label="Under Review"
          value={cards.underReview.toString()}
          icon={<AlertCircle size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          subtitle="Field inspection"
        />
        <StatCard
          label="Approved"
          value={cards.approved.toString()}
          icon={<CheckCircle size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          subtitle="Ready to disburse"
        />
        <StatCard
          label="Total Aid Disbursed"
          value={`₹${cards.totalDisbursed.toLocaleString()}`}
          icon={<Heart size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          subtitle="From Welfare Fund"
        />
        <StatCard
          label="Available Zakat Pool"
          value={`₹${cards.totalZakatFund.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          subtitle={`Net: ₹${cards.netZakatBalance.toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Active Welfare & Zakat Cases</CardTitle>
              <Badge variant="amber">{cases.length} Records</Badge>
            </CardHeader>
            <div className="flex flex-col gap-1">
              {cases.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">No active welfare cases.</p>
              ) : (
                cases.map((app: any) => (
                  <div key={app._id} className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-xl px-2">
                    <div className="flex items-start gap-3">
                      <Avatar name={app.applicant?.name || 'Applicant'} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{app.title}</p>
                        <p className="text-xs text-gray-500">
                          {app.applicant?.name} · {app.family?.familyCode} ({app.family?.area})
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={app.type === 'ZAKAT' ? 'amber' : 'blue'} size="sm">{app.type}</Badge>
                          <span className="text-[10px] text-gray-400">{app.applicationNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <ApplicationStatusBadge status={app.status.toLowerCase() as any} />
                      {app.requestedAmount && (
                        <span className="text-sm font-bold text-emerald-700">₹{app.requestedAmount.toLocaleString()}</span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Confidentiality Notice</CardTitle>
            </CardHeader>
            <p className="text-xs text-gray-500 leading-relaxed">
              In accordance with Mahall privacy policies (Rule 10), all financial assistance and beneficiary records are strictly protected. Data is accessible solely to authorized Welfare Officers and the Super Admin.
            </p>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Zakat & Fitrah Balance</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Gross Pool</span>
                <span className="font-bold text-gray-800">₹{cards.totalZakatFund.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Disbursed</span>
                <span className="font-bold text-rose-600">-₹{cards.totalDisbursed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                <span>Net Reserve</span>
                <span>₹{cards.netZakatBalance.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelfareDashboard;
