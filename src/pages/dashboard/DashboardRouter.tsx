import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import MemberDashboard from './member/MemberDashboard';
import TreasurerDashboard from './treasurer/TreasurerDashboard';
import SecretaryDashboard from './secretary/SecretaryDashboard';
import WelfareDashboard from './welfare/WelfareDashboard';
import MadrasaDashboard from './madrasa/MadrasaDashboard';
import MosqueDashboard from './mosque/MosqueDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const role = (user.role || '').toUpperCase();

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'SECRETARY':
      return <SecretaryDashboard />;
    case 'TREASURER':
      return <TreasurerDashboard />;
    case 'IMAM':
      return <MosqueDashboard />;
    case 'MADRASA_ADMIN':
      return <MadrasaDashboard />;
    case 'WELFARE_OFFICER':
      return <WelfareDashboard />;
    case 'COMMITTEE_MEMBER':
    case 'FAMILY_HEAD':
    case 'VOLUNTEER':
    case 'MEMBER':
    default:
      return <MemberDashboard />;
  }
};

export default DashboardRouter;
