import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { mergeMap } from 'rxjs';
import { BillsActions } from './bill/bill.actions';
import { PaymentsActions } from './payment';

@Injectable()
export class AppInitEffects {

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      mergeMap(() => [BillsActions.loadOverviewBills(), PaymentsActions.loadAllPayments()])
    ), { functional: true }
  );

  constructor(private actions$: Actions) { }
}
