import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BillsService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse, validateBillName } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { BillApiActions } from './bill-api.actions';
import { BillsActions } from './bill.actions';

@Injectable()
export class BillEffects {

  constructor(
    private actions$: Actions,
    private billsService: BillsService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar,
    private router: Router) { }

  loadBills$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.loadBills),
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
        ofType(BillsActions.updateBill),
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
        ofType(BillsActions.createBill),
        concatMap(action =>
          this.billsService.add(action.bill)
            .pipe(
              map(() => BillApiActions.createBillSuccess({ bill: action.bill })),
              catchError(error => of(BillApiActions.createBillFailure({ error })))
            )
        )
      );
  });

  createBillSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillApiActions.createBillSuccess),
        map(() => this.snackBar.open('Utworzono nowy rachunek', 'Ukryj', { duration: 3000 })),
        map(() => this.router.navigate(['/zestawienie'])),
        switchMap(() => of(BillsActions.loadBills())));
  });

  deleteBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.deleteBill),
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
            map(() => BillsActions.deleteBillConfirmed({ bill: action.bill }))
          )
        )
      );
  });

  deleteBillConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.deleteBillConfirmed),
        switchMap(action => this.billsService.delete(action.bill.id)
          .pipe(map(() => BillApiActions.deleteBillSuccess({ billId: action.bill.id })),
            catchError(error => of(BillApiActions.deleteBillFailure({ error })))
          )));
  });

  deleteBillSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillApiActions.deleteBillSuccess),
        map(() => this.snackBar.open('Usunięto rachunek', 'Ukryj', { duration: 3000 })),
        map(() => this.router.navigate(['/zestawienie'])),
        switchMap(() => of(BillsActions.loadBills())));
  });

  payBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.payBill),
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
