import { Injectable } from '@angular/core';
import { Bill, BillsService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';
import { PaymentsServiceImpl } from './payments.service';
import { SchedulesServiceImpl } from './schedules.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BillsServiceImpl extends BillsService {

  constructor(
    paymentsService: PaymentsServiceImpl,
    schedulesService: SchedulesServiceImpl) {
    super(paymentsService, schedulesService);
  }

  load(): Observable<Bill[]> { return of([]); }

  fetchItem(id: number): Observable<Bill | null> { return of(null); }

  getBills(): Bill[] { return []; }

  fetchBills(): Observable<Bill[]> { return of([]); }

  add(bill: Bill): Observable<number> { return of(0); }

  update(bill: Bill): Observable<void> { return of(); }

  delete(billId: number): Observable<void> { return of(); }

}
