import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Home, Calendar, BookOpen, Heart, DollarSign,
  TrendingUp, FileText, Star, Moon, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { StatCard, PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { dashboardApi } from '../../../api/dashboardApi';

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#14b8a6', '#8b5cf6', '#f97316'];

const SuperAdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: dashboardApi.getAdminDashboard,
  });

  const cards = data?.data?.cards || {
    totalMembers: 0,
    totalFamilies: 0,
    monthlyCollection: 0,
    expectedMonthly: 0,
    pendingPayments: 0,
    welfareCases: 0,
    madrasaStudents: 0,
    upcomingEvents: 0,
    pendingApplications: 0,
    recentDeaths: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netBalance: 0,
  };

  const charts = data?.data?.charts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm">Loading Mahall administration metrics from MongoDB...</p>
        </div>
      </div>
    );
  }

  const genderData = charts?.genderDist || [];
  const familiesAreaData = charts?.familiesByArea || [];
  const monthlyTrendsData = charts?.monthlyTrends || [];
  const expensesCategoryData = charts?.expensesByCategory || [];
  const recentActivities = data?.data?.recentActivities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahall Administration"
        subtitle="Al-Noor Mahall — Centralized Digital Administration | Live MongoDB Database"
        breadcrumb={[{ label: 'Dashboard' }]}
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Live Database Connected</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Members"
          value={cards.totalMembers.toLocaleString()}
          icon={<Users size={20} />}
          change="Live Census"
          changeType="up"
        />
        <StatCard
          label="Registered Families"
          value={cards.totalFamilies.toLocaleString()}
          icon={<Home size={20} />}
          iconBg="bg-blue-50 text-blue-600"
          change="All Active"
          changeType="up"
        />
        <StatCard
          label="Monthly Collection"
          value={`₹${cards.monthlyCollection.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          iconBg="bg-teal-50 text-teal-600"
          subtitle={`Expected: ₹${cards.expectedMonthly.toLocaleString()}`}
          changeType="up"
        />
        <StatCard
          label="Pending Dues"
          value={`₹${cards.pendingPayments.toLocaleString()}`}
          icon={<TrendingUp size={20} />}
          iconBg="bg-amber-50 text-amber-600"
          change="Current Month"
          changeType="down"
        />
        <StatCard
          label="Welfare Queue"
          value={cards.welfareCases.toString()}
          icon={<Heart size={20} />}
          iconBg="bg-rose-50 text-rose-600"
          subtitle="Needs review"
        />
        <StatCard
          label="Madrasa Students"
          value={cards.madrasaStudents.toString()}
          icon={<BookOpen size={20} />}
          iconBg="bg-purple-50 text-purple-600"
          change="Active Enrollments"
          changeType="up"
        />
        <StatCard
          label="Upcoming Events"
          value={cards.upcomingEvents.toString()}
          icon={<Calendar size={20} />}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Pending Applications"
          value={cards.pendingApplications.toString()}
          icon={<FileText size={20} />}
          iconBg="bg-orange-50 text-orange-600"
          subtitle="In review"
        />
        <StatCard
          label="Net Treasury"
          value={`₹${cards.netBalance.toLocaleString()}`}
          icon={<Star size={20} />}
          iconBg="bg-emerald-50 text-emerald-600"
          subtitle={`Total Rev: ₹${cards.totalRevenue.toLocaleString()}`}
        />
        <StatCard
          label="Cemetery Records"
          value={cards.recentDeaths.toString()}
          icon={<Moon size={20} />}
          iconBg="bg-gray-50 text-gray-500"
          subtitle="All Time"
        />
      </div>

      {/* Charts Row 1: Revenue vs Expenses Trend & Member Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Collections vs Expenses Area Chart */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <div>
              <CardTitle>Collections & Expenses Trend</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Month-by-month financial ledger aggregation</p>
            </div>
            <Badge variant="emerald">Live Multi-Month Aggregation</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={monthlyTrendsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip formatter={(v, name) => [`₹${Number(v).toLocaleString()}`, name === 'collections' ? 'Collections' : 'Expenses']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="collections"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colGrad)"
                name="Collections"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expGrad)"
                name="Expenses"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Gender Demographics Pie */}
        <Card padding="md">
          <CardHeader>
            <div>
              <CardTitle>Member Demographics</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Live census distribution by gender</p>
            </div>
            <Badge variant="blue">Demographics</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="count"
                nameKey="gender"
              >
                {genderData.map((_entry: any, idx: number) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} Members`, name]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2: Families by Area & Expenses by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Families by Area */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <div>
              <CardTitle>Families Distribution by Area</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Active registered households across Mahall wards</p>
            </div>
            <Badge variant="emerald">Ward Breakdown</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={familiesAreaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} Families`, 'Registered']} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Families" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Expenses by Category */}
        <Card padding="md">
          <CardHeader>
            <div>
              <CardTitle>Expenses by Category</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Distribution of Mahall funds</p>
            </div>
            <Badge variant="gray">Ledger</Badge>
          </CardHeader>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={expensesCategoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="amount"
                nameKey="category"
              >
                {expensesCategoryData.map((_entry: any, idx: number) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Amount']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 3: Live Recent Activities Stream & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activities from MongoDB */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader>
            <div>
              <CardTitle>Recent Mahall Activities</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Live updates from database collections</p>
            </div>
            <Badge variant="emerald">Live Stream</Badge>
          </CardHeader>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No recent activities recorded.</p>
            ) : (
              recentActivities.slice(0, 6).map((act: any) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      act.type === 'PAYMENT' ? 'bg-emerald-50 text-emerald-700' :
                      act.type === 'MEMBER' ? 'bg-blue-50 text-blue-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {act.type === 'PAYMENT' ? '₹' : act.type === 'MEMBER' ? '👤' : '📋'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{act.title}</p>
                      <p className="text-xs text-gray-500">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Administrative Links */}
        <Card padding="md">
          <CardHeader>
            <CardTitle>Administrative Directory</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/app/members"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-100 text-sm font-medium text-gray-700"
            >
              <span>Members Census</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {cards.totalMembers} Members
              </span>
            </Link>
            <Link
              to="/app/families"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-100 text-sm font-medium text-gray-700"
            >
              <span>Registered Families</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                {cards.totalFamilies} Families
              </span>
            </Link>
            <Link
              to="/app/finance"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-100 text-sm font-medium text-gray-700"
            >
              <span>Treasury & Dues</span>
              <span className="text-xs bg-gray-200 text-gray-800 font-semibold px-2 py-0.5 rounded-full">
                ₹{cards.monthlyCollection.toLocaleString()} Paid
              </span>
            </Link>
            <Link
              to="/app/applications"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-100 text-sm font-medium text-gray-700"
            >
              <span>Applications Queue</span>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                {cards.pendingApplications} Pending
              </span>
            </Link>
            <Link
              to="/app/users"
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-gray-100 text-sm font-medium text-gray-700"
            >
              <span>User Governance</span>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                RBAC
              </span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
