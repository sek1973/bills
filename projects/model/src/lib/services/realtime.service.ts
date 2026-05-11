import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Bill } from '../model/bill';
import { Payment } from '../model/payment';

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeBillEvent {
  type: RealtimeEventType;
  billId: number;
  /** Full bill object — present for INSERT and UPDATE events. */
  bill?: Bill;
}

export interface RealtimePaymentEvent {
  type: RealtimeEventType;
  paymentId: number;
  billId: number;
  /** Full payment object — present for INSERT and UPDATE events. */
  payment?: Payment;
}

@Injectable({ providedIn: 'root' })
export abstract class RealtimeService {
  abstract billsChanges$: Observable<RealtimeBillEvent>;
  abstract paymentsChanges$: Observable<RealtimePaymentEvent>;
}
