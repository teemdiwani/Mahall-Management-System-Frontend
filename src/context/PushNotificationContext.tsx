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

interface PushNotificationContextValue {
  isSupported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  unreadCount: number;
  notifications: any[];
  refreshNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null);

const STORAGE_KEY = 'mahall_notified_keys_v1';

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(getPushPermission());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const isFirstRun = useRef(true);

  // Initialize Service Worker and permissions
  useEffect(() => {
    if (isPushSupported()) {
      registerServiceWorker();
      setPermission(getPushPermission());
    }
  }, []);

  const getNotifiedKeys = (): Set<string> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  };

  const recordNotifiedKey = (key: string) => {
    try {
      const keys = getNotifiedKeys();
      keys.add(key);
      // Keep at most 200 keys
      const arr = Array.from(keys).slice(-200);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch {
      // ignore
    }
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
              title: n.title || 'Al-Noor Mahall Notification',
              body: n.message || 'You have an important update.',
              url: n.link || '/app/dashboard',
              tag: `notif-${n._id}`,
            });
          }
        }
      }
    } catch {
      // offline / not authenticated
    }
  }, [user, permission]);

  // Check new announcements, events, and dues
  const checkForBroadcastUpdates = useCallback(async () => {
    if (!user || permission !== 'granted') return;

    const notifiedKeys = getNotifiedKeys();

    try {
      // 1. Check Announcements
      const annRes = await announcementsApi.list().catch(() => ({ data: [] }));
      const announcements: any[] = annRes?.data || [];

      for (const ann of announcements.slice(0, 5)) {
        const key = `ann-${ann._id || ann.id}`;
        if (!notifiedKeys.has(key)) {
          recordNotifiedKey(key);
          if (!isFirstRun.current) {
            await showBrowserPushNotification({
              title: `📢 Announcement: ${ann.title}`,
              body: ann.content ? ann.content.slice(0, 120) + '...' : 'New community notice published.',
              url: '/app/announcements',
              tag: key,
            });
          }
        }
      }

      // 2. Check Upcoming Events
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
              body: `${evDate} • ${ev.description ? ev.description.slice(0, 90) : 'Al-Noor Mahall community event'}`,
              url: '/app/events',
              tag: key,
            });
          }
        }
      }

      // 3. Check Payments & Pending Dues
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
            });
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
  }, [user, permission]);

  // Periodic polling
  useEffect(() => {
    if (!user) return;

    refreshNotifications();
    checkForBroadcastUpdates();

    const interval = setInterval(() => {
      refreshNotifications();
      checkForBroadcastUpdates();
    }, 25000); // Check every 25 seconds

    return () => clearInterval(interval);
  }, [user, refreshNotifications, checkForBroadcastUpdates]);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestPushPermission();
    setPermission(getPushPermission());
    if (granted) {
      await showBrowserPushNotification({
        title: '🔔 Push Notifications Enabled',
        body: 'Al-Noor Mahall will now notify you of new announcements, events, and dues directly in your browser!',
        url: '/app/dashboard',
        tag: 'welcome-push',
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
      title: '📢 MahallConnect Test Notification',
      body: 'Browser push notifications are active! You will be notified whenever new announcements, events, or dues arrive.',
      url: '/app/announcements',
      tag: `test-${Date.now()}`,
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
        requestPermission,
        sendTestNotification,
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
