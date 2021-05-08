import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { BillsService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse, validateBillName } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap } from 'rxjs/operators';
import { AppState } from '../app';
import { BillApiActions } from './bill-api.actions';
import { BillDetailsActions } from './bill-details.actions';
import { BillsActions } from './bill.actions';

@Injectable()
export class BillEffects {

  constructor(
    private actions$: Actions,
    private billsService: BillsService,
    private confirmationService: ConfirmationService,
    private store: Store<AppState>) { }

  loadBills$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.loadBills, BillDetailsActions.loadBills),
        mergeMap(() =>
          this.billsService.load()
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
        ofType(BillsActions.updateBill, BillDetailsActions.updateBill),
        concatMap(action =>
          this.billsService.update(action.bill)
            .pipe(
              map(() => BillApiActions.updateBillSuccess({ bill: action.bill })),
              catchError(error => of(BillApiActions.updateBillFailure({ error })))
            )
        )
      );
  });

  createBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.createBill, BillDetailsActions.createBill),
        concatMap(action =>
          this.billsService.add(action.bill)
            .pipe(
              map(() => BillApiActions.createBillSuccess({ bill: action.bill })),
              catchError(error => of(BillApiActions.createBillFailure({ error })))
            )
        )
      );
  });

  deleteBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.deleteBill, BillDetailsActions.deleteBill),
        filter(action => action.bill.id >= 0),
        mergeMap(action => this.confirmationService
          .confirm('Usuń rachunek',
            'Czy na pewno chcesz usunąć bieżący rachunek wraz z historią płatności? Operacji nie będzie można cofnąć! ' +
            'Aby potwierdzić podaj nazwę rachunku.', 'Nie', 'Tak',
            ConfirmDialogInputType.InputTypeText, undefined,
            [Validators.required, validateBillName(action.bill.name)],
            'Nazwa rachunku', 'Nazwa rachunku')
          .pipe(
            filter(response => !!response),
            mergeMap(() => this.billsService.delete(action.bill.id)),
            map(() => BillApiActions.deleteBillSuccess({ billId: action.bill.id })),
            catchError(error => of(BillApiActions.deleteBillFailure({ error })))
          )
        )
      );
  });

  payBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.payBill, BillDetailsActions.payBill),
        filter(action => action.bill.id >= 0),
        mergeMap(action => this.confirmationService
          .confirm('Rachunek opłacony',
            'Podaj kwotę do zapłacenia (udział zostanie wyliczony automatycznie):', 'Anuluj', 'OK',
            ConfirmDialogInputType.InputTypeCurrency, action.bill.sum, [Validators.required], 'Kwota', 'Kwota')
          .pipe(
            filter(response => response !== false),
            mergeMap(response => this.billsService.pay(action.bill, (response as ConfirmDialogResponse).value)),
            map(() => BillApiActions.payBillSuccess({ billId: action.bill.id })),
            catchError(error => of(BillApiActions.payBillFailure({ error })))
          )
        )
      );
  });

}
