import { inject } from '@angular/core';
import { Bill, BillsService, calculateNextDeadline, Payment, PaymentsService, QueuedOperation, WriteQueueService } from '@bills/model';
import { NotificationService } from '@bills/tools';
import { createEffect } from '@ngrx/effects';
import { EMPTY, from, fromEvent, Observable, of } from 'rxjs';
import { catchError, exhaustMap, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { BillsActions } from '../bill/bill.actions';
import { PaymentsActions } from '../payment/payment.actions';

function deserializePayment(raw: Record<string, unknown>): Payment {
  return new Payment(
    new Date(raw['deadline'] as string),
    raw['sum'] as number,
    raw['paiddate'] ? new Date(raw['paiddate'] as string) : undefined,
    raw['remarks'] as string | undefined,
    raw['reminder'] ? new Date(raw['reminder'] as string) : undefined,
    raw['billId'] as number | undefined,
    raw['id'] as number,
  );
}

function deserializeBill(raw: Record<string, unknown>): Bill {
  return new Bill(
    raw['position'] as number | undefined,
    raw['name'] as string,
    raw['description'] as string | undefined,
    raw['active'] as boolean,
    raw['url'] as string | undefined,
    raw['login'] as string | undefined,
    raw['account'] as string | undefined,
    raw['defaultSum'] as number,
    raw['repeat'] as number,
    raw['unit'] as number,
    raw['id'] as number,
  );
}

function flushOp(
  op: QueuedOperation,
  paymentsService: PaymentsService,
  billsService: BillsService,
  writeQueue: WriteQueueService,
): Observable<unknown> {
  const payload = JSON.parse(op.payload) as Record<string, unknown>;

  let request$: Observable<unknown>;
  switch (op.type) {
    case 'createPayment':
      request$ = paymentsService.add(deserializePayment(payload['payment'] as Record<string, unknown>));
      break;
    case 'updatePayment':
      request$ = paymentsService.update(deserializePayment(payload['payment'] as Record<string, unknown>));
      break;
    case 'deletePayment':
      request$ = paymentsService.delete(deserializePayment(payload['payment'] as Record<string, unknown>));
      break;
    case 'createBill':
      request$ = billsService.add(deserializeBill(payload['bill'] as Record<string, unknown>));
      break;
    case 'updateBill':
      request$ = billsService.update(deserializeBill(payload['bill'] as Record<string, unknown>));
      break;
    case 'deleteBill':
      request$ = billsService.delete((payload['bill'] as Record<string, unknown>)['id'] as number);
      break;
    case 'payBill': {
      const bill = deserializeBill(payload['bill'] as Record<string, unknown>);
      const value = payload['value'] as number;
      const closestRaw = payload['closest'] as Record<string, unknown> | null;
      const closest = closestRaw ? deserializePayment(closestRaw) : undefined;
      const payments = (payload['payments'] as Record<string, unknown>[]).map(deserializePayment);
      const today = new Date();
      const payOp: Observable<unknown> = closest
        ? paymentsService.update(new Payment(
          closest.deadline, value, today,
          closest.remarks, closest.reminder, closest.billId, closest.id
        ))
        : paymentsService.add(new Payment(today, value, today, undefined, undefined, bill.id));
      const otherUpcoming = payments.filter(p => !p.paiddate && p.deadline && p.id !== closest?.id);
      request$ = payOp.pipe(
        switchMap(() => {
          if (otherUpcoming.length) { return of(null); }
          const base = closest?.deadline ?? today;
          const nextDeadline = calculateNextDeadline(base, bill.unit, bill.repeat);
          return paymentsService.add(new Payment(nextDeadline, bill.defaultSum, undefined, undefined, undefined, bill.id));
        })
      );
      break;
    }
    default:
      return EMPTY;
  }

  return request$.pipe(switchMap(() => writeQueue.dequeue(op.id)));
}

export const QueueEffects = {
  flushOnReconnect$: createEffect(() => {
    if (typeof window === 'undefined') { return EMPTY; }

    const writeQueue = inject(WriteQueueService);
    const paymentsService = inject(PaymentsService);
    const billsService = inject(BillsService);
    const notification = inject(NotificationService);

    const reloadActions = [BillsActions.loadOverviewBills(), PaymentsActions.loadAllPayments()];

    return fromEvent(window, 'online').pipe(
      exhaustMap(() =>
        writeQueue.getAll().pipe(
          switchMap(ops => {
            if (!ops.length) {
              return from(reloadActions);
            }

            return from(ops).pipe(
              mergeMap(op =>
                flushOp(op, paymentsService, billsService, writeQueue).pipe(
                  catchError(() => of(null))
                )
              ),
              toArray(),
              tap(() => notification.success('Zsynchronizowano operacje wykonane offline')),
              mergeMap(() => from(reloadActions)),
            );
          })
        )
      )
    );
  }, { functional: true }),
};
