/**
 * Browser Push Notification Utility for MahallConnect
 * Handles permission requests, service worker registration, audio chimes,
 * and dispatching native browser push notifications for announcements, events, and payments.
 */

// Play a gentle audio chime when a notification fires
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked by browser autoplay policy
  }
};

export const isPushSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getPushPermission = (): NotificationPermission => {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
};

// Register Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
};

// Request Browser Push Notification Permission
export const requestPushPermission = async (): Promise<boolean> => {
  if (!isPushSupported()) return false;

  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await registerServiceWorker();
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
}

// Dispatch a native browser push notification
export const showBrowserPushNotification = async ({
  title,
  body,
  icon = '/favicon.svg',
  url = '/app/dashboard',
  tag,
}: PushNotificationPayload): Promise<boolean> => {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  // Play gentle notification sound
  playNotificationChime();

  // Try via ServiceWorker registration first (handles background/mobile OS better)
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [150, 50, 150],
          data: { url },
          tag: tag || `mahall-${Date.now()}`,
        } as any);
        return true;
      }
    }
  } catch {
    // fallback to new window.Notification
  }

  // Fallback to standard window.Notification API
  try {
    const notif = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || `mahall-${Date.now()}`,
      data: { url },
    });

    notif.onclick = () => {
      window.focus();
      if (url) {
        window.location.href = url;
      }
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('Direct notification failed:', err);
    return false;
  }
};
