import { inject, Injectable, signal } from '@angular/core';
import { PushNotificationService } from '@bills/model';
import { environment } from '../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationServiceImpl extends PushNotificationService {
  private readonly supabase = inject(SupabaseService);

  readonly isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  readonly permission = signal<NotificationPermission>('default');
  readonly isSubscribed = signal(false);

  private swRegistration: ServiceWorkerRegistration | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    super();
    if (this.isSupported) {
      this.initPromise = this.init();
    }
  }

  private async init(): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      this.permission.set(Notification.permission);

      if (Notification.permission === 'granted') {
        const sub = await this.swRegistration.pushManager.getSubscription();
        this.isSubscribed.set(sub !== null);
      }
    } catch (e) {
      console.error('[PushNotification] Service worker registration failed', e);
    }
  }

  async subscribe(): Promise<void> {
    if (this.initPromise) await this.initPromise;
    if (!this.swRegistration) return;

    const userId = this.supabase.user()?.id;
    if (!userId) return;

    const permission = await Notification.requestPermission();
    this.permission.set(permission);
    if (permission !== 'granted') return;

    const existing = await this.swRegistration.pushManager.getSubscription();
    if (existing) {
      this.isSubscribed.set(true);
      return;
    }

    const sub = await this.swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(environment.vapidPublicKey),
    });

    const json = sub.toJSON();
    const { error } = await this.supabase.client.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: json.keys?.['p256dh'] ?? '',
        auth: json.keys?.['auth'] ?? '',
      },
      { onConflict: 'user_id,endpoint' },
    );

    if (error) {
      console.error('[PushNotification] Failed to save subscription', error);
      await sub.unsubscribe();
      return;
    }

    this.isSubscribed.set(true);
  }

  async unsubscribe(): Promise<void> {
    if (!this.swRegistration) return;

    const sub = await this.swRegistration.pushManager.getSubscription();
    if (!sub) {
      this.isSubscribed.set(false);
      return;
    }

    await this.supabase.client
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', sub.endpoint);

    await sub.unsubscribe();
    this.isSubscribed.set(false);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
  }
}
