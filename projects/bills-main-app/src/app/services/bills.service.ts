import { inject, Injectable } from '@angular/core';
import { Bill, BillsService } from 'projects/model/src/public-api';
import { from, map, Observable } from 'rxjs';
import { BillRow } from './db.types';
import { PaymentsServiceImpl } from './payments.service';
import { SchedulesServiceImpl } from './schedules.service';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class BillsServiceImpl extends BillsService {

  protected paymentsService: PaymentsServiceImpl = inject(PaymentsServiceImpl);
  protected schedulesService: SchedulesServiceImpl = inject(SchedulesServiceImpl);
  protected serverService: SupabaseService = inject(SupabaseService);

  private _bills: Bill[] = [];

  getBills(): Bill[] { return this._bills; }

  load(): Observable<Bill[]> {
    return from(this.serverService.client.from('bills').select<'*', BillRow>('*')).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        this._bills = data.map(r => this.fromRow(r));
        return this._bills;
      })
    );
  }

  fetchItem(id: number): Observable<Bill | null> {
    return from(this.serverService.client.from('bills').select('*').eq('id', id).single<BillRow>()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.fromRow(data);
      })
    );
  }

  private fromRow(r: BillRow): Bill {
    return new Bill(
      r.position ?? undefined,
      r.name,
      r.description ?? undefined,
      r.active,
      r.url ?? undefined,
      r.login ?? undefined,
      r.sum,
      r.share,
      r.deadline ? new Date(r.deadline) : undefined,
      r.repeat,
      r.unit,
      r.reminder ? new Date(r.reminder) : undefined,
      r.id ?? -1,
    );
  }

  private toRow(bill: Bill): Omit<BillRow, 'id'> {
    return {
      position: bill.position ?? null,
      name: bill.name,
      description: bill.description ?? null,
      active: bill.active,
      url: bill.url ?? null,
      login: bill.login ?? null,
      sum: bill.sum,
      share: bill.share,
      deadline: bill.deadline ? bill.deadline.toISOString() : null,
      repeat: bill.repeat,
      unit: bill.unit,
      reminder: bill.reminder ? bill.reminder.toISOString() : null,
    };
  }

  add(bill: Bill): Observable<Bill> {
    return from(this.serverService.client.from('bills').insert(this.toRow(bill)).select().single<Bill>()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      })
    );
  }

  update(bill: Bill): Observable<boolean> {
    return from(this.serverService.client.from('bills').update(bill).eq('id', bill.id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  delete(billId: number): Observable<boolean> {
    return from(this.serverService.client.from('bills').delete().eq('id', billId)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  swapPositions(billIdA: number, newPositionA: number, billIdB: number, newPositionB: number): Observable<boolean> {
    return from(this.serverService.client.rpc('swap_bill_positions', {
      p_bill_id_a: billIdA,
      p_new_position_a: newPositionA,
      p_bill_id_b: billIdB,
      p_new_position_b: newPositionB,
    })).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

}
