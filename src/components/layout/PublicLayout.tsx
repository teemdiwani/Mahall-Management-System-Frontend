import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const publicNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/mosque', label: 'Mosque' },
  { href: '/madrasa', label: 'Madrasa' },
  { href: '/services', label: 'Services' },
  { href: '/events', label: 'Events' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/contact', label: 'Contact' },
];

const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="text-white text-sm font-bold">AN</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">Al-Noor Mahall</p>
                <p className="text-xs text-emerald-600 font-medium leading-tight">Kozhikode</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {publicNavLinks.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                Member Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                Join Mahall
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4">
            <div className="flex flex-col gap-1">
              {publicNavLinks.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200 rounded-xl">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl">Join</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <Outlet />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AN</span>
                </div>
                <div>
                  <p className="text-white font-bold">Al-Noor Mahall</p>
                  <p className="text-emerald-400 text-xs">MahallConnect Platform</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Serving the community of Kozhikode with education, welfare, and spiritual guidance since 1975.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Quick Links</p>
              <div className="flex flex-col gap-2">
                {publicNavLinks.slice(0, 5).map(l => (
                  <Link key={l.href} to={l.href} className="text-sm text-gray-500 hover:text-emerald-400 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Contact</p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <p>Al-Noor Mosque, Meenangadi Road</p>
                <p>Kozhikode, Kerala — 673001</p>
                <p>+91 495 234 5678</p>
                <p>info@alnoor.org</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
            © 2026 Al-Noor Mahall. All rights reserved. Powered by MahallConnect.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
