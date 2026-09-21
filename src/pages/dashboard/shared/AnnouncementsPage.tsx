import React, { useState } from 'react';
import { Bell, Search, Plus, Pin, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Tabs, { useTabs } from '../../../components/ui/Tabs';
import { announcementsApi } from '../../../api/domainApis';
import { useAuth } from '../../../context/AuthContext';

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
  const author = ann.author || ann.publishedBy || 'Mahall Administration';
  const publishedDate = ann.publishedAt || ann.createdAt || Date.now();

  return (
    <Card padding="md" hover className="group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${isUrgent ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <Bell size={18} className={isUrgent ? 'text-red-500' : 'text-emerald-600'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={categoryMap[ann.category] || 'blue'} size="sm">{category}</Badge>
              {ann.isPinned && (
                <span className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                  <Pin size={11} className="text-red-500" /> Pinned
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug">
              {ann.title}
            </h3>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4 pl-13">{ann.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
        <span>Posted by {author}</span>
        <span>{new Date(publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
    </Card>
  );
};

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useTabs('all');
  const [search, setSearch] = useState('');
  const canPost = ['super_admin', 'SUPER_ADMIN', 'secretary', 'SECRETARY', 'imam', 'IMAM', 'welfare_officer', 'WELFARE_OFFICER', 'madrasa_admin', 'MADRASA_ADMIN'].includes(user?.role ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.list,
  });

  const rawList: any[] = data?.data || [];

  const filtered = rawList.filter(a => {
    const category = (a.category || '').toLowerCase();
    const matchesTab =
      activeTab === 'all' ||
      category === activeTab ||
      (activeTab === 'urgent' && (a.isPinned || category === 'prayer'));
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
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
        subtitle="Official community notifications and public circulars saved in MongoDB"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Announcements' }]}
        action={canPost && <Button icon={<Plus size={16} />}>Post Announcement</Button>}
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
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notices..."
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:border-emerald-400 outline-none w-52"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-sm">Loading announcements from MongoDB...</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
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
    </div>
  );
};

export default AnnouncementsPage;

