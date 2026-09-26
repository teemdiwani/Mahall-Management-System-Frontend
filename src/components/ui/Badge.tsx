import React from 'react';
import type { ApplicationStatus, PaymentStatus, AccountStatus } from '../../types';

type BadgeVariant = 'emerald' | 'blue' | 'amber' | 'red' | 'gray' | 'purple' | 'orange' | 'teal';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
};

const dotColors: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', size = 'sm', dot = false, className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full
      ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}
      ${variantClasses[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

// Status-aware badges
export const ApplicationStatusBadge: React.FC<{ status?: string | ApplicationStatus }> = ({ status }) => {
  const normalized = (status || 'pending').toString().toLowerCase().replace(/[\s-]+/g, '_');
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Pending', variant: 'amber' },
    under_review: { label: 'Under Review', variant: 'blue' },
    in_review: { label: 'In Review', variant: 'blue' },
    reviewing: { label: 'Reviewing', variant: 'blue' },
    approved: { label: 'Approved', variant: 'emerald' },
    rejected: { label: 'Rejected', variant: 'red' },
    completed: { label: 'Completed', variant: 'teal' },
  };
  const item = config[normalized] || {
    label: (status || 'Pending').toString().replace(/_/g, ' '),
    variant: 'gray' as BadgeVariant,
  };
  return <Badge variant={item.variant} dot>{item.label}</Badge>;
};

export const PaymentStatusBadge: React.FC<{ status?: string | PaymentStatus }> = ({ status }) => {
  const normalized = (status || 'pending').toString().toLowerCase().replace(/[\s-]+/g, '_');
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    paid: { label: 'Paid', variant: 'emerald' },
    pending: { label: 'Pending', variant: 'amber' },
    overdue: { label: 'Overdue', variant: 'red' },
    failed: { label: 'Failed', variant: 'red' },
    processing: { label: 'Processing', variant: 'blue' },
    refunded: { label: 'Refunded', variant: 'gray' },
  };
  const item = config[normalized] || {
    label: (status || 'Pending').toString().replace(/_/g, ' '),
    variant: 'gray' as BadgeVariant,
  };
  return <Badge variant={item.variant} dot>{item.label}</Badge>;
};

export const AccountStatusBadge: React.FC<{ status?: string | AccountStatus }> = ({ status }) => {
  const normalized = (status || 'active').toString().toLowerCase().replace(/[\s-]+/g, '_');
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: 'Active', variant: 'emerald' },
    inactive: { label: 'Inactive', variant: 'gray' },
    pending: { label: 'Pending', variant: 'amber' },
    deceased: { label: 'Deceased', variant: 'red' },
    suspended: { label: 'Suspended', variant: 'red' },
  };
  const item = config[normalized] || {
    label: (status || 'Active').toString().replace(/_/g, ' '),
    variant: 'gray' as BadgeVariant,
  };
  return <Badge variant={item.variant} dot>{item.label}</Badge>;
};

export default Badge;
