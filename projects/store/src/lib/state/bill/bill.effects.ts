import { inject, Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import moment from 'moment';
import { BillsService, calculateNextDeadline, Payment, PaymentsService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse, NotificationService, validateBillName } from 'projects/tools/src/public-api';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { BillApiActions } from './bill-api.actions';
import { BillsActions } from './bill.actions';

@Injectable()
export class BillEffects {

  private actions$ = inject(Actions);
  private billsService = inject(BillsService);
  private paymentsService = inject(PaymentsService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private router = inject(Router);

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
        concatMap(action => {
          const bills = this.billsService.getBills();
          const currentBill = bills.find(b => b.id === action.bill.id);
          const positionChanged = currentBill && currentBill.position !== action.bill.position;
          const n: number | null = action.bill.position === null ? null : Number(action.bill.position);
          const conflictingBill = positionChanged
            ? bills.find(b => b.position === n && b.id !== action.bill.id)
            : undefined;

          if (conflictingBill && currentBill?.position != null && action.bill.position != null) {
            return this.confirmationService.confirm({
              dialogTitle: 'Zamiana pozycji',
              message: `Rachunek "${conflictingBill.name}" ma już pozycję ${action.bill.position}. Czy zamienić pozycje obu rachunków?`,
              cancelButtonLabel: 'Anuluj',
              applyButtonLabel: 'Zamień'
            }).pipe(
              filter(response => !!response),
              map(() => BillsActions.updateBillConfirmed({ bill: action.bill, redirect: action.redirect })),
            );
          }

          return of(BillsActions.updateBillConfirmed({ bill: action.bill, redirect: action.redirect }));
        })
      );
  });

  updateBillConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.updateBillConfirmed),
        concatMap(action => {
          const bills = this.billsService.getBills();
          const currentBill = bills.find(b => b.id === action.bill.id);
          const positionChanged = currentBill && currentBill.position !== action.bill.position;
          const n: number | null = action.bill.position === null ? null : Number(action.bill.position);
          const conflictingBill = positionChanged
            ? bills.find(b => b.position === n && b.id !== action.bill.id)
            : undefined;

          if (conflictingBill && currentBill?.position != null && action.bill.position != null) {
            return this.billsService.swapPositions(
              action.bill.id, action.bill.position!,
              conflictingBill.id, currentBill!.position!,
            ).pipe(
              switchMap(() => this.billsService.update(action.bill)),
              map(() => BillApiActions.updateBillSuccess({ bill: action.bill, redirect: action.redirect })),
              catchError(error => of(BillApiActions.updateBillFailure({ error }))),
            );
          }

          return this.billsService.update(action.bill).pipe(
            map(() => BillApiActions.updateBillSuccess({ bill: action.bill, redirect: action.redirect })),
            catchError(error => of(BillApiActions.updateBillFailure({ error }))),
          );
        })
      );
  });

  updateBillSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillApiActions.updateBillSuccess),
        map((action) => {
          this.notification.success('Zapisano zmiany dla rachunku');
          if (action.redirect) { this.router.navigate(['/zestawienie']); }
        }),
        switchMap(() => of(BillsActions.loadBills())));
  });

  createBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.createBill),
        concatMap(action =>
          this.billsService.add(action.bill)
            .pipe(
              map((bill) => BillApiActions.createBillSuccess({ bill, redirect: action.redirect })),
              catchError(error => of(BillApiActions.createBillFailure({ error })))
            )
        )
      );
  });

  createBillSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillApiActions.createBillSuccess),
        map((action) => {
          this.notification.success('Utworzono nowy rachunek');
          if (action.redirect) {
            this.router.navigate(['/zestawienie']);
          } else {
            this.router.navigate([`/rachunek/${action.bill.id}`]);
          }
        }),
        switchMap(() => of(BillsActions.loadBills())));
  });

  deleteBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.deleteBill),
        filter(action => action.bill.id >= 0),
        mergeMap(action => this.confirmationService.confirm({
          dialogTitle: 'Usuń rachunek',
          message: 'Czy na pewno chcesz usunąć bieżący rachunek wraz z historią płatności? Operacji nie będzie można cofnąć! ' +
            'Aby potwierdzić podaj nazwę rachunku.',
          cancelButtonLabel: 'Nie',
          applyButtonLabel: 'Tak',
          inputType: ConfirmDialogInputType.InputTypeText,
          inputValidators: [Validators.required, validateBillName(action.bill.name)],
          inputLabelText: 'Nazwa rachunku',
          inputPlaceholderText: 'Nazwa rachunku'
        }).pipe(
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
        map(() => this.notification.success('Usunięto rachunek')),
        map(() => this.router.navigate(['/zestawienie'])),
        switchMap(() => of(BillsActions.loadBills())));
  });

  payBill$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillsActions.payBill),
        filter(action => action.bill.id >= 0),
        mergeMap(action =>
          this.paymentsService.load(action.bill.id).pipe(
            catchError(() => of([] as Payment[])),
            switchMap(payments => {
              const closest = payments
                .filter(p => !p.paiddate && p.deadline)
                .sort((a, b) => moment(a.deadline).diff(moment(b.deadline)))[0] as Payment | undefined;

              return this.confirmationService.confirm({
                dialogTitle: 'Rachunek opłacony',
                message: 'Podaj zapłaconą kwotę:',
                cancelButtonLabel: 'Anuluj',
                applyButtonLabel: 'OK',
                inputType: ConfirmDialogInputType.InputTypeCurrency,
                inputValue: closest?.sum ?? action.bill.sum,
                inputValidators: [Validators.required],
                inputLabelText: 'Kwota',
                inputPlaceholderText: 'Kwota'
              }).pipe(
                filter(response => response !== false),
                switchMap(response => {
                  const value = (response as ConfirmDialogResponse).value;
                  const today = new Date();
                  const payOp: Observable<boolean | number> = closest
                    ? this.paymentsService.update(new Payment(
                      closest.deadline, value as number, today,
                      closest.remarks, closest.reminder, closest.billId, closest.id
                    ))
                    : this.paymentsService.add(
                      new Payment(today, value as number, today, undefined, undefined, action.bill.id)
                    );

                  return payOp.pipe(
                    switchMap(() => {
                      const otherUpcoming = payments.filter(p =>
                        !p.paiddate && p.deadline && p.id !== closest?.id
                      );
                      if (otherUpcoming.length) {
                        return of(BillApiActions.payBillSuccess({ billId: action.bill.id }));
                      }
                      const base = closest?.deadline ?? today;
                      const nextDeadline = calculateNextDeadline(base, action.bill.unit, action.bill.repeat);
                      const nextPayment = new Payment(nextDeadline, action.bill.sum, undefined, undefined, undefined, action.bill.id);
                      return this.paymentsService.add(nextPayment).pipe(
                        switchMap(() => this.confirmationService.confirm({
                          dialogTitle: 'Następna płatność',
                          message: `Dodano termin następnej płatności: ${moment(nextDeadline).format('DD.MM.YYYY')}`,
                          cancelButtonVisible: false,
                          applyButtonLabel: 'OK'
                        }).pipe(
                          map(() => BillApiActions.payBillSuccess({ billId: action.bill.id }))
                        )),
                        catchError(error => of(BillApiActions.payBillFailure({ error })))
                      );
                    }),
                    catchError(error => of(BillApiActions.payBillFailure({ error })))
                  );
                }),
                catchError(error => of(BillApiActions.payBillFailure({ error })))
              );
            })
          )
        )
      );
  });

  payBillSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(BillApiActions.payBillSuccess),
        map(() => this.notification.success('Opłacono rachunek')),
        switchMap(() => of(BillsActions.loadBills())));
  });

  showBillError$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(
          BillApiActions.loadBillsFailure,
          BillApiActions.updateBillFailure,
          BillApiActions.createBillFailure,
          BillApiActions.deleteBillFailure,
          BillApiActions.payBillFailure
        ),
        map(({ error }) => {
          const message = error?.message || error;
          this.notification.error(`Wystąpił błąd podczas operacji na rachunku: ${message}`);
        })
      );
  }, { dispatch: false });

}
