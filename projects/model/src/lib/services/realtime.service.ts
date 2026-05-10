import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class RealtimeService {
  /** Emits the bill_id of the bill that changed. */
  abstract billsChanges$: Observable<number>;
  /** Emits the payment_id of the payment that changed. */
  abstract paymentsChanges$: Observable<number>;
}
