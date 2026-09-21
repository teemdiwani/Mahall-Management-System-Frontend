import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authApi } from '../../api/authApi';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.phone.trim() || form.phone.trim().length < 10) {
      setError('Contact Phone number is required (min 10 digits).');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(form);
      setSuccess(true);
      setTimeout(() => navigate('/app/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <span className="text-white font-bold">AN</span>
          </div>
          <div>
            <p className="font-bold text-gray-900">Al-Noor Mahall</p>
            <p className="text-xs text-emerald-600">MahallConnect</p>
          </div>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">
            Join Al-Noor Mahall community. New members receive the <strong>Member</strong> role by default.
          </p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Account Created Successfully!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Registered as <strong>Member</strong>. Redirecting to your dashboard...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ahmed Abdullah"
                icon={<User size={16} />}
                required
              />
              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                icon={<Mail size={16} />}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 00000"
                icon={<Phone size={16} />}
                required
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Create a strong password (min 6 characters)"
                icon={<Lock size={16} />}
                required
              />

              <div className="flex items-start gap-2 mt-1 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  All new accounts are registered as <strong>Member</strong> by default. Privileged administrative roles are granted exclusively by the Super Admin.
                </p>
              </div>

              <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
                Create Account
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
