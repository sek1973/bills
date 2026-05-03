import { inject, Injectable } from '@angular/core';
import { OverviewBill, OverviewBillsService } from '@bills/model';
import { NetworkStatusService } from '@bills/tools';
import { from, map, Observable, throwError, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';
import { OverviewBillRow } from './db.types';
import { RETRY_COUNT, RETRY_DELAY, TIMEOUT_VALUE } from './shared';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class OverviewBillsServiceImpl extends OverviewBillsService {

  private serverService = inject(SupabaseService);
  private networkStatus: NetworkStatusService = inject(NetworkStatusService);

  load(): Observable<OverviewBill[]> {
    if (!this.networkStatus.isOnline()) {
      return throwError(() => new Error('Brak połączenia z internetem'));
    }
    return from(this.serverService.client.from('bills_overview').select<'*', OverviewBillRow>('*')).pipe(
      timeout(TIMEOUT_VALUE),
      retry({
        count: RETRY_COUNT,
        delay: (error) => this.networkStatus.isOnline() ? timer(RETRY_DELAY) : throwError(() => error)
      }),
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
