import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PaymentsService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { PaymentApiActions } from './payment-api.actions';
import { PaymentsActions } from './payment.actions';

@Injectable()
export class PaymentEffects {

  constructor(
    private actions$: Actions,
    private paymentsService: PaymentsService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  loadPayments$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.loadPayments),
        mergeMap(action => this.paymentsService.load(action.billId)
          .pipe(
            map(payments => PaymentApiActions.loadPaymentsSuccess({ payments })),
            catchError(error => of(PaymentApiActions.loadPaymentsFailure({ error })))
          )
        )
      );
  });

  updatePayment$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.updatePayment),
        concatMap(action =>
          this.paymentsService.update(action.payment)
            .pipe(
              map(() => PaymentApiActions.updatePaymentSuccess({ payment: action.payment })),
              catchError(error => of(PaymentApiActions.updatePaymentFailure({ error })))
            )
        )
      );
  });

  updatePaymentSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentApiActions.updatePaymentSuccess),
        map(action => {
          this.snackBar.open('Zapisano zmiany dla płatności', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(PaymentsActions.loadPayments({ billId: action.payment.billId || -1 }))));
  });

  createPayment$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.createPayment),
        concatMap(action =>
          this.paymentsService.add(action.payment)
            .pipe(
              map(() => PaymentApiActions.createPaymentSuccess({ payment: action.payment })),
              catchError(error => of(PaymentApiActions.createPaymentFailure({ error })))
            )
        )
      );
  });

  createPaymentSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentApiActions.createPaymentSuccess),
        map(action => {
          this.snackBar.open('Utworzono nową płatność', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(PaymentsActions.loadPayments({ billId: action.payment.billId || -1 }))));
  });

  deletePayment$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.deletePayment),
        filter(action => action.payment.id >= 0),
        mergeMap(action => this.confirmationService
          .confirm('Usuń płatność',
            'Czy na pewno chcesz usunąć bieżącą płatność? Operacji nie będzie można cofnąć!', 'Nie', 'Tak')
          .pipe(
            filter(response => !!response),
            map(() => PaymentsActions.deletePaymentConfirmed({ payment: action.payment }))
          )
        )
      );
  });

  deletePaymentConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.deletePaymentConfirmed),
        switchMap(action => this.paymentsService.delete(action.payment)
          .pipe(map(() => PaymentApiActions.deletePaymentSuccess({ billId: action.payment.billId || -1 })),
            catchError(error => of(PaymentApiActions.deletePaymentFailure({ error })))
          )));
  });

  deletePaymentSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentApiActions.deletePaymentSuccess),
        map(action => {
          this.snackBar.open('Usunięto płatność', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(PaymentsActions.loadPayments({ billId: action.billId }))));
  });

  importPayments$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.importPayments),
        mergeMap(action => this.confirmationService
          .confirm('Importuj historyczne płatności',
            'Wklej ze schowka lub wpisz dane w poniższe pole a następnie naciśnij importuj.', 'Anuluj', 'Importuj',
            ConfirmDialogInputType.InputTypeTextArea, undefined, [Validators.required], 'Dane', 'Dane')
          .pipe(
            filter(response => !!response),
            map(response => {
              const data = (response as ConfirmDialogResponse).value as string;
              if (!data || data === null || data === undefined || data === '') {
                this.snackBar.open('Brak danych do zaimportowania', 'Ukryj', { duration: 3000 });
                return PaymentApiActions.importPaymentsFailure({ error: 'Brak danych do zaimportowania' });
              } else {
                return PaymentsActions.importPaymentsConfirmed({ data, billId: action.billId });
              }
            })
          )
        )
      );
  });

  importPaymentsConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.importPaymentsConfirmed),
        switchMap(action => this.paymentsService.importPayments(action.data, action.billId)
          .pipe(map(report => PaymentApiActions.importPaymentsSuccess({ report, billId: action.billId })),
            catchError(error => of(PaymentApiActions.importPaymentsFailure({ error })))
          )));
  });

  importPaymentsSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentApiActions.importPaymentsSuccess),
        map(action => {
          this.snackBar.open('Zaimportowano płatności', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(PaymentsActions.loadPayments({ billId: action.billId }))));
  });

}
