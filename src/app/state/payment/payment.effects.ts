import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap } from 'rxjs/operators';
import { ConfirmDialogResponse } from 'src/app/components';
import { ConfirmDialogInputType } from 'src/app/components/tools/confirm-dialog/confirm-dialog.model';
import { PaymentsService } from 'src/app/services';
import { ConfirmationService } from 'src/app/services/system/confirmation.service';
import { PaymentApiActions } from './payment-api.actions';
import { PaymentsActions } from './payment.actions';

@Injectable()
export class PaymentEffects {

  constructor(
    private actions$: Actions,
    private paymentsService: PaymentsService,
    private confirmationService: ConfirmationService) { }

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

  deletePayment$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(PaymentsActions.deletePayment),
        filter(action => action.payment.id >= 0),
        mergeMap(action => this.confirmationService
          .confirm('Usuń płatność',
            'Czy na pewno chcesz usunąć bieżącą płatność? Operacji nie będzie można cofnąć! ')
          .pipe(
            filter(response => !!response),
            mergeMap(() => this.paymentsService.delete(action.payment)),
            map(() => PaymentApiActions.deletePaymentSuccess({ paymentId: action.payment.id })),
            catchError(error => of(PaymentApiActions.deletePaymentFailure({ error })))
          )
        )
      );
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
            mergeMap(response => {
              const data = (response as ConfirmDialogResponse).value as string;
              if (!data || data === null || data === undefined || data === '') {
                return of('Brak danych do zaimportowania');
              } else {
                return this.paymentsService.importPayments(data, action.billId);
              }
            }),
            map(report => PaymentApiActions.importPaymentsSuccess({ report })),
            catchError(report => of(PaymentApiActions.importPaymentsFailure({ report })))
          )
        )
      );
  });

}
