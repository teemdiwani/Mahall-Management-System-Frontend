import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Lock,
  Eye,
  EyeOff,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  Volume2,
  VolumeX,
  Shield,
  Building,
  Check,
  Sparkles,
  Info,
  Calendar,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme, type ThemeMode } from '../../../context/ThemeContext';
import { usePushNotifications } from '../../../context/PushNotificationContext';
import { authApi } from '../../../api/authApi';
import { PageHeader } from '../../../components/ui/EmptyState';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const {
    permission,
    isSupported,
    requestPermission,
    sendTestNotification,
    preferences,
    updatePreferences,
  } = usePushNotifications();

  // Tab State
  const [activeSection, setActiveSection] = useState<'appearance' | 'security' | 'notifications' | 'mahall'>('appearance');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Push Test State
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);

  // Password validation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match. Please verify and try again.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await authApi.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setPwdSuccess(res?.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      setTestPushStatus('Push notifications enabled successfully! Test notification sent.');
    } else {
      setTestPushStatus('Notification permission was not granted. Please check browser settings.');
    }
    setTimeout(() => setTestPushStatus(null), 5000);
  };

  const handleSendTestPush = async () => {
    setTestPushLoading(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        setTestPushStatus('Test notification sent! Check your desktop/phone screen.');
      } else {
        setTestPushStatus('Failed to send push notification. Please check your browser permissions.');
      }
    } catch {
      setTestPushStatus('Error dispatching test notification.');
    } finally {
      setTestPushLoading(false);
      setTimeout(() => setTestPushStatus(null), 5000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage appearance, security, push notifications, and mahall preferences"
        breadcrumb={[{ label: 'Dashboard', href: '/app/dashboard' }, { label: 'Settings' }]}
      />

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        <button
          onClick={() => setActiveSection('appearance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeSection === 'appearance'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
          Appearance & Dark Mode
        </button>
        <button
          onClick={() => setActiveSection('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeSection === 'security'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Lock size={16} />
          Password & Security
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeSection === 'notifications'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Bell size={16} />
          Browser Push Notifications
          {permission === 'granted' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
        </button>
        <button
          onClick={() => setActiveSection('mahall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer ${
            activeSection === 'mahall'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Building size={16} />
          Mahall Profile
        </button>
      </div>

      {/* 1. APPEARANCE & DARK MODE */}
      {activeSection === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card padding="lg">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={20} className="text-emerald-500" />
                  Theme Preference
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose how Noorul Huda Mahall Odamala looks to you. Seamlessly switch between light, dark, or system preference.
                </p>
              </div>
              <Badge variant={isDark ? 'purple' : 'amber'}>
                {isDark ? '🌙 Dark Active' : '☀️ Light Active'}
              </Badge>
            </div>

            {/* Theme Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                  theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun size={20} />
                  </div>
                  {theme === 'light' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Light Mode</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Clean crisp layout with high contrast daylight clarity.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="w-3 h-3 rounded-full bg-white border border-gray-300" />
                  <span className="w-3 h-3 rounded-full bg-gray-100" />
                </div>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                  theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Moon size={20} />
                  </div>
                  {theme === 'dark' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Deep OLED dark theme designed for comfortable night viewing and reduced glare.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700" />
                  <span className="w-3 h-3 rounded-full bg-gray-800" />
                </div>
              </button>

              {/* System Preference */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                  theme === 'system'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                    <Laptop size={20} />
                  </div>
                  {theme === 'system' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">System Sync</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Automatically adapts theme based on your computer or mobile operating system settings.
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="w-3 h-3 rounded-full bg-gray-400" />
                </div>
              </button>
            </div>
          </Card>

          {/* Preview Card */}
          <Card padding="md" className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                NH
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Noorul Huda Mahall Odamala — Live Styling Preview
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Current theme is {isDark ? 'Dark Mode' : 'Light Mode'}. All dashboard cards, rosters, and tables adapt instantly.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 2. SECURITY & PASSWORD CHANGING */}
      {activeSection === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card padding="lg">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield size={20} className="text-emerald-500" />
                Change Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Protect your Mahall account by updating your password regularly.
              </p>
            </div>

            {pwdSuccess && (
              <div className="p-4 mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="p-4 mb-5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center gap-2.5">
                <AlertTriangle size={18} className="text-red-600 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
              {/* Current Password */}
              <div>
                <Input
                  label="Current Password"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  helper="If you registered with Google OAuth, you can leave this blank to set a password."
                />
              </div>

              {/* New Password */}
              <div>
                <Input
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  icon={<Lock size={16} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <Input
                  label="Confirm New Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  icon={<Lock size={16} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={
                    confirmPassword && newPassword !== confirmPassword
                      ? 'Passwords do not match'
                      : undefined
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={pwdLoading}
                  disabled={!newPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 3. BROWSER PUSH NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell size={20} className="text-emerald-500" />
                  Browser Push Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receive live alerts directly in your browser when new announcements or events are published.
                </p>
              </div>

              {/* Permission Badge */}
              <div>
                {permission === 'granted' ? (
                  <Badge variant="emerald" size="md">
                    <CheckCircle2 size={14} className="mr-1" />
                    Allowed & Active
                  </Badge>
                ) : permission === 'denied' ? (
                  <Badge variant="red" size="md">
                    <AlertTriangle size={14} className="mr-1" />
                    Blocked by Browser
                  </Badge>
                ) : (
                  <Badge variant="amber" size="md">
                    <Info size={14} className="mr-1" />
                    Not Yet Configured
                  </Badge>
                )}
              </div>
            </div>

            {/* Status Alert & Setup Action */}
            {testPushStatus && (
              <div className="p-4 mb-5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2.5">
                <Info size={18} className="text-blue-600 shrink-0" />
                <span>{testPushStatus}</span>
              </div>
            )}

            {!isSupported ? (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                Web Push notifications are not supported in this browser environment. Please use Chrome, Edge, Firefox, or Safari.
              </div>
            ) : permission === 'denied' ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} /> Notifications are blocked in your browser settings.
                </p>
                <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
                  To turn them back on: Click the lock / tune icon on the left side of your browser address bar (URL bar), set <strong>Notifications</strong> to <strong>Allow</strong>, and refresh this page.
                </p>
              </div>
            ) : permission !== 'granted' ? (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    Turn On Browser Push Notifications
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Never miss emergency janazah alerts, Friday khutbah updates, or community events.
                  </p>
                </div>
                <Button onClick={handleEnablePush} icon={<Bell size={16} />}>
                  Allow Push Notifications
                </Button>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Push notifications are active for Noorul Huda Mahall Odamala.
                  </p>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                    You will receive instant desktop & mobile alerts even if your browser tab is minimized.
                  </p>
                </div>
                <Button
                  onClick={handleSendTestPush}
                  loading={testPushLoading}
                  variant="outline"
                  icon={<Send size={15} />}
                  className="shrink-0"
                >
                  Send Test Notification
                </Button>
              </div>
            )}

            {/* Notification Channels / Subscriptions */}
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Notification Channels & Preferences
              </h4>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Announcements */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Megaphone size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Announcements & Circulars
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Urgent mahall notices, janazah alerts, and administrative statements.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.announcements}
                    onChange={(e) => updatePreferences({ announcements: e.target.checked })}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Events */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Events & Programs
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Community gatherings, Milad, Ramadan camps, and youth programs.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.events}
                    onChange={(e) => updatePreferences({ events: e.target.checked })}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Dues & Payments */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Monthly Dues & Invoices
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Subscription due dates, official invoice generation, and receipt reminders.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.payments}
                    onChange={(e) => updatePreferences({ payments: e.target.checked })}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Sound Chime */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                      {preferences.sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Audio Alert Chime
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Play a gentle chime when a new notice or event alert arrives.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={(e) => updatePreferences({ sound: e.target.checked })}
                    className="w-5 h-5 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. MAHALL PROFILE */}
      {activeSection === 'mahall' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card padding="lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                NH
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Noorul Huda Mahall Odamala
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Digital Mahall Management & Census Portal · Registered Community Body
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="emerald">Reg: NHM-ODM-1975</Badge>
                  <Badge variant="blue">Odamala Ward, Kerala</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-medium">Central Mosque</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  Noorul Huda Central Juma Masjid, Odamala
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Daily 5 prayers, Friday Juma’h, Janazah services & Ramadan Iftar
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-medium">Islamic Education</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  Noorul Huda Islamic Madrasa (Std 1–10)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quran recitation, Tajweed, Fiqh, Islamic history & moral education
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-medium">Your Role & Access</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1 uppercase">
                  {user?.role || 'Member'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Signed in as {user?.email}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-medium">Contact & Support</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-1">
                  Mahall Directorate Office
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Odamala, Kerala · teemdiwani@gmail.com
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
