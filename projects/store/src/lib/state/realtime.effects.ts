import { inject } from '@angular/core';
import { RealtimeService } from '@bills/model';
import { createEffect } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { BillsActions } from './bill/bill.actions';
import { PaymentsActions } from './payment';

export const RealtimeEffects = {
  billsChanges$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.billsChanges$.pipe(
      map(() => BillsActions.loadOverviewBills())
    );
  }, { functional: true }),

  paymentsChanges$: createEffect(() => {
    const realtimeService = inject(RealtimeService);
    return realtimeService.paymentsChanges$.pipe(
      map(() => PaymentsActions.loadAllPayments())
    );
  }, { functional: true }),
};
