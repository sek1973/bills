import { Injectable, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export abstract class PushNotificationService {
  abstract readonly isSupported: boolean;
  abstract readonly permission: Signal<NotificationPermission>;
  abstract readonly isSubscribed: Signal<boolean>;

  abstract subscribe(): Promise<void>;
  abstract unsubscribe(): Promise<void>;
}
