import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  DollarSign,
  Moon,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  onOpenSidebar: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role || 'member';
  const isManagement = ['super_admin', 'secretary', 'treasurer', 'committee_member'].includes(role);

  const familyHref = isManagement ? '/app/families' : '/app/my-family';
  const paymentsHref = ['super_admin', 'treasurer'].includes(role) ? '/app/finance' : '/app/my-payments';

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 flex items-center justify-around pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
    >
      <NavLink
        to="/app/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isActive
              ? 'text-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`
        }
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Dashboard</span>
      </NavLink>

      <NavLink
        to={familyHref}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isActive
              ? 'text-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`
        }
      >
        <Home size={20} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">
          {isManagement ? 'Families' : 'Family'}
        </span>
      </NavLink>

      <NavLink
        to={paymentsHref}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isActive
              ? 'text-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`
        }
      >
        <div className="relative">
          <DollarSign size={20} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">
          {['super_admin', 'treasurer'].includes(role) ? 'Finance' : 'Payments'}
        </span>
      </NavLink>

      <NavLink
        to="/app/ramadan"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            isActive
              ? 'text-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`
        }
      >
        <Moon size={20} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Ramadan</span>
      </NavLink>

      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
