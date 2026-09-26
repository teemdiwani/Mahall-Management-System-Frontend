import React, { useState } from 'react';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Volume2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Megaphone,
  FileText,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../context/PushNotificationContext';
import { ROLE_LABELS } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../../api/domainApis';

interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  const {
    permission,
    requestPermission,
    sendTestNotification,
    unreadCount,
    notifications,
    markAllAsRead,
    isSupported,
  } = usePushNotifications();

  const { data: annRes } = useQuery({
    queryKey: ['topbar-announcements'],
    queryFn: announcementsApi.list,
  });

  const announcements = annRes?.data || [];

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      onOpenMobileSidebar();
    } else {
      onToggleSidebar();
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      setTestPushStatus('Push notifications enabled!');
      setTimeout(() => setTestPushStatus(null), 4000);
    }
  };

  const handleTestPush = async () => {
    setTestingPush(true);
    try {
      const ok = await sendTestNotification();
      if (ok) {
        setTestPushStatus('Push notification dispatched! Check your screen.');
      } else {
        setTestPushStatus('Could not show push notification. Check browser settings.');
      }
    } catch {
      setTestPushStatus('Error dispatching test notification.');
    } finally {
      setTestingPush(false);
      setTimeout(() => setTestPushStatus(null), 5000);
    }
  };

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Megaphone size={14} className="text-amber-600" />;
      case 'EVENT':
        return <Calendar size={14} className="text-blue-600" />;
      case 'PAYMENT':
        return <CreditCard size={14} className="text-emerald-600" />;
      case 'APPLICATION':
        return <FileText size={14} className="text-purple-600" />;
      default:
        return <Bell size={14} className="text-gray-600" />;
    }
  };

  const getNotifBg = (type?: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'bg-amber-100 text-amber-700';
      case 'EVENT':
        return 'bg-blue-100 text-blue-700';
      case 'PAYMENT':
        return 'bg-emerald-100 text-emerald-700';
      case 'APPLICATION':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Combine live in-app notifications with recent announcements as fallback
  const displayItems = notifications.length > 0
    ? notifications
    : announcements.slice(0, 4).map((a: any) => ({
        _id: a._id || a.id,
        type: 'ANNOUNCEMENT',
        title: a.title,
        message: a.content || 'Mahall community announcement',
        createdAt: a.publishedAt || a.createdAt,
        link: '/app/announcements',
        read: false,
      }));

  const totalUnread = unreadCount > 0 ? unreadCount : displayItems.filter((i: any) => !i.read).length;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search members, families, payments..."
            className="w-64 lg:w-80 pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>

        {/* Mobile Search Input Overlay */}
        {mobileSearchOpen && (
          <div className="md:hidden absolute inset-x-0 top-0 h-16 bg-white z-30 px-3 flex items-center gap-2 border-b border-gray-100">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 py-2 text-base outline-none bg-transparent"
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          aria-label="Open search"
        >
          <Search size={20} />
        </button>

        {/* Notifications & Push Notification Controller */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors relative cursor-pointer"
            title="Notifications & Push Alerts"
          >
            <Bell size={20} />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-12 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  {totalUnread > 0 && (
                    <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {totalUnread} new
                    </span>
                  )}
                </div>
                {totalUnread > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-gray-500 hover:text-emerald-600 font-medium transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Browser Push Permission Status & Toggle Banner */}
              {isSupported && (
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                  {permission === 'granted' ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-900">
                          Browser Push Active
                        </span>
                      </div>
                      <button
                        onClick={handleTestPush}
                        disabled={testingPush}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
                      >
                        <Send size={11} />
                        {testingPush ? 'Testing...' : 'Test Push'}
                      </button>
                    </div>
                  ) : permission === 'denied' ? (
                    <div className="flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-900">Push Notifications Blocked</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Browser blocked alerts. Enable them in site settings to receive instant dues, announcements & event notifications.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <Volume2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-900">
                            Enable Push Notifications
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Get real-time browser alerts for Announcements, Upcoming Events, and Payment Dues.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEnablePush}
                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Bell size={13} /> Allow Browser Push Alerts
                      </button>
                    </div>
                  )}

                  {testPushStatus && (
                    <p className="mt-2 text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-200">
                      {testPushStatus}
                    </p>
                  )}
                </div>
              )}

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {displayItems.length > 0 ? (
                  displayItems.map((item: any) => {
                    const targetLink = item.link || (
                      item.type === 'EVENT' ? '/app/events' :
                      item.type === 'PAYMENT' ? '/app/my-payments' :
                      '/app/announcements'
                    );

                    return (
                      <div
                        key={item._id || item.id || Math.random()}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(targetLink);
                        }}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !item.read ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getNotifBg(item.type)}`}>
                            {getNotifIcon(item.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className={`text-xs font-semibold truncate ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {item.title}
                              </p>
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.message || item.content}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : 'Just now'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-xs text-gray-400">
                    <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                    No notifications right now
                  </div>
                )}
              </div>

              {/* Bottom Navigation Quick Links */}
              <div className="px-3 py-2 bg-gray-50/70 border-t border-gray-100 flex items-center justify-around text-xs text-emerald-700 font-medium">
                <Link
                  to="/app/announcements"
                  onClick={() => setNotifOpen(false)}
                  className="hover:underline hover:text-emerald-800 py-1 px-2 rounded"
                >
                  📢 Announcements
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/app/events"
                  onClick={() => setNotifOpen(false)}
                  className="hover:underline hover:text-emerald-800 py-1 px-2 rounded"
                >
                  🗓️ Events
                </Link>
                <span className="text-gray-300">|</span>
                <Link
                  to="/app/my-payments"
                  onClick={() => setNotifOpen(false)}
                  className="hover:underline hover:text-emerald-800 py-1 px-2 rounded"
                >
                  💳 My Dues
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Avatar name={user.name} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-tight">{user.name.split(' ')[0]}</p>
              <p className="text-xs text-gray-400 leading-tight">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
                <div className="mt-2">
                  <Badge variant="emerald">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</Badge>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/app/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={15} /> My Profile
                </Link>
                <Link
                  to="/app/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={15} /> Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
