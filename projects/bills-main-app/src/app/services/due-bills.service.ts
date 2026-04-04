import { inject, Injectable } from '@angular/core';
import { DueBill, DueBillsService } from 'projects/model/src/public-api';
import { from, map, Observable } from 'rxjs';
import { DueBillRow } from './db.types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class DueBillsServiceImpl extends DueBillsService {

  private serverService = inject(SupabaseService);

  load(): Observable<DueBill[]> {
    return from(this.serverService.client.from('bills_overview').select<'*', DueBillRow>('*')).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.map(r => ({
          id: r.id,
          position: r.position ?? undefined,
          name: r.name,
          description: r.description ?? undefined,
          active: r.active,
          url: r.url ?? undefined,
          login: r.login ?? undefined,
          dueDate: r.due_date ? new Date(r.due_date) : undefined,
          sum: r.sum ?? 0,
        }));
      })
    );
  }
}
