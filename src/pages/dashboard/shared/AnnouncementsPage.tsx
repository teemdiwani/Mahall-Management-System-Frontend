import React, { useState } from 'react';
import { Bell, Search, Plus, Pin, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { announcementsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';
import { usePushNotification } from '../../../context/PushNotificationContext';

const categoryMap: Record<string, 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray' | 'teal' | 'orange'> = {
  general: 'blue', GENERAL: 'blue',
  prayer: 'red', PRAYER: 'red',
  urgent: 'red',
  mosque: 'emerald',
  welfare: 'teal', WELFARE: 'teal',
  finance: 'amber', FINANCE: 'amber',
  madrasa: 'purple',
  event: 'purple', EVENT: 'purple',
};

const AnnouncementCard: React.FC<{ ann: any }> = ({ ann }) => {
  const category = (ann.category || 'GENERAL').toLowerCase();
  const isUrgent = category === 'urgent' || category === 'prayer' || ann.isPinned;
  const author = ann.author || ann.publishedBy || 'Noorul Huda Mahall Administration';
  const publishedDate = ann.publishedAt || ann.createdAt || Date.now();

  return (
    <Card padding="md" hover className="group dark:bg-neutral-800/80 dark:border-neutral-700/80">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${isUrgent ? 'bg-red-50 dark:bg-red-950/40' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
            <Bell size={18} className={isUrgent ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={categoryMap[ann.category] || 'blue'} size="sm">{category}</Badge>
              {ann.isPinned && (
                <span className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-medium">
                  <Pin size={11} className="text-red-500" /> Pinned
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
              {ann.title}
            </h3>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-neutral-300 leading-relaxed mb-4 pl-13">{ann.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-neutral-400 border-t border-gray-50 dark:border-neutral-700/60 pt-3">
        <span>Posted by {author}</span>
        <span>{new Date(publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </Card>
  );
};

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifyAnnouncement } = usePushNotification();
  const queryClient = useQueryClient();
  const { activeTab, setActiveTab } = useTabs('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'GENERAL',
    content: '',
    isPinned: false,
    targetAudience: 'ALL',
  });

  const canPost = ['super_admin', 'SUPER_ADMIN', 'secretary', 'SECRETARY', 'imam', 'IMAM', 'welfare_officer', 'WELFARE_OFFICER', 'madrasa_admin', 'MADRASA_ADMIN'].includes(user?.role ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  const postMutation = useMutation({
    mutationFn: (payload: typeof form) => announcementsApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      notifyAnnouncement({
        title: form.title,
        content: form.content,
        id: res?.data?._id,
      });
      setIsModalOpen(false);
      setForm({
        title: '',
        category: 'GENERAL',
        content: '',
        isPinned: false,
        targetAudience: 'ALL',
      });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to post announcement');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    postMutation.mutate(form);
  };

  const rawList: any[] = data?.data || [];

  const filtered = rawList.filter(a => {
    const category = (a.category || '').toLowerCase();
    const matchesTab =
      activeTab === 'all' ||
      category === activeTab ||
      (activeTab === 'urgent' && (a.isPinned || category === 'prayer'));
    const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort pinned/urgent first
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Official community notifications and public circulars for Noorul Huda Mahall Odamala"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Announcements' }]}
        action={canPost && (
          <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Post Announcement
          </Button>
        )}
      />

      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
          tabs={[
            { key: 'all', label: 'All Notices' },
            { key: 'urgent', label: 'Pinned & Urgent' },
            { key: 'finance', label: 'Finance' },
            { key: 'welfare', label: 'Welfare' },
            { key: 'general', label: 'General' },
          ]}
        />
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 focus:border-emerald-500 outline-none w-52 transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm">Loading announcements from MongoDB...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-neutral-500">
          <Bell size={32} className="mx-auto mb-3 opacity-30" />
          <p>No announcements found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map(ann => (
            <AnnouncementCard key={ann._id || ann.id} ann={ann} />
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-850 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Post Community Announcement</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Juma Bayan & Mahall Council Meeting"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="PRAYER">Prayer & Mosque</option>
                    <option value="WELFARE">Welfare & Charity</option>
                    <option value="FINANCE">Finance & Dues</option>
                    <option value="EVENT">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Mahallu Community</option>
                    <option value="MEMBERS">Registered Heads Only</option>
                    <option value="COMMITTEE_MEMBER">Committee Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Announcement Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide complete circular details, timings, and instructions for members..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-neutral-700"
                />
                <label htmlFor="isPinned" className="text-sm text-gray-700 dark:text-neutral-300 select-none">
                  Pin to top of circular notices (High Priority Alert)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  loading={postMutation.isPending}
                  icon={<Bell size={16} />}
                >
                  Publish & Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;

