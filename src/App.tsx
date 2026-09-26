import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import MosquePublicPage from './pages/public/MosquePublicPage';
import MadrasaPublicPage from './pages/public/MadrasaPublicPage';
import ServicesPublicPage from './pages/public/ServicesPublicPage';
import EventsPublicPage from './pages/public/EventsPublicPage';
import AnnouncementsPublicPage from './pages/public/AnnouncementsPublicPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard — Main Router
import DashboardRouter from './pages/dashboard/DashboardRouter';

// Super Admin
import UsersPage from './pages/dashboard/superadmin/UsersPage';

// Member
import MyFamilyPage from './pages/dashboard/member/MyFamilyPage';
import MyPaymentsPage from './pages/dashboard/member/MyPaymentsPage';
import WelfareDonationPage from './pages/dashboard/member/WelfareDonationPage';
import OfficialInvoicePage from './pages/dashboard/payments/OfficialInvoicePage';

// Treasurer & Finance
import TreasurerDashboard from './pages/dashboard/treasurer/TreasurerDashboard';
import PaymentsPage from './pages/dashboard/treasurer/PaymentsPage';
import DonationsPage from './pages/dashboard/treasurer/DonationsPage';
import ExpensesPage from './pages/dashboard/treasurer/ExpensesPage';
import FinanceReportsPage from './pages/dashboard/treasurer/FinanceReportsPage';

// Welfare
import WelfareDashboard from './pages/dashboard/welfare/WelfareDashboard';
import WelfareCasesPage from './pages/dashboard/welfare/WelfareCasesPage';
import ZakatPage from './pages/dashboard/welfare/ZakatPage';
import BeneficiariesPage from './pages/dashboard/welfare/BeneficiariesPage';

// Madrasa
import MadrasaDashboard from './pages/dashboard/madrasa/MadrasaDashboard';
import MadrasasPage from './pages/dashboard/madrasa/MadrasasPage';
import MadrasaDetailPage from './pages/dashboard/madrasa/MadrasaDetailPage';
import StudentsPage from './pages/dashboard/madrasa/StudentsPage';
import TeachersPage from './pages/dashboard/madrasa/TeachersPage';
import MadrasaClassesPage from './pages/dashboard/madrasa/MadrasaClassesPage';
import MadrasaTimetablePage from './pages/dashboard/madrasa/MadrasaTimetablePage';
import MadrasaResultsPage from './pages/dashboard/madrasa/MadrasaResultsPage';
import MadrasaFeesPage from './pages/dashboard/madrasa/MadrasaFeesPage';
import MadrasaAnnouncementsPage from './pages/dashboard/madrasa/MadrasaAnnouncementsPage';
import MadrasaParentPortalPage from './pages/dashboard/member/MadrasaParentPortalPage';

// Mosque
import MosqueDashboard from './pages/dashboard/mosque/MosqueDashboard';
import MosquePrayerPage from './pages/dashboard/mosque/MosquePrayerPage';
import MosqueProgramsPage from './pages/dashboard/mosque/MosqueProgramsPage';

// Shared Pages
import EventsPage from './pages/dashboard/shared/EventsPage';
import ApplicationsPage from './pages/dashboard/shared/ApplicationsPage';
import AnnouncementsPage from './pages/dashboard/shared/AnnouncementsPage';
import FamiliesPage from './pages/dashboard/shared/FamiliesPage';
import MembersPage from './pages/dashboard/shared/MembersPage';
import AssetsPage from './pages/dashboard/shared/AssetsPage';
import CommitteePage from './pages/dashboard/shared/CommitteePage';
import HajjUmrahPage from './pages/dashboard/shared/HajjUmrahPage';
import RamadanPage from './pages/dashboard/shared/RamadanPage';
import VolunteersPage from './pages/dashboard/shared/VolunteersPage';
import FuneralPage from './pages/dashboard/shared/FuneralPage';
import MarriagePage from './pages/dashboard/shared/MarriagePage';

// Profile
import ProfilePage from './pages/dashboard/profile/ProfilePage';

// Simple placeholder for auxiliary settings/roles
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
      <span className="text-2xl">⚙️</span>
    </div>
    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
    <p className="text-sm text-gray-500">System settings and configurations are managed via the role policy matrix.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="mosque" element={<MosquePublicPage />} />
            <Route path="madrasa" element={<MadrasaPublicPage />} />
            <Route path="services" element={<ServicesPublicPage />} />
            <Route path="events" element={<EventsPublicPage />} />
            <Route path="announcements" element={<AnnouncementsPublicPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Standalone Official Invoice (Non-sidebar, non-header page for print & download) */}
          <Route path="/app/payments/:id/invoice" element={<OfficialInvoicePage />} />
          <Route path="/payments/:id/invoice" element={<OfficialInvoicePage />} />

          {/* Dashboard App */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRouter />} />

            {/* Profile & Settings */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<PlaceholderPage title="System Settings" />} />

            {/* Super Admin */}
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<UsersPage />} />

            {/* Member */}
            <Route path="my-family" element={<MyFamilyPage />} />
            <Route path="my-payments" element={<MyPaymentsPage />} />
            <Route path="welfare-donation" element={<WelfareDonationPage />} />
            <Route path="my-madrasa" element={<MadrasaParentPortalPage />} />

            {/* Shared Core Modules */}
            <Route path="members" element={<MembersPage />} />
            <Route path="families" element={<FamiliesPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="funeral" element={<FuneralPage />} />
            <Route path="marriage" element={<MarriagePage />} />
            <Route path="committee" element={<CommitteePage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="hajj-umrah" element={<HajjUmrahPage />} />
            <Route path="ramadan" element={<RamadanPage />} />

            {/* Finance Sub-routes */}
            <Route path="finance" element={<TreasurerDashboard />} />
            <Route path="finance/payments" element={<PaymentsPage />} />
            <Route path="finance/donations" element={<DonationsPage />} />
            <Route path="finance/expenses" element={<ExpensesPage />} />
            <Route path="finance/reports" element={<FinanceReportsPage />} />

            {/* Welfare Sub-routes */}
            <Route path="welfare" element={<WelfareDashboard />} />
            <Route path="welfare/cases" element={<WelfareCasesPage />} />
            <Route path="welfare/zakat" element={<ZakatPage />} />
            <Route path="welfare/beneficiaries" element={<BeneficiariesPage />} />

            {/* Madrasa Sub-routes */}
            <Route path="madrasa" element={<MadrasaDashboard />} />
            <Route path="madrasa/directory" element={<MadrasasPage />} />
            <Route path="madrasa/:id" element={<MadrasaDetailPage />} />
            <Route path="madrasa/classes" element={<MadrasaClassesPage />} />
            <Route path="madrasa/students" element={<StudentsPage />} />
            <Route path="madrasa/teachers" element={<TeachersPage />} />
            <Route path="madrasa/timetables" element={<MadrasaTimetablePage />} />
            <Route path="madrasa/results" element={<MadrasaResultsPage />} />
            <Route path="madrasa/fees" element={<MadrasaFeesPage />} />
            <Route path="madrasa/announcements" element={<MadrasaAnnouncementsPage />} />

            {/* Mosque Sub-routes */}
            <Route path="mosque" element={<MosqueDashboard />} />
            <Route path="mosque/prayer" element={<MosquePrayerPage />} />
            <Route path="mosque/programs" element={<MosqueProgramsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
