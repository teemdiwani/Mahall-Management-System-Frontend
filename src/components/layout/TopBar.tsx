import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../../api/domainApis';

interface TopBarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: annRes } = useQuery({
    queryKey: ['topbar-announcements'],
    queryFn: announcementsApi.list,
  });

  const announcements = annRes?.data || [];
  const urgentNotifs = announcements.filter(
    (a: any) => a.category?.toLowerCase() === 'urgent'
  );
  const notifCount = urgentNotifs.length > 0 ? urgentNotifs.length : Math.min(announcements.length, 3);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search members, families, applications..."
            className="w-72 pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors relative"
          >
            <Bell size={20} />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {notifCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {urgentNotifs.length > 0 ? (
                  urgentNotifs.slice(0, 3).map((n: any) => (
                    <div key={n._id || n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell size={14} className="text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{n.content?.slice(0, 80)}...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.publishedAt || n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((n: any) => (
                    <div key={n._id || n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{n.content?.slice(0, 80)}...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.publishedAt || n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-gray-400">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-50">
                <Link to="/announcements" onClick={() => setNotifOpen(false)} className="text-xs text-emerald-600 font-medium hover:underline block text-center">
                  View all announcements
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
