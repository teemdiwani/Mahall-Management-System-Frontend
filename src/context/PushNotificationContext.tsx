import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  isPushSupported,
  getPushPermission,
  requestPushPermission,
  showBrowserPushNotification,
  registerServiceWorker,
} from '../utils/pushNotifications';
import { notificationsApi, announcementsApi, eventsApi, paymentsApi } from '../api/domainApis';
import { useAuth } from './AuthContext';

export interface NotificationPreferences {
  announcements: boolean;
  events: boolean;
  payments: boolean;
  sound: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  announcements: true,
  events: true,
  payments: true,
  sound: true,
};

interface PushNotificationContextValue {
  isSupported: boolean;
  permission: NotificationPermission;
  preferences: NotificationPreferences;
  updatePreferences: (newPrefs: Partial<NotificationPreferences>) => void;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  notifyAnnouncement: (ann: { title: string; content?: string; id?: string }) => Promise<boolean>;
  notifyEvent: (ev: { title: string; description?: string; startDate?: string; location?: string; id?: string }) => Promise<boolean>;
  unreadCount: number;
  notifications: any[];
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null);

const STORAGE_KEYS_NOTIFIED = 'mahall_notified_keys_v1';
const STORAGE_PREFS_KEY = 'mahall_notif_prefs_v1';

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(getPushPermission());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const isFirstRun = useRef(true);

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Initialize Service Worker and permissions
  useEffect(() => {
    if (isPushSupported()) {
      registerServiceWorker();
      setPermission(getPushPermission());
    }
  }, []);

  const getNotifiedKeys = (): Set<string> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS_NOTIFIED);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  };

  const recordNotifiedKey = (key: string) => {
    try {
      const keys = getNotifiedKeys();
      keys.add(key);
      const arr = Array.from(keys).slice(-200);
      localStorage.setItem(STORAGE_KEYS_NOTIFIED, JSON.stringify(arr));
    } catch {
      // ignore
    }
  };

  // Immediate notification trigger for announcements
  const notifyAnnouncement = async (ann: { title: string; content?: string; id?: string }): Promise<boolean> => {
    if (!preferences.announcements) return false;
    const key = `ann-${ann.id || Date.now()}`;
    recordNotifiedKey(key);
    return await showBrowserPushNotification({
      title: `📢 Announcement: ${ann.title}`,
      body: ann.content ? ann.content.slice(0, 120) + '...' : 'Noorul Huda Mahall Odamala published a new notice.',
      url: '/app/announcements',
      tag: key,
      playSound: preferences.sound,
    });
  };

  // Immediate notification trigger for events
  const notifyEvent = async (ev: { title: string; description?: string; startDate?: string; location?: string; id?: string }): Promise<boolean> => {
    if (!preferences.events) return false;
    const key = `ev-${ev.id || Date.now()}`;
    recordNotifiedKey(key);
    const dateStr = ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Upcoming';
    return await showBrowserPushNotification({
      title: `🗓️ New Event: ${ev.title}`,
      body: `${dateStr} • ${ev.location || 'Odamala Masjid'} • ${ev.description ? ev.description.slice(0, 80) : 'Community event'}`,
      url: '/app/events',
      tag: key,
      playSound: preferences.sound,
    });
  };

  // Fetch in-app notifications
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getMy();
      const notifs = res.data?.notifications || [];
      const unread = res.data?.unreadCount || notifs.filter((n: any) => !n.read).length;
      setNotifications(notifs);
      setUnreadCount(unread);

      // Check if any unread notification should be dispatched as browser push
      if (permission === 'granted' && !isFirstRun.current) {
        const notifiedKeys = getNotifiedKeys();
        for (const n of notifs) {
          const key = `notif-${n._id}`;
          if (!n.read && !notifiedKeys.has(key)) {
            recordNotifiedKey(key);
            await showBrowserPushNotification({
              title: n.title || 'Noorul Huda Mahall Odamala Alert',
              body: n.message || 'You have an important community notification.',
              url: n.link || '/app/dashboard',
              tag: `notif-${n._id}`,
              playSound: preferences.sound,
            });
          }
        }
      }
    } catch {
      // offline / not authenticated
    }
  }, [user, permission, preferences.sound]);

  // Check new announcements, events, and dues
  const checkForBroadcastUpdates = useCallback(async () => {
    if (!user || permission !== 'granted') return;

    const notifiedKeys = getNotifiedKeys();

    try {
      // 1. Check Announcements
      if (preferences.announcements) {
        const annRes = await announcementsApi.list().catch(() => ({ data: [] }));
        const announcements: any[] = annRes?.data || [];

        for (const ann of announcements.slice(0, 5)) {
          const key = `ann-${ann._id || ann.id}`;
          if (!notifiedKeys.has(key)) {
            recordNotifiedKey(key);
            if (!isFirstRun.current) {
              await showBrowserPushNotification({
                title: `📢 Announcement: ${ann.title}`,
                body: ann.content ? ann.content.slice(0, 120) + '...' : 'New community notice from Noorul Huda Mahall Odamala.',
                url: '/app/announcements',
                tag: key,
                playSound: preferences.sound,
              });
            }
          }
        }
      }

      // 2. Check Upcoming Events
      if (preferences.events) {
        const eventsRes = await eventsApi.list({ upcomingOnly: true }).catch(() => ({ data: [] }));
        const events: any[] = eventsRes?.data || [];

        for (const ev of events.slice(0, 5)) {
          const key = `ev-${ev._id || ev.id}`;
          if (!notifiedKeys.has(key)) {
            recordNotifiedKey(key);
            if (!isFirstRun.current) {
              const evDate = ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Upcoming';
              await showBrowserPushNotification({
                title: `🗓️ New Event: ${ev.title}`,
                body: `${evDate} • ${ev.description ? ev.description.slice(0, 90) : 'Noorul Huda Mahall Odamala event'}`,
                url: '/app/events',
                tag: key,
                playSound: preferences.sound,
              });
            }
          }
        }
      }

      // 3. Check Payments & Pending Dues
      if (preferences.payments) {
        const paymentsRes = await paymentsApi.getMyPayments().catch(() => ({ data: [] }));
        const payments: any[] = paymentsRes?.data || [];
        const pendingPayments = payments.filter((p) => p.status === 'PENDING');

        for (const pay of pendingPayments) {
          const key = `pay-due-${pay._id || pay.id}`;
          if (!notifiedKeys.has(key)) {
            recordNotifiedKey(key);
            if (!isFirstRun.current) {
              await showBrowserPushNotification({
                title: `💳 Monthly Dues Alert: ₹${pay.amount}`,
                body: `Dues for ${pay.month || pay.type} are scheduled. Click to clear or view invoice.`,
                url: '/app/my-payments',
                tag: key,
                playSound: preferences.sound,
              });
            }
          }
        }
      }
    } catch {
      // ignore
    } finally {
      if (isFirstRun.current) {
        isFirstRun.current = false;
      }
    }
  }, [user, permission, preferences]);

  // Periodic polling
  useEffect(() => {
    if (!user) return;

    refreshNotifications();
    checkForBroadcastUpdates();

    const interval = setInterval(() => {
      refreshNotifications();
      checkForBroadcastUpdates();
    }, 20000); // Check every 20 seconds for fast updates

    return () => clearInterval(interval);
  }, [user, refreshNotifications, checkForBroadcastUpdates]);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestPushPermission();
    setPermission(getPushPermission());
    if (granted) {
      await showBrowserPushNotification({
        title: '🔔 Push Notifications Enabled',
        body: 'Noorul Huda Mahall Odamala will now notify you of new announcements, events, and dues directly in your browser!',
        url: '/app/dashboard',
        tag: 'welcome-push',
        playSound: preferences.sound,
      });
      await checkForBroadcastUpdates();
    }
    return granted;
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    return await showBrowserPushNotification({
      title: '📢 Noorul Huda Mahall Odamala Alert',
      body: 'Browser push notifications are active! You will be notified instantly when new announcements or events are published.',
      url: '/app/announcements',
      tag: `test-${Date.now()}`,
      playSound: preferences.sound,
    });
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  return (
    <PushNotificationContext.Provider
      value={{
        isSupported: isPushSupported(),
        permission,
        preferences,
        updatePreferences,
        requestPermission,
        sendTestNotification,
        notifyAnnouncement,
        notifyEvent,
        unreadCount,
        notifications,
        refreshNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = () => {
  const ctx = useContext(PushNotificationContext);
  if (!ctx) {
    throw new Error('usePushNotifications must be used within PushNotificationProvider');
  }
  return ctx;
};

export const usePushNotification = usePushNotifications;
