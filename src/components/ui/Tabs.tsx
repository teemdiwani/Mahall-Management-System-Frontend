import React, { useState } from 'react';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, variant = 'underline', className = '' }) => {
  if (variant === 'pills') {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`border-b border-gray-200 overflow-x-auto scrollbar-none ${className}`}>
      <div className="flex gap-1 -mb-px flex-nowrap min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all shrink-0 cursor-pointer
              ${activeTab === tab.key
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40 sm:bg-transparent rounded-t-lg sm:rounded-none'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const useTabs = (defaultTab: string) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return { activeTab, setActiveTab };
};

export default Tabs;
