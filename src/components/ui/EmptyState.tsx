import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
          <Icon size={28} className="text-gray-300" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-sm mb-5">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

// Spinner
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  return (
    <svg className={`animate-spin ${s} text-emerald-600 ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = 'bg-emerald-50 text-emerald-600',
  change,
  changeType = 'neutral',
  subtitle,
}) => {
  const changeColor =
    changeType === 'up' ? 'text-emerald-600' :
    changeType === 'down' ? 'text-red-500' :
    'text-gray-500';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {change && <span className={`text-xs font-medium ${changeColor}`}>{change}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

// Page Header
export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}> = ({ title, subtitle, action, breadcrumb }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      {breadcrumb && (
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-gray-600 font-medium' : ''}>{crumb.label}</span>
            </React.Fragment>
          ))}
        </nav>
      )}
      <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-3">{action}</div>}
  </div>
);
