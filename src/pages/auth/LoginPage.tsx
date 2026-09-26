import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

const SEED_ACCOUNTS = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@mahallconnect.org' },
  { role: 'TREASURER', label: 'Treasurer (Mustafa)', email: 'treasurer@mahallconnect.org' },
  { role: 'SECRETARY', label: 'Secretary (Zubair)', email: 'secretary@mahallconnect.org' },
  { role: 'WELFARE_OFFICER', label: 'Welfare Officer (Dr. Tariq)', email: 'welfare@mahallconnect.org' },
  { role: 'MADRASA_ADMIN', label: 'Madrasa Admin (Umar)', email: 'madrasa@mahallconnect.org' },
  { role: 'IMAM', label: 'Imam (Usthad Abdullah)', email: 'imam@mahallconnect.org' },
  { role: 'COMMITTEE_MEMBER', label: 'Committee (Haji Kareem)', email: 'committee@mahallconnect.org' },
  { role: 'MEMBER', label: 'Member (Ahmed Al-Rashid)', email: 'member@mahallconnect.org' },
];

const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    (location.state as any)?.resetSuccess ? 'Password reset successfully! Please sign in with your new password.' : ''
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      navigate('/app/dashboard');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('Password@123');
    setError('');
    setLoading(true);
    const ok = await login(accountEmail, 'Password@123');
    if (ok) {
      navigate('/app/dashboard');
    } else {
      setError('Failed to authenticate with test credentials.');
    }
    setLoading(false);
  };

  const handleGoogleAuth = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-white -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
              <span className="text-3xl font-bold">☽</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Al-Noor<br />MahallConnect
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
              Your Mahall, Connected Digitally. One platform for families, services, finance, education and community.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: '👨‍👩‍👧‍👦', text: '580+ registered families' },
              { icon: '🕌', text: 'Daily mosque programs & prayers' },
              { icon: '📚', text: 'Active Madrasa with 104 students' },
              { icon: '🤝', text: 'Community welfare & Zakat services' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-emerald-100">
                <span>{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold">AN</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Al-Noor Mahall</p>
              <p className="text-xs text-emerald-600">MahallConnect</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm">Sign in to your Mahall account</p>
          </div>

          {/* Google Sign-in */}
          <div className="mb-6">
            <GoogleSignInButton
              onSuccess={handleGoogleAuth}
              onError={(err) => setError(err)}
              disabled={loading}
              textType="continue_with"
            />
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR EMAIL SIGN IN</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {success && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (success) setSuccess('');
              }}
              placeholder="you@example.com"
              icon={<Mail size={16} />}
              required
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                icon={<Lock size={16} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : '/forgot-password',
                      { state: { email: email.trim() } }
                    )
                  }
                  className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            New to MahallConnect?{' '}
            <Link to="/register" className="text-emerald-600 font-medium hover:underline">Create an account</Link>
          </p>

          {/* Seed Accounts Quick Login Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              ⚡ Quick Sign-In (Real Seeded Accounts)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {SEED_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  disabled={loading}
                  className="text-left px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group cursor-pointer"
                >
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-emerald-700">{acc.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
