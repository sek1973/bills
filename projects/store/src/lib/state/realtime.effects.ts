import { inject } from '@angular/core';
import { RealtimeService } from '@bills/model';
import { createEffect } from '@ngrx/effects';
import { filter, map } from 'rxjs/operators';
import { BillApiActions } from './bill/bill-api.actions';
import { PaymentApiActions } from './payment';

export const RealtimeEffects = {
  /** Bills DELETE: mirror directly in the store — no network call. */
  billsDelete$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.billsChanges$.pipe(
      filter(e => e.type === 'DELETE'),
      map(e => BillApiActions.removeBill({ billId: e.billId }))
    );
  }, { functional: true }),

  /** Bills INSERT/UPDATE: map payload to Bill, recompute dueDate/sum from store payments — no network call. */
  billsUpsert$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.billsChanges$.pipe(
      filter(e => e.type !== 'DELETE' && e.bill != null),
      map(e => BillApiActions.upsertBill({ bill: e.bill! }))
    );
  }, { functional: true }),

  /** Payments INSERT/UPDATE: patch the store directly and recompute bill overview client-side. */
  paymentsUpsert$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.paymentsChanges$.pipe(
      filter(e => e.type !== 'DELETE' && e.payment != null),
      map(e => PaymentApiActions.upsertPayment({ payment: e.payment! }))
    );
  }, { functional: true }),

  /** Payments DELETE: remove from store and recompute bill overview client-side. */
  paymentsRemove$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.paymentsChanges$.pipe(
      filter(e => e.type === 'DELETE'),
      map(e => PaymentApiActions.removePayment({ paymentId: e.paymentId, billId: e.billId }))
    );
  }, { functional: true }),
};
