import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { BillsService } from 'src/app/services/bills.service';
import { BillApiActions, BillDetailsActions } from '.';

@Injectable()
export class BillEffects {

  constructor(private actions$: Actions, private billsService: BillsService) { }

  loadBills$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillDetailsActions.loadBills),
        mergeMap(() => this.billsService.getBills()
          .pipe(
            map(bills => BillApiActions.loadBillsSuccess({ bills })),
            catchError(error => of(BillApiActions.loadBillsFailure({ error })))
          )
        )
      );
  });

  updateBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillDetailsActions.updateBill),
        concatMap(action =>
          this.billsService.update(action.bill)
            .pipe(
              map(bill => BillApiActions.updateBillSuccess({ bill })),
              catchError(error => of(BillApiActions.updateBillFailure({ error })))
            )
        )
      );
  });

  createBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillDetailsActions.createBill),
        concatMap(action =>
          this.billsService.add(action.bill)
            .pipe(
              map(bill => BillApiActions.createBillSuccess({ bill })),
              catchError(error => of(BillApiActions.createBillFailure({ error })))
            )
        )
      );
  });

  deleteBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillDetailsActions.deleteBill),
        mergeMap(action =>
          this.billsService.delete(action.billId).pipe(
            map(() => BillApiActions.deleteBillSuccess({ billId: action.billId })),
            catchError(error => of(BillApiActions.deleteBillFailure({ error })))
          )
        )
      );
  });
}
