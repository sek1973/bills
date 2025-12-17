import { inject, Injectable } from '@angular/core';
import { Bill, BillsService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';
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

  load(): Observable<Bill[]> {
    return new Observable<Bill[]>(observer => {
      this.serverService.client
        .from('bills')
        .select('*')
        .then(response => {
          observer.next(response.data as Bill[]);
          observer.complete();
        }, error => {
          observer.error(error);
        });
    });
  }

  fetchItem(id: number): Observable<Bill | null> {
    return of(null);
  }

  getBills(): Bill[] { return []; }

  add(bill: Bill): Observable<Bill> {
    return of(new Bill());
  }

  update(bill: Bill): Observable<boolean> {
    return of(false);
  }

  delete(billId: number): Observable<boolean> {
    return of(false);
  }

}
