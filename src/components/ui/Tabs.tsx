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
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="flex gap-0 -mb-px">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
              ${activeTab === tab.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
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
