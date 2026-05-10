import { inject } from '@angular/core';
import { RealtimeService } from '@bills/model';
import { createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { AppState } from './app/app.state';
import { BillsActions } from './bill/bill.actions';
import { BillsSelectors } from './bill/bill.selectors';
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
    const store = inject(Store<AppState>);
    return realtimeService.paymentsChanges$.pipe(
      withLatestFrom(store.select(BillsSelectors.selectBill)),
      filter(([changedBillId, currentBill]) => currentBill != null && changedBillId === currentBill.id),
      map(([, currentBill]) => PaymentsActions.loadPayments({ billId: currentBill!.id }))
    );
  }, { functional: true }),
};
