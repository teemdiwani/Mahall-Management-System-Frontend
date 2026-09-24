import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Home, DollarSign, FileText, Calendar,
  Bell, BookOpen, Heart, Package, Users2, HelpCircle,
  Settings, ChevronDown, ChevronRight, Star, Megaphone, UserCheck,
  Building2, Moon, Plane, HeartHandshake, CrossIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { ROLE_LABELS } from '../../types';
import Avatar from '../ui/Avatar';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['super_admin', 'secretary', 'treasurer', 'imam', 'madrasa_admin', 'welfare_officer', 'committee_member', 'family_head', 'volunteer', 'member'];

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    href: '/app/dashboard',
    roles: ALL_ROLES,
  },
  {
    key: 'members',
    label: 'Members',
    icon: <Users size={18} />,
    href: '/app/members',
    roles: ['super_admin', 'secretary', 'committee_member'],
  },
  {
    key: 'families',
    label: 'Families',
    icon: <Home size={18} />,
    href: '/app/families',
    roles: ['super_admin', 'secretary', 'family_head', 'committee_member'],
  },
  {
    key: 'my-family',
    label: 'My Family',
    icon: <Home size={18} />,
    href: '/app/my-family',
    roles: ['member', 'volunteer'],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: <DollarSign size={18} />,
    roles: ['super_admin', 'treasurer', 'committee_member'],
    children: [
      { key: 'finance-overview', label: 'Overview', icon: <DollarSign size={16} />, href: '/app/finance', roles: ['super_admin', 'treasurer', 'committee_member'] },
      { key: 'finance-payments', label: 'Payments', icon: <DollarSign size={16} />, href: '/app/finance/payments', roles: ['super_admin', 'treasurer'] },
      { key: 'finance-donations', label: 'Donations', icon: <Heart size={16} />, href: '/app/finance/donations', roles: ['super_admin', 'treasurer'] },
      { key: 'finance-expenses', label: 'Expenses', icon: <DollarSign size={16} />, href: '/app/finance/expenses', roles: ['super_admin', 'treasurer'] },
      { key: 'finance-reports', label: 'Reports', icon: <FileText size={16} />, href: '/app/finance/reports', roles: ['super_admin', 'treasurer', 'committee_member'] },
    ],
  },
  {
    key: 'my-payments',
    label: 'My Payments',
    icon: <DollarSign size={18} />,
    href: '/app/my-payments',
    roles: ['member', 'family_head', 'volunteer'],
  },
  {
    key: 'my-madrasa',
    label: 'Madrasa Parent Desk',
    icon: <BookOpen size={18} />,
    href: '/app/my-madrasa',
    roles: ['member', 'family_head', 'volunteer'],
  },
  {
    key: 'welfare',
    label: 'Welfare',
    icon: <Heart size={18} />,
    roles: ['super_admin', 'welfare_officer', 'committee_member'],
    children: [
      { key: 'welfare-dash', label: 'Overview', icon: <Heart size={16} />, href: '/app/welfare', roles: ['super_admin', 'welfare_officer', 'committee_member'] },
      { key: 'welfare-cases', label: 'Welfare Cases', icon: <FileText size={16} />, href: '/app/welfare/cases', roles: ['super_admin', 'welfare_officer'] },
      { key: 'welfare-zakat', label: 'Zakat', icon: <Star size={16} />, href: '/app/welfare/zakat', roles: ['super_admin', 'welfare_officer', 'treasurer'] },
      { key: 'welfare-beneficiaries', label: 'Beneficiaries', icon: <Users size={16} />, href: '/app/welfare/beneficiaries', roles: ['super_admin', 'welfare_officer'] },
    ],
  },
  {
    key: 'madrasa',
    label: 'Madrasa Desk',
    icon: <BookOpen size={18} />,
    roles: ['super_admin', 'secretary', 'madrasa_admin', 'imam'],
    children: [
      { key: 'madrasa-dash', label: 'Overview', icon: <BookOpen size={16} />, href: '/app/madrasa', roles: ['super_admin', 'secretary', 'madrasa_admin', 'imam'] },
      { key: 'madrasa-classes', label: 'Classes (1-10/12)', icon: <Building2 size={16} />, href: '/app/madrasa/classes', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-timetables', label: 'Class Timetables', icon: <Calendar size={16} />, href: '/app/madrasa/timetables', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-results', label: 'Exam Results Desk', icon: <Star size={16} />, href: '/app/madrasa/results', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-fees', label: 'Monthly Fees & Alerts', icon: <DollarSign size={16} />, href: '/app/madrasa/fees', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-announcements', label: 'Parent Circulars', icon: <Bell size={16} />, href: '/app/madrasa/announcements', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-directory', label: 'All Madrasas', icon: <Building2 size={16} />, href: '/app/madrasa/directory', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-students', label: 'Students Roster', icon: <Users size={16} />, href: '/app/madrasa/students', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
      { key: 'madrasa-teachers', label: 'Usthad (Faculty)', icon: <UserCheck size={16} />, href: '/app/madrasa/teachers', roles: ['super_admin', 'secretary', 'madrasa_admin'] },
    ],
  },
  {
    key: 'mosque',
    label: 'Mosque',
    icon: <Building2 size={18} />,
    roles: ['super_admin', 'imam', 'secretary', 'committee_member'],
    children: [
      { key: 'mosque-dash', label: 'Overview', icon: <Building2 size={16} />, href: '/app/mosque', roles: ['super_admin', 'imam', 'secretary'] },
      { key: 'mosque-prayer', label: 'Prayer Schedule', icon: <Moon size={16} />, href: '/app/mosque/prayer', roles: ['super_admin', 'imam', 'secretary', 'committee_member'] },
      { key: 'mosque-programs', label: 'Programs', icon: <Megaphone size={16} />, href: '/app/mosque/programs', roles: ['super_admin', 'imam', 'secretary'] },
    ],
  },
  {
    key: 'applications',
    label: 'Mahall Requests',
    icon: <FileText size={18} />,
    href: '/app/applications',
    roles: ALL_ROLES,
  },
  {
    key: 'events',
    label: 'Events',
    icon: <Calendar size={18} />,
    href: '/app/events',
    roles: ALL_ROLES,
  },
  {
    key: 'announcements',
    label: 'Announcements',
    icon: <Bell size={18} />,
    href: '/app/announcements',
    roles: ALL_ROLES,
  },
  {
    key: 'volunteers',
    label: 'Volunteers',
    icon: <UserCheck size={18} />,
    href: '/app/volunteers',
    roles: ['super_admin', 'secretary', 'welfare_officer', 'committee_member', 'volunteer'],
  },
  {
    key: 'funeral',
    label: 'Funeral & Janazah',
    icon: <CrossIcon size={18} />,
    href: '/app/funeral',
    roles: ['super_admin', 'secretary', 'imam', 'committee_member'],
  },
  {
    key: 'marriage',
    label: 'Marriage (Nikah)',
    icon: <HeartHandshake size={18} />,
    href: '/app/marriage',
    roles: ['super_admin', 'secretary', 'imam', 'committee_member'],
  },
  {
    key: 'assets',
    label: 'Assets & Property',
    icon: <Package size={18} />,
    href: '/app/assets',
    roles: ['super_admin', 'treasurer', 'secretary', 'committee_member'],
  },
  {
    key: 'committee',
    label: 'Committee',
    icon: <Users2 size={18} />,
    href: '/app/committee',
    roles: ['super_admin', 'secretary', 'treasurer', 'committee_member', 'imam'],
  },
  {
    key: 'hajj-umrah',
    label: 'Hajj & Umrah',
    icon: <Plane size={18} />,
    href: '/app/hajj-umrah',
    roles: ALL_ROLES,
  },
  {
    key: 'ramadan',
    label: 'Ramadan',
    icon: <Moon size={18} />,
    href: '/app/ramadan',
    roles: ALL_ROLES,
  },
  {
    key: 'users',
    label: 'User Management',
    icon: <Users size={18} />,
    href: '/app/users',
    roles: ['super_admin'],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings size={18} />,
    href: '/app/settings',
    roles: ['super_admin', 'secretary'],
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['finance', 'welfare']);

  if (!user) return null;

  const matchRole = (allowedRoles: (string | UserRole)[]) => {
    const userRoleUpper = (user.role || '').toUpperCase();
    return allowedRoles.some((r) => r.toUpperCase() === userRoleUpper);
  };

  const visibleItems = navItems.filter((item) => matchRole(item.roles));

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderItem = (item: NavItem) => {
    if (item.children) {
      const isOpen = openGroups.includes(item.key);
      const visibleChildren = item.children.filter((c) => matchRole(c.roles));
      if (visibleChildren.length === 0) return null;
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleGroup(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              text-gray-600 hover:bg-gray-100 hover:text-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}
          >
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
          </button>
          {isOpen && !collapsed && (
            <div className="ml-9 mt-1 flex flex-col gap-0.5 border-l-2 border-gray-100 pl-3">
              {visibleChildren.map(child => (
                <NavLink
                  key={child.key}
                  to={child.href!}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                    ${isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`
                  }
                >
                  {child.icon}
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.key}
        to={item.href!}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
          ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}
          ${collapsed ? 'justify-center' : ''}`
        }
        title={collapsed ? item.label : undefined}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 flex flex-col z-30 transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">AN</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">Al-Noor</p>
            <p className="text-xs text-emerald-600 font-medium leading-tight">MahallConnect</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5 scrollbar-thin">
        {visibleItems.map(renderItem)}
      </nav>

      {/* User section */}
      <div className={`border-t border-gray-100 p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <HelpCircle size={16} />
            </button>
          </div>
        ) : (
          <Avatar name={user.name} size="sm" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
