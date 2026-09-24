import React from 'react';
import { PageHeader } from '../../../components/ui/EmptyState';
import MadrasaParentPortalSection from '../../../components/madrasa/MadrasaParentPortalSection';

const MadrasaParentPortalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Madrasa Parent Portal"
        subtitle="Manage academic progress, exam results, daily timetables, monthly fees, and announcements for your children"
        breadcrumb={[{ label: 'Member Portal', href: '/app/dashboard' }, { label: 'Madrasa Parent Portal' }]}
      />

      <MadrasaParentPortalSection isStandalone={true} />
    </div>
  );
};

export default MadrasaParentPortalPage;
