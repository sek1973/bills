import { inject } from '@angular/core';
import { AppState, BillsActions, BillsSelectors, PaymentsActions } from '@bills/store';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { RealtimeServiceImpl } from './realtime.service';

export const RealtimeEffects = {
  billsChanges$: createEffect(() => {
    const realtimeService = inject(RealtimeServiceImpl);
    return realtimeService.billsChanges$.pipe(
      map(() => BillsActions.loadOverviewBills())
    );
  }, { functional: true }),

  paymentsChanges$: createEffect(() => {
    const realtimeService = inject(RealtimeServiceImpl);
    const store = inject(Store<AppState>);
    return realtimeService.paymentsChanges$.pipe(
      withLatestFrom(store.select(BillsSelectors.selectBill)),
      filter(([changedBillId, currentBill]) => currentBill != null && changedBillId === currentBill.id),
      map(([, currentBill]) => PaymentsActions.loadPayments({ billId: currentBill!.id }))
    );
  }, { functional: true }),
};
