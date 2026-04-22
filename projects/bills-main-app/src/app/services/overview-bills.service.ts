import { inject, Injectable } from '@angular/core';
import { OverviewBill, OverviewBillsService } from 'model';
import { from, map, Observable } from 'rxjs';
import { OverviewBillRow } from './db.types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class OverviewBillsServiceImpl extends OverviewBillsService {

  private serverService = inject(SupabaseService);

  load(): Observable<OverviewBill[]> {
    return from(this.serverService.client.from('bills_overview').select<'*', OverviewBillRow>('*')).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.map(r => new OverviewBill(
          r.position ?? undefined,
          r.name,
          r.description ?? undefined,
          r.active,
          r.url ?? undefined,
          r.login ?? undefined,
          r.account ?? undefined,
          r.default_sum,
          r.repeat,
          r.unit,
          r.id ?? -1,
          r.due_date ? new Date(r.due_date) : undefined,
          r.sum ?? 0,
        ));
      })
    );
  }
}
