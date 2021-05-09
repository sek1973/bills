import { Injectable } from '@angular/core';
import { Bill, BillsService, Unit } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PaymentsServiceImpl } from './payments.service';
import { SchedulesServiceImpl } from './schedules.service';

function createBill(
  id: number,
  lp: number,
  name: string,
  description: string,
  url: string,
  login: string,
  password: string,
  sum: number,
  share: number,
  deadline: Date = new Date(),
  repeat: number = 1,
  unit: Unit = Unit.Month,
  reminder: Date = new Date()): Bill {
  const result = new Bill();
  result.id = id;
  result.lp = lp;
  result.name = name;
  result.description = description;
  result.url = url;
  result.login = login;
  result.password = password;
  result.sum = sum;
  result.share = share;
  result.deadline = deadline;
  result.repeat = repeat;
  result.unit = unit;
  result.reminder = reminder;
  return result;
}

const bills: Bill[] = [
  createBill(1, 1, 'Gaz', 'Opłaty za gaz', 'https://www.wp.pl/', 'gaz_login', 'gaz_haslo', 199.50, 0.5),
  createBill(2, 2, 'Prąd', 'Opłaty za prąd', 'https://www.wp.pl/', 'prad_login', 'prad_haslo', 45.70, 0.5),
  createBill(3, 3, 'Woda', 'Opłaty za wodę', 'https://www.wp.pl/', 'woda_login', 'woda_haslo', 25, 0.66),
];

@Injectable({
  providedIn: 'root',
})
export abstract class BillsServiceImpl extends BillsService {

  constructor(
    paymentsService: PaymentsServiceImpl,
    schedulesService: SchedulesServiceImpl) {
    super(paymentsService, schedulesService);
  }

  load(): Observable<Bill[]> { return of(bills).pipe(delay(1000)); }

  fetchItem(id: number): Observable<Bill | null> { return of(null).pipe(delay(1000)); }

  getBills(): Bill[] { return bills; }

  add(bill: Bill): Observable<number> {
    return of(0).pipe(delay(1000));
  }

  update(bill: Bill): Observable<void> { return of(); }

  delete(billId: number): Observable<void> { return of(); }

}
