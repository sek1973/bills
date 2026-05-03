import { inject, Injectable } from '@angular/core';
import { Payment, PaymentsService } from '@bills/model';

import { NetworkStatusService } from '@bills/tools';
import moment from 'moment';
import { from, map, Observable, throwError, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { PaymentRow } from './db.types';
import { RETRY_COUNT, RETRY_DELAY, TIMEOUT_VALUE } from './shared';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentsServiceImpl extends PaymentsService {

  private serverService: SupabaseService = inject(SupabaseService);
  private networkStatus: NetworkStatusService = inject(NetworkStatusService);

  load(billId: number): Observable<Payment[]> {
    if (!this.networkStatus.isOnline()) {
      return throwError(() => new Error('Brak połączenia z internetem'));
    }
    return from(this.serverService.client.rpc('bill_payments_overview', { p_bill_id: billId })).pipe(
      timeout(TIMEOUT_VALUE),
      retry({
        count: RETRY_COUNT,
        delay: (error) => this.networkStatus.isOnline() ? timer(RETRY_DELAY) : throwError(() => error)
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []).map((r: PaymentRow) => this.fromRow(r));
      })
    );
  }

  createPaymentData(payment: Payment): Payment {
    return payment.clone();
  }

  add(payment: Payment): Observable<number> {
    return from(this.serverService.client.from('payments').insert(this.toRow(payment)).select('id').single<PaymentRow>()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.id ?? -1;
      })
    );
  }

  update(payment: Payment): Observable<boolean> {
    return from(this.serverService.client.from('payments').update(this.toRow(payment)).eq('id', payment.id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  private fromRow(r: PaymentRow): Payment {
    return new Payment(
      r.deadline ? moment(r.deadline).toDate() : new Date(),
      r.sum,
      r.paid_date ? moment(r.paid_date).toDate() : undefined,
      r.remarks ?? undefined,
      r.reminder ? moment(r.reminder).toDate() : undefined,
      r.bill_id,
      r.id ?? -1,
    );
  }

  private toRow(payment: Payment): Omit<PaymentRow, 'id'> {
    return {
      deadline: moment(payment.deadline ?? new Date()).format('YYYY-MM-DD'),
      sum: payment.sum,
      paid_date: payment.paiddate ? moment(payment.paiddate).format('YYYY-MM-DD') : null,
      remarks: payment.remarks ?? null,
      bill_id: payment.billId ?? -1,
      reminder: payment.reminder ? moment(payment.reminder).format('YYYY-MM-DD') : null,
    };
  }

  delete(payment: Payment): Observable<boolean> {
    return from(this.serverService.client.from('payments').delete().eq('id', payment.id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

}
