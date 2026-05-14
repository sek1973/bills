import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OverviewBill, Payment } from '../model';

@Injectable({ providedIn: 'root' })
export abstract class OfflineCacheService {
  abstract getBills(): Observable<OverviewBill[]>;
  abstract saveBills(bills: OverviewBill[]): Observable<void>;
  abstract getPayments(): Observable<Payment[]>;
  abstract savePayments(payments: Payment[]): Observable<void>;
}
