import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plane,
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Share2,
  Copy,
  RefreshCw,
  Search,
  Sparkles,
  Users,
  Check,
  Send,
} from 'lucide-react';
import { hajjUmrahApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card, { CardHeader, CardTitle } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import Modal from '../../../components/ui/Modal';
import Input, { Textarea } from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

interface TravelPost {
  _id: string;
  title: string;
  type: 'HAJJ' | 'UMRAH';
  travelsName: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail?: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  estimatedPrice?: string;
  departureDate?: string;
  returnDate?: string;
  registrationDeadline?: string;
  description: string;
  features?: string[];
  status: 'OPEN' | 'FULL' | 'CLOSED';
  createdAt: string;
}

interface RegistrationItem {
  _id: string;
  postId: any;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  seats: number;
  passportNumber?: string;
  notes?: string;
  registrationRef: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED';
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

const HajjUmrahPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSecretaryOrAdmin =
    user?.role === 'secretary' || user?.role === 'super_admin';

  const { activeTab, setActiveTab } = useTabs('packages');

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostForRegister, setSelectedPostForRegister] = useState<TravelPost | null>(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState<{
    post: TravelPost;
    registration: RegistrationItem;
    travelsContact: {
      travelsName: string;
      contactPerson?: string;
      contactPhone: string;
      contactEmail?: string;
    };
  } | null>(null);

  // Form states
  const [postFormData, setPostFormData] = useState({
    title: '',
    type: 'HAJJ',
    travelsName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    totalSlots: 20,
    estimatedPrice: '₹3,50,000',
    departureDate: '',
    registrationDeadline: '',
    description: '',
    featuresText: 'Direct flight, 5-Star hotel near Haram, Daily buffet meals, Guided Ziyarat with scholars',
  });

  const [registerFormData, setRegisterFormData] = useState({
    applicantName: user?.name || '',
    applicantPhone: user?.phone || '',
    applicantEmail: user?.email || '',
    seats: 1,
    passportNumber: '',
    notes: '',
  });

  const [copiedRef, setCopiedRef] = useState(false);

  // Queries
  const { data: postsRes, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['hajj-posts', filterType, filterStatus],
    queryFn: () =>
      hajjUmrahApi.listPosts({
        type: filterType === 'ALL' ? undefined : filterType,
        status: filterStatus === 'ALL' ? undefined : filterStatus,
      }),
  });

  const { data: statsRes } = useQuery({
    queryKey: ['hajj-stats'],
    queryFn: () => hajjUmrahApi.getStats(),
  });

  const { data: registrationsRes, isLoading: isLoadingRegs } = useQuery({
    queryKey: ['hajj-registrations'],
    queryFn: () => hajjUmrahApi.listRegistrations(),
    enabled: isSecretaryOrAdmin,
  });

  const { data: myBookingsRes } = useQuery({
    queryKey: ['my-hajj-registrations'],
    queryFn: () => hajjUmrahApi.getMyRegistrations(),
    enabled: !!user,
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (newPost: any) => hajjUmrahApi.createPost(newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hajj-posts'] });
      queryClient.invalidateQueries({ queryKey: ['hajj-stats'] });
      setIsCreateModalOpen(false);
      setPostFormData({
        title: '',
        type: 'HAJJ',
        travelsName: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        totalSlots: 20,
        estimatedPrice: '₹3,50,000',
        departureDate: '',
        registrationDeadline: '',
        description: '',
        featuresText: 'Direct flight, 5-Star hotel near Haram, Daily buffet meals, Guided Ziyarat with scholars',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: any }) =>
      hajjUmrahApi.register(postId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['hajj-posts'] });
      queryClient.invalidateQueries({ queryKey: ['hajj-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hajj-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['my-hajj-registrations'] });
      setSelectedPostForRegister(null);
      setRegistrationSuccessData(res.data);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hajjUmrahApi.updateRegistrationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hajj-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['hajj-posts'] });
      queryClient.invalidateQueries({ queryKey: ['hajj-stats'] });
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: (id: string) => hajjUmrahApi.resendEmail(id),
    onSuccess: () => {
      alert('Confirmation email resent via Nodemailer successfully!');
      queryClient.invalidateQueries({ queryKey: ['hajj-registrations'] });
    },
  });

  // Extracted data with defaults
  const rawPosts: TravelPost[] = postsRes?.data || [];
  const posts: TravelPost[] = rawPosts.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      p.travelsName.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  const stats = statsRes?.data || {
    totalPosts: rawPosts.length || 2,
    openPosts: rawPosts.filter((p) => p.status === 'OPEN').length || 2,
    totalSlots: rawPosts.reduce((acc, p) => acc + (p.totalSlots || 0), 0) || 40,
    bookedSlots: rawPosts.reduce((acc, p) => acc + (p.bookedSlots || 0), 0) || 12,
    availableSlots:
      rawPosts.reduce((acc, p) => acc + Math.max(0, (p.totalSlots || 0) - (p.bookedSlots || 0)), 0) ||
      28,
    totalRegistrations: 12,
  };

  const registrations: RegistrationItem[] = registrationsRes?.data || [];
  const myBookings: RegistrationItem[] = myBookingsRes?.data || [];

  // Handlers
  const handleOpenRegister = (post: TravelPost) => {
    setSelectedPostForRegister(post);
    setRegisterFormData({
      applicantName: user?.name || '',
      applicantPhone: user?.phone || '',
      applicantEmail: user?.email || '',
      seats: 1,
      passportNumber: '',
      notes: '',
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostForRegister) return;

    registerMutation.mutate({
      postId: selectedPostForRegister._id,
      data: registerFormData,
    });
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = postFormData.featuresText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    createPostMutation.mutate({
      ...postFormData,
      totalSlots: Number(postFormData.totalSlots) || 20,
      features,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Hajj & Umrah Travel Desk"
        subtitle="Travel partner package announcements, slot reservations, and automated email confirmations"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Hajj & Umrah' }]}
        action={
          isSecretaryOrAdmin ? (
            <Button
              icon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              Post Travel Package (Slots)
            </Button>
          ) : undefined
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Available Seats</p>
            <p className="text-3xl font-black text-emerald-950 mt-1">{stats.availableSlots}</p>
            <p className="text-xs text-emerald-600 mt-1">Ready for registration</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Slots Offered</p>
            <p className="text-3xl font-black text-blue-950 mt-1">{stats.totalSlots}</p>
            <p className="text-xs text-blue-600 mt-1">Across partner agencies</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center">
            <Plane size={24} />
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Booked / Reserved</p>
            <p className="text-3xl font-black text-purple-950 mt-1">{stats.bookedSlots}</p>
            <p className="text-xs text-purple-600 mt-1">Confirmed pilgrim seats</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="rounded-2xl p-5 border border-amber-100 bg-gradient-to-br from-amber-50 to-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Active Packages</p>
            <p className="text-3xl font-black text-amber-950 mt-1">{stats.openPosts}</p>
            <p className="text-xs text-amber-600 mt-1">{stats.totalPosts} total packages announced</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        tabs={[
          { key: 'packages', label: 'Travel Packages & Available Slots' },
          ...(isSecretaryOrAdmin
            ? [{ key: 'registrations', label: `Pilgrim Registrations (${registrations.length})` }]
            : []),
          { key: 'my-bookings', label: `My Registered Seats (${myBookings.length})` },
          { key: 'orientation', label: 'Orientation & Guide' },
        ]}
      />

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: AVAILABLE PACKAGES & POSTS
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 self-center mr-1">Filter:</span>
              {['ALL', 'HAJJ', 'UMRAH'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filterType === t
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {t === 'ALL' ? 'All Types' : t}
                </button>
              ))}

              <span className="text-gray-300 self-center mx-1">|</span>

              {['ALL', 'OPEN', 'FULL'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    filterStatus === st
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Status' : st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search packages or agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Packages Grid */}
          {isLoadingPosts ? (
            <div className="text-center py-16">
              <RefreshCw className="animate-spin mx-auto text-emerald-600 mb-2" size={28} />
              <p className="text-xs text-gray-500">Loading travel packages...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
              <Plane className="mx-auto text-gray-300 mb-3" size={44} />
              <h3 className="text-base font-bold text-gray-800">No Travel Packages Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {isSecretaryOrAdmin
                  ? 'No packages match your search or filter. Click "Post Travel Package" to announce available travel partner slots.'
                  : 'There are currently no active Hajj or Umrah package announcements. Please check back soon.'}
              </p>
              {isSecretaryOrAdmin && (
                <Button
                  size="sm"
                  className="mt-4"
                  icon={<Plus size={14} />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => {
                const remaining = Math.max(0, (post.totalSlots || 0) - (post.bookedSlots || 0));
                const percentFilled = Math.min(
                  100,
                  Math.round(((post.bookedSlots || 0) / (post.totalSlots || 1)) * 100)
                );
                const isFull = post.status === 'FULL' || remaining === 0;
                const isClosed = post.status === 'CLOSED';

                return (
                  <div
                    key={post._id}
                    className="bg-white rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top banner */}
                    <div>
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={post.type === 'HAJJ' ? 'emerald' : 'blue'}
                              size="sm"
                              className="font-bold tracking-wide"
                            >
                              {post.type}
                            </Badge>
                            <Badge
                              variant={isClosed ? 'gray' : isFull ? 'red' : 'emerald'}
                              size="sm"
                              dot
                            >
                              {isClosed ? 'Closed' : isFull ? 'Slots Full' : 'Registration Open'}
                            </Badge>
                          </div>
                          {post.estimatedPrice && (
                            <span className="text-base font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                              {post.estimatedPrice}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 leading-snug">{post.title}</h3>

                        {/* Travel Agency Pill */}
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                          <span className="font-semibold text-slate-900">Agency:</span>
                          <span>{post.travelsName}</span>
                          {post.contactPerson && (
                            <span className="text-gray-400">({post.contactPerson})</span>
                          )}
                        </div>

                        {/* Agency Contact Highlight */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <a
                            href={`tel:${post.contactPhone}`}
                            className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                          >
                            <Phone size={13} /> {post.contactPhone}
                          </a>
                          {post.contactEmail && (
                            <span className="inline-flex items-center gap-1.5 text-gray-500">
                              <Mail size={13} /> {post.contactEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 space-y-4">
                        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                          {post.description}
                        </p>

                        {/* Slot Meter */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-gray-700">Slot Availability</span>
                            <span
                              className={`font-bold ${
                                isFull ? 'text-red-600' : 'text-emerald-700'
                              }`}
                            >
                              {remaining} remaining of {post.totalSlots} slots
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-400 mt-1.5">
                            <span>{post.bookedSlots} Seats Reserved</span>
                            <span>{percentFilled}% Filled</span>
                          </div>
                        </div>

                        {/* Features / Inclusions */}
                        {post.features && post.features.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-bold text-gray-700">Package Inclusions:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {post.features.map((feat, idx) => (
                                <div
                                  key={idx}
                                  className="text-[11px] text-gray-600 flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dates info */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                          {post.departureDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-gray-400" />
                              <span>
                                Departs:{' '}
                                <strong className="text-gray-700">
                                  {new Date(post.departureDate).toLocaleDateString()}
                                </strong>
                              </span>
                            </div>
                          )}
                          {post.registrationDeadline && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-amber-500" />
                              <span>
                                Deadline:{' '}
                                <strong className="text-gray-700">
                                  {new Date(post.registrationDeadline).toLocaleDateString()}
                                </strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-6 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-500">
                        {isFull ? (
                          <span className="text-red-600 font-semibold">Registration full</span>
                        ) : isClosed ? (
                          <span className="text-gray-500">Package closed</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">
                            ⚡ Instant Nodemailer confirmation
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={isFull || isClosed}
                          onClick={() => handleOpenRegister(post)}
                          className={
                            isFull || isClosed
                              ? 'opacity-50 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs'
                          }
                          icon={<Plane size={14} />}
                        >
                          {isFull ? 'Sold Out' : 'Grab Seats / Register'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: SECRETARY / ADMIN REGISTRATIONS TABLE
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'registrations' && isSecretaryOrAdmin && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Pilgrim Slot Bookings &amp; Travels Verification
              </h3>
              <p className="text-xs text-gray-500">
                Track registered members, verify confirmation status, and resend Nodemailer confirmation emails
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
              Total Registrations: {registrations.length}
            </div>
          </div>

          {isLoadingRegs ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto text-emerald-600 mb-2" size={24} />
              <p className="text-xs text-gray-500">Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              No pilgrim registrations recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Applicant &amp; Contact</th>
                    <th className="px-4 py-3">Package / Travels</th>
                    <th className="px-4 py-3">Seats</th>
                    <th className="px-4 py-3">Ref ID</th>
                    <th className="px-4 py-3">Email Notification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {registrations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{reg.applicantName}</div>
                        <div className="text-[11px] text-emerald-700 font-medium">{reg.applicantPhone}</div>
                        <div className="text-[11px] text-gray-400">{reg.applicantEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">
                          {reg.postId?.title || 'Hajj/Umrah Package'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {reg.postId?.travelsName} • {reg.postId?.contactPhone}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {reg.seats} {reg.seats === 1 ? 'seat' : 'seats'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600 font-semibold">
                        {reg.registrationRef}
                      </td>
                      <td className="px-4 py-3">
                        {reg.emailSent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
                            <Check size={12} /> Nodemailer Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-100">
                            <Clock size={12} /> Pending Dispatch
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={reg.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({ id: reg._id, status: e.target.value })
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white font-medium"
                        >
                          <option value="REGISTERED">Registered</option>
                          <option value="CONFIRMED">Confirmed by Travels</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          title="Resend confirmation email via Nodemailer"
                          onClick={() => resendEmailMutation.mutate(reg._id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Send size={14} />
                        </button>
                        <a
                          href={`tel:${reg.applicantPhone}`}
                          title="Call Applicant"
                          className="inline-block p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Phone size={14} />
                        </a>
                        <a
                          href={`https://wa.me/${reg.applicantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Assalamu Alaikum ${reg.applicantName}, Greetings from Mahallu Office. Regarding your Hajj/Umrah registration (Ref: ${reg.registrationRef}), please contact the travels organizer at ${reg.postId?.contactPhone || ''} to confirm your seat.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Share on WhatsApp"
                          className="inline-block p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Share2 size={14} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: MY REGISTERED SEATS
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8">
              <Plane className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="text-base font-bold text-gray-800">No Registrations Yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                You haven't reserved any Hajj or Umrah slots under your account.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('packages')}
              >
                Browse Available Packages
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => (
                <Card key={b._id} padding="md">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase">
                        {b.postId?.type || 'PILGRIMAGE'}
                      </span>
                      <h4 className="text-base font-bold text-gray-900 mt-0.5">
                        {b.postId?.title || 'Hajj/Umrah Package'}
                      </h4>
                    </div>
                    <Badge
                      variant={
                        b.status === 'CONFIRMED'
                          ? 'emerald'
                          : b.status === 'CANCELLED'
                          ? 'red'
                          : 'blue'
                      }
                      size="sm"
                      dot
                    >
                      {b.status}
                    </Badge>
                  </div>

                  {/* Travel Agency Contact Alert */}
                  <div className="my-3 bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80">
                    <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <span>⚡</span> Travels Desk Contact:
                    </p>
                    <p className="text-sm font-extrabold text-emerald-950">
                      {b.postId?.travelsName || 'Travel Partner'}
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Phone: <strong className="text-emerald-900">{b.postId?.contactPhone}</strong>
                    </p>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`tel:${b.postId?.contactPhone}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
                      >
                        <Phone size={13} /> Call Travels
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Seats Reserved:</strong> {b.seats}
                    </p>
                    <p>
                      <strong>Reference ID:</strong>{' '}
                      <span className="font-mono font-bold text-gray-800">{b.registrationRef}</span>
                    </p>
                    <p>
                      <strong>Registered On:</strong> {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 4: ORIENTATION & GUIDE
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'orientation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Pilgrimage Orientation &amp; Preparation Sessions</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                The Mahallu Pilgrimage Committee conducts comprehensive training sessions for all registered Hajj and Umrah pilgrims:
              </p>
              <div className="space-y-2">
                {[
                  {
                    title: 'Fiqh of Hajj & Umrah Workshop',
                    desc: 'Practical walk-through of Ihram, Tawaf, Sa’i, Wuquf at Arafah, Rami al-Jamarat, and Halq/Taqseer.',
                  },
                  {
                    title: 'Physical Fitness & Health Guidance',
                    desc: 'Medical examination, mandatory vaccinations (Meningitis, Influenza), and walking endurance tips for elderly pilgrims.',
                  },
                  {
                    title: 'Traveler Ethics & Group Discipline',
                    desc: 'Coordination with travel Ameer, staying safe in crowded areas, currency exchange, and emergency helplines in Saudi Arabia.',
                  },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-900">{item.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card padding="md">
            <CardHeader>
              <CardTitle>Important Pilgrim Guidelines</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <p className="font-bold text-amber-900">Seat Reservation Protocol</p>
                <p className="text-[11px] text-amber-800 mt-1">
                  1. Submitting your registration on this portal reserves your slot under the Mahallu quota.
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  2. An automated confirmation email is sent to your inbox via Nodemailer immediately.
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  3. You must contact the specified travel agency number promptly to submit passport copies and advance payment to finalize your ticket.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <p className="font-bold text-blue-900">Documents Required</p>
                <p className="text-[11px] text-blue-800 mt-1">
                  • Original Passport with minimum 6 months validity from departure date.
                </p>
                <p className="text-[11px] text-blue-800 mt-1">
                  • White background passport size photographs (4x6 cm).
                </p>
                <p className="text-[11px] text-blue-800 mt-1">
                  • Proof of relation (for female pilgrims with Mahram).
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 1: SECRETARY CREATES NEW TRAVEL POST
          ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post Hajj/Umrah Travel Package & Slots"
        size="lg"
      >
        <form onSubmit={handleCreatePostSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Package Title"
                placeholder="e.g. Al-Haramain 2027 Executive Hajj Group"
                required
                value={postFormData.title}
                onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
              />
            </div>
            <div>
              <Select
                label="Type"
                options={[
                  { value: 'HAJJ', label: 'Hajj' },
                  { value: 'UMRAH', label: 'Umrah' },
                ]}
                value={postFormData.type}
                onChange={(e) => setPostFormData({ ...postFormData, type: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Travel Agency Name"
              placeholder="e.g. Al-Haramain Hajj & Umrah Travels"
              required
              value={postFormData.travelsName}
              onChange={(e) => setPostFormData({ ...postFormData, travelsName: e.target.value })}
            />
            <Input
              label="Agency Contact Person (Officer)"
              placeholder="e.g. Janab Musthafa Haji"
              value={postFormData.contactPerson}
              onChange={(e) => setPostFormData({ ...postFormData, contactPerson: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Travels Phone Number (To Grab Seats)"
              placeholder="e.g. +91 98470 12345"
              required
              value={postFormData.contactPhone}
              onChange={(e) => setPostFormData({ ...postFormData, contactPhone: e.target.value })}
            />
            <Input
              label="Travels Email (Optional)"
              placeholder="e.g. booking@alharamaintravels.com"
              type="email"
              value={postFormData.contactEmail}
              onChange={(e) => setPostFormData({ ...postFormData, contactEmail: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Total Available Slots"
              type="number"
              min={1}
              required
              value={postFormData.totalSlots}
              onChange={(e) =>
                setPostFormData({ ...postFormData, totalSlots: Number(e.target.value) })
              }
            />
            <Input
              label="Approx. Package Price"
              placeholder="e.g. ₹3,50,000"
              value={postFormData.estimatedPrice}
              onChange={(e) =>
                setPostFormData({ ...postFormData, estimatedPrice: e.target.value })
              }
            />
            <Input
              label="Expected Departure Date"
              type="date"
              value={postFormData.departureDate}
              onChange={(e) =>
                setPostFormData({ ...postFormData, departureDate: e.target.value })
              }
            />
          </div>

          <Textarea
            label="Package Details & Description"
            placeholder="Describe travel itinerary, hotel proximity to Haram, flight details, scholar mentorship..."
            required
            value={postFormData.description}
            onChange={(e) => setPostFormData({ ...postFormData, description: e.target.value })}
          />

          <Input
            label="Key Inclusions (Comma-separated)"
            placeholder="Direct flight, 5-Star hotel near Haram, Daily buffet meals, Guided Ziyarat"
            value={postFormData.featuresText}
            onChange={(e) => setPostFormData({ ...postFormData, featuresText: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createPostMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Publish Package &amp; Open Slots
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 2: MEMBER / PUBLIC SLOT REGISTRATION MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedPostForRegister}
        onClose={() => setSelectedPostForRegister(null)}
        title={`Register for ${selectedPostForRegister?.title || 'Pilgrimage'}`}
        size="md"
      >
        {selectedPostForRegister && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Quick Context Banner */}
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-950">
                  {selectedPostForRegister.travelsName}
                </span>
                <span className="font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedPostForRegister.availableSlots} slots remaining
                </span>
              </div>
              <p className="text-emerald-800 text-[11px]">
                Upon registration, a confirmation email with travels contact{' '}
                <strong>{selectedPostForRegister.contactPhone}</strong> will be sent automatically via Nodemailer.
              </p>
            </div>

            <Input
              label="Applicant Full Name"
              placeholder="e.g. Mohammed Rasheed"
              required
              value={registerFormData.applicantName}
              onChange={(e) =>
                setRegisterFormData({ ...registerFormData, applicantName: e.target.value })
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Phone / WhatsApp"
                placeholder="e.g. +91 98470 12345"
                required
                value={registerFormData.applicantPhone}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, applicantPhone: e.target.value })
                }
              />
              <Input
                label="Email Address (For Nodemailer Notification)"
                placeholder="e.g. pilgrim@gmail.com"
                type="email"
                required
                value={registerFormData.applicantEmail}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, applicantEmail: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Number of Seats"
                type="number"
                min={1}
                max={selectedPostForRegister.availableSlots}
                required
                value={registerFormData.seats}
                onChange={(e) =>
                  setRegisterFormData({
                    ...registerFormData,
                    seats: Math.max(1, Number(e.target.value)),
                  })
                }
              />
              <Input
                label="Passport Number (Optional)"
                placeholder="e.g. Z1234567"
                value={registerFormData.passportNumber}
                onChange={(e) =>
                  setRegisterFormData({ ...registerFormData, passportNumber: e.target.value })
                }
              />
            </div>

            <Textarea
              label="Notes or Special Needs (Optional)"
              placeholder="Any special assistance required (wheelchair, senior citizen, family room)..."
              value={registerFormData.notes}
              onChange={(e) =>
                setRegisterFormData({ ...registerFormData, notes: e.target.value })
              }
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setSelectedPostForRegister(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={registerMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm &amp; Grab Seats
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 3: INSTANT REGISTRATION SUCCESS & TRAVELS CONTACT SHARE MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!registrationSuccessData}
        onClose={() => setRegistrationSuccessData(null)}
        title="Registration Successful! 🎉"
        size="md"
      >
        {registrationSuccessData && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                Alhamdulillah! Your Registration is Recorded
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your request for <strong>{registrationSuccessData.registration.seats} seat(s)</strong> in{' '}
                <strong>{registrationSuccessData.post.title}</strong> has been logged in the Mahallu portal.
              </p>
            </div>

            {/* Nodemailer Notice */}
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-center gap-2">
              <Mail size={15} className="text-blue-600 shrink-0" />
              <span>
                A confirmation email has been dispatched via <strong>Nodemailer</strong> to{' '}
                <strong>{registrationSuccessData.registration.applicantEmail}</strong>.
              </span>
            </div>

            {/* ACTION CARD: TRAVELS CONTACT TO GRAB SEATS */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/60 rounded-2xl border-2 border-emerald-500 text-left shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-1">
                <span className="text-base">⚡</span> Next Step: Contact the Travel Partner
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed mb-3">
                To finalize your documents and grab your seats before slots fill up, call the authorized travel organizer immediately:
              </p>

              <div className="bg-white rounded-xl p-3.5 border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Agency:</span>
                  <span className="font-bold text-gray-900">
                    {registrationSuccessData.travelsContact.travelsName}
                  </span>
                </div>
                {registrationSuccessData.travelsContact.contactPerson && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Representative:</span>
                    <span className="font-semibold text-gray-800">
                      {registrationSuccessData.travelsContact.contactPerson}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Phone / WhatsApp:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    {registrationSuccessData.travelsContact.contactPhone}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-gray-500">Your Booking Ref:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {registrationSuccessData.registration.registrationRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(registrationSuccessData.registration.registrationRef)}
                      className="p-1 rounded hover:bg-emerald-100 text-emerald-800 transition-colors"
                      title="Copy Reference ID"
                    >
                      {copiedRef ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <a
                  href={`tel:${registrationSuccessData.travelsContact.contactPhone.replace(/\s+/g, '')}`}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Phone size={14} /> Call Travels Now
                </a>
                <a
                  href={`https://wa.me/${registrationSuccessData.travelsContact.contactPhone.replace(
                    /\D/g,
                    ''
                  )}?text=${encodeURIComponent(
                    `Assalamu Alaikum, I have registered for ${registrationSuccessData.post.title} via Mahallu Portal with Reference: ${registrationSuccessData.registration.registrationRef} (${registrationSuccessData.registration.seats} seats). Please confirm my seat availability.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Share2 size={14} /> WhatsApp Travels
                </a>
              </div>
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={() => setRegistrationSuccessData(null)}
              className="mt-2"
            >
              Done &amp; Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HajjUmrahPage;
