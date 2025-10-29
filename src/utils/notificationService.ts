/**
 * Push Notification Service - Phase 4d
 * Frontend client for push notifications
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb`;

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// Request notification permission
// IMPORTANT: Must be called IMMEDIATELY in response to user gesture for iOS
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied');
    return false;
  }

  try {
    console.log('🔔 Requesting notification permission (iOS requires immediate call)...');
    
    // iOS CRITICAL: Call requestPermission() synchronously, no await before it
    const permission = await Notification.requestPermission();
    
    console.log('🔔 Permission result:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// iOS-specific: Request permission with immediate synchronous call
export async function requestNotificationPermissionIOS(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  // For iOS, we need to call requestPermission() IMMEDIATELY
  // Any async operation before this call will break the user gesture chain
  try {
    console.log('📱 iOS: Requesting permission IMMEDIATELY...');
    
    // Synchronous call - don't check anything before this!
    const permission = await Notification.requestPermission();
    
    console.log('📱 iOS Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ iOS permission granted!');
      return true;
    } else if (permission === 'denied') {
      console.log('❌ iOS permission denied - user must enable in Settings');
      return false;
    } else {
      console.log('⚠️ iOS permission dismissed');
      return false;
    }
  } catch (error) {
    console.error('❌ iOS permission request failed:', error);
    return false;
  }
}

/**
 * Show a native notification banner (iOS/Android/Desktop)
 * Works like iMessage notifications
 */
export function showNativeNotificationBanner(
  title: string,
  body: string,
  options?: {
    icon?: string;
    image?: string;
    tag?: string;
    data?: any;
    onClick?: () => void;
  }
): void {
  // Check if native notifications are supported
  if (!('Notification' in window)) {
    console.log('Native notifications not supported');
    return;
  }

  // Check permission
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  // Don't show if app is focused (user is already looking)
  if (document.hasFocus()) {
    console.log('App is focused, skipping native notification');
    return;
  }

  try {
    const notifOptions: NotificationOptions = {
      body,
      icon: options?.icon || '/apple-touch-icon.png',
      badge: '/apple-touch-icon-120.png',
      tag: options?.tag || `notif_${Date.now()}`,
      requireInteraction: false, // Auto-dismiss
      silent: false, // Play system sound
      vibrate: [50, 100, 50],
      data: options?.data,
    };

    // Add image if provided (shows in notification body)
    if (options?.image) {
      notifOptions.image = options.image;
    }

    const notification = new Notification(title, notifOptions);

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (options?.onClick) {
        options.onClick();
      }
      
      notification.close();
    };

    // Auto-close after 5 seconds (like iOS)
    setTimeout(() => {
      notification.close();
    }, 5000);

  } catch (error) {
    console.error('Error showing native notification:', error);
  }
}

// Get VAPID public key from server
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/notifications/vapid-public-key`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.needsSetup) {
        console.log('Push notifications not configured on server');
        return null;
      }
      throw new Error('Failed to get VAPID key');
    }

    const data = await response.json();
    return data.publicKey;
  } catch (error) {
    console.error('Error getting VAPID key:', error);
    return null;
  }
}

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(userId: string): Promise<boolean> {
  try {
    console.log('📡 [SUBSCRIBE] Starting subscription process for userId:', userId);
    
    if (!isNotificationSupported()) {
      console.warn('📡 [SUBSCRIBE] Push notifications not supported');
      return false;
    }

    // Request permission first
    console.log('📡 [SUBSCRIBE] Checking permission...');
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('📡 [SUBSCRIBE] Notification permission not granted');
      return false;
    }
    console.log('📡 [SUBSCRIBE] ✅ Permission granted');

    // Get VAPID public key
    console.log('📡 [SUBSCRIBE] Getting VAPID key...');
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      console.error('📡 [SUBSCRIBE] ❌ VAPID key not available');
      return false;
    }
    console.log('📡 [SUBSCRIBE] ✅ Got VAPID key:', vapidPublicKey.substring(0, 20) + '...');

    // Check if service worker is available
    console.log('📡 [SUBSCRIBE] Checking for service worker...');
    
    // First try to get existing registration
    const existingReg = await navigator.serviceWorker.getRegistration();
    if (!existingReg) {
      console.log('ℹ️ [SUBSCRIBE] Service worker not registered');
      console.log('ℹ️ [SUBSCRIBE] This is expected in Figma Make preview environment');
      console.log('ℹ️ [SUBSCRIBE] Push notifications will work when deployed to production');
      console.log('ℹ️ [SUBSCRIBE] Using in-app notifications instead');
      return false;
    }
    
    console.log('📡 [SUBSCRIBE] Found existing service worker registration');
    
    // Wait for it to be ready with timeout
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((_, reject) => 
        setTimeout(() => reject(new Error('Service worker timeout after 5 seconds')), 5000)
      )
    ]).catch(() => {
      console.log('ℹ️ [SUBSCRIBE] Service worker not ready yet');
      console.log('ℹ️ [SUBSCRIBE] Using in-app notifications instead');
      return null;
    });
    
    if (!registration) {
      return false;
    }
    
    console.log('📡 [SUBSCRIBE] ✅ Service worker ready:', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
    });

    // Subscribe to push notifications
    console.log('📡 [SUBSCRIBE] Creating push subscription...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log('📡 [SUBSCRIBE] ✅ Push subscription created:', subscription.endpoint);

    // Send subscription to server
    console.log('📡 [SUBSCRIBE] Sending subscription to server...');
    const response = await fetch(`${API_BASE}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('📡 [SUBSCRIBE] ❌ Server returned error:', response.status, errorData);
      throw new Error(`Failed to save subscription: ${response.status} ${errorData}`);
    }

    const result = await response.json();
    console.log('📡 [SUBSCRIBE] ✅ Server response:', result);
    console.log('📡 [SUBSCRIBE] ✅ Successfully subscribed to push notifications');
    return true;
  } catch (error) {
    console.error('📡 [SUBSCRIBE] ❌ Error subscribing to push notifications:', error);
    console.error('📡 [SUBSCRIBE] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(userId: string): Promise<boolean> {
  try {
    if (!isNotificationSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No active subscription found');
      return true;
    }

    // Unsubscribe from push
    await subscription.unsubscribe();

    // Remove from server
    const response = await fetch(`${API_BASE}/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        endpoint: subscription.endpoint,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to remove subscription from server');
    }

    console.log('✅ Successfully unsubscribed from push notifications');
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Check if user is subscribed
export async function isPushSubscribed(): Promise<boolean> {
  try {
    if (!isNotificationSupported()) {
      return false;
    }

    // First check if service worker exists
    const existingReg = await navigator.serviceWorker.getRegistration();
    if (!existingReg) {
      console.log('ℹ️ [IS_SUBSCRIBED] Service worker not registered');
      return false;
    }

    // Wait for it to be ready with timeout
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration>((_, reject) => 
        setTimeout(() => reject(new Error('Service worker timeout after 3 seconds')), 3000)
      )
    ]).catch(() => {
      console.log('ℹ️ [IS_SUBSCRIBED] Service worker not ready yet');
      return null;
    });
    
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();

    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

// Notification preferences
export interface NotificationPreferences {
  userId: string;
  newMemories: boolean;
  dailyPrompts: boolean;
  responses: boolean;
  milestones: boolean;
  partnerActivity: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

// Get notification preferences
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const response = await fetch(`${API_BASE}/notifications/preferences/${userId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get preferences');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

// Update notification preferences
export async function updateNotificationPreferences(
  preferences: NotificationPreferences
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update preferences');
    }

    console.log('✅ Notification preferences updated');
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

// Send test notification
export async function sendTestNotification(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to send test notification');
    }

    console.log('✅ Test notification sent');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

// Show local notification (fallback for when push is unavailable)
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Helper: Trigger iMessage-style notification on new memory
export async function notifyNewMemory(params: {
  userId: string;
  senderName: string;
  memoryType: 'photo' | 'video' | 'voice' | 'text' | 'document';
  memoryId: string;
  previewText?: string;
  mediaUrl?: string;
}): Promise<boolean> {
  try {
    console.log('📱 notifyNewMemory called:', {
      url: `${API_BASE}/notifications/new-memory`,
      params,
    });

    const response = await fetch(`${API_BASE}/notifications/new-memory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    console.log('📱 Notification API response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const responseData = await response.json();
    console.log('📱 Notification API response data:', responseData);

    if (!response.ok) {
      console.error('❌ Failed to send new memory notification:', responseData);
      return false;
    }

    console.log('✅ New memory notification sent successfully:', responseData);
    return true;
  } catch (error) {
    console.error('❌ Error sending new memory notification:', error);
    console.error('   Error type:', error?.constructor?.name);
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Helper: Trigger Duolingo-style daily prompt notification
export async function notifyDailyPrompt(params: {
  userId: string;
  promptText: string;
  scheduledTime?: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/notifications/schedule-daily-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error('Failed to send daily prompt notification');
      return false;
    }

    console.log('✅ Daily prompt notification scheduled');
    return true;
  } catch (error) {
    console.error('Error scheduling daily prompt:', error);
    return false;
  }
}

// Helper: Trigger milestone/celebration notification
export async function notifyMilestone(params: {
  userId: string;
  milestoneType: 'streak' | 'memories' | 'anniversary';
  count?: number;
  message: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/notifications/milestone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error('Failed to send milestone notification');
      return false;
    }

    console.log('✅ Milestone notification sent');
    return true;
  } catch (error) {
    console.error('Error sending milestone notification:', error);
    return false;
  }
}

// Update app badge count (iOS support)
export async function updateBadgeCount(count: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
        console.log(`✅ Badge count set to ${count}`);
      } else {
        await (navigator as any).clearAppBadge();
        console.log('✅ Badge cleared');
      }
    } catch (error) {
      console.log('Badge API not supported:', error);
    }
  }
}

// Clear app badge (iOS support)
export async function clearBadge(): Promise<void> {
  if ('clearAppBadge' in navigator) {
    try {
      await (navigator as any).clearAppBadge();
      console.log('✅ Badge cleared');
    } catch (error) {
      console.log('Badge API not supported:', error);
    }
  }
}
