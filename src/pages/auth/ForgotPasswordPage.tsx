import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/authApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Step = 'EMAIL' | 'OTP' | 'SUCCESS';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Pre-fill email if passed from login page (state or URL param)
  const initialEmail = (location.state as any)?.email || searchParams.get('email') || '';

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request OTP / Verify Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res: any = await authApi.forgotPassword(email.trim());
      const msg =
        res?.data?.message ||
        res?.message ||
        'A 6-digit verification code has been sent to your email.';
      setSuccessMsg(msg);
      if (res?.data?.devOtp || res?.devOtp) {
        setDevOtp(res?.data?.devOtp || res?.devOtp);
      }
      setStep('OTP');
      setResendCooldown(60);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to verify email. Please check your registered email or contact admin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError('');
    setLoading(true);

    try {
      const res: any = await authApi.forgotPassword(email.trim());
      const msg =
        res?.data?.message ||
        res?.message ||
        'A fresh 6-digit verification code has been sent.';
      setSuccessMsg(msg);
      if (res?.data?.devOtp || res?.devOtp) {
        setDevOtp(res?.data?.devOtp || res?.devOtp);
      }
      setResendCooldown(60);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to resend verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(email.trim(), otp.trim(), newPassword);
      setStep('SUCCESS');
      // Redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { email, resetSuccess: true },
        });
      }, 2500);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Invalid or expired OTP code. Please check and try again.';
      setError(msg);
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
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Account Security &amp;<br />Password Recovery
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-sm">
              Safeguarding your Mahallu data. Reset your password securely with 2-step email verification.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { icon: '🔒', text: 'Encrypted & secure password hashing' },
              { icon: '📧', text: 'Instant 6-digit OTP to your registered inbox' },
              { icon: '⏱️', text: 'Time-limited verification code (10 minutes)' },
              { icon: '⚡', text: 'Instant reactivation of your account' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-emerald-100">
                <span>{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Interactive Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <span className="text-white font-bold">AN</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Al-Noor Mahall</p>
              <p className="text-xs text-emerald-600">MahallConnect Security</p>
            </div>
          </div>

          {/* ─── STEP 1: VERIFY EMAIL ────────────────────────────────────────── */}
          {step === 'EMAIL' && (
            <div>
              <div className="mb-8">
                <Link
                  to="/login"
                  state={{ email }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your account email to receive a 6-digit OTP verification code.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm mb-4">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <Input
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  icon={<Mail size={16} />}
                  required
                  autoFocus
                  helper="We will dispatch a 6-digit OTP code to this inbox."
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                  className="mt-2"
                  icon={<ShieldCheck size={18} />}
                >
                  Verify Email &amp; Send OTP
                </Button>
              </form>
            </div>
          )}

          {/* ─── STEP 2: ENTER OTP & NEW PASSWORD ─────────────────────────────── */}
          {step === 'OTP' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Change Email
                </button>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Enter Verification Code</h2>
                <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600 mt-1">
                  <span>Code dispatched to:</span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs">
                    {email}
                  </span>
                </div>
              </div>

              {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm mb-4">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm mb-4">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                {devOtp && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                    <div>
                      <span className="font-semibold">Quick verification code: </span>
                      <strong className="font-mono text-sm tracking-wider text-emerald-950 ml-1">{devOtp}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtp(devOtp)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer transition-colors shadow-xs"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    6-Digit OTP Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-2xl font-bold tracking-[0.5em] font-mono py-3 px-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-400">Check inbox &amp; spam folder (valid for 10 min)</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || loading}
                      className={`font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                        resendCooldown > 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-emerald-600 hover:text-emerald-700 hover:underline'
                      }`}
                    >
                      <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  icon={<Lock size={16} />}
                  iconRight={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />

                {/* Confirm New Password */}
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  icon={<Lock size={16} />}
                  iconRight={
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  size="lg"
                  className="mt-2"
                  icon={<CheckCircle2 size={18} />}
                >
                  Verify OTP &amp; Reset Password
                </Button>
              </form>
            </div>
          )}

          {/* ─── STEP 3: SUCCESS CONFIRMATION ─────────────────────────────────── */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Your password has been successfully updated. Redirecting you to sign in with your new credentials...
              </p>

              <Button
                onClick={() => navigate('/login', { state: { email, resetSuccess: true } })}
                fullWidth
                size="lg"
              >
                Proceed to Sign In Now
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your credentials?{' '}
            <Link to="/login" state={{ email }} className="text-emerald-600 font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
