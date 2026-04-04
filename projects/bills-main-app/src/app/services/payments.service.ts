import { inject, Injectable } from '@angular/core';
import moment from 'moment';
import { Payment, PaymentsService } from 'projects/model/src/public-api';
import { from, map, Observable } from 'rxjs';
import { PaymentRow } from './db.types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentsServiceImpl extends PaymentsService {

  private serverService: SupabaseService = inject(SupabaseService);

  load(billId: number): Observable<Payment[]> {
    return from(this.serverService.client.from('payments_overview').select<'*', PaymentRow>('*').eq('bill_id', billId)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.map(r => this.fromRow(r));
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
