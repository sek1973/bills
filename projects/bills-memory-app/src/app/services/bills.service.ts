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

@Injectable({
  providedIn: 'root',
})
export class BillsServiceImpl extends BillsService {

  private bills: Bill[] = [
    createBill(1, 1, 'Gaz', 'Opłaty za gaz', 'https://www.wp.pl/', 'gaz_login', 'gaz_haslo', 199.50, 0.5),
    createBill(2, 2, 'Prąd', 'Opłaty za prąd', 'https://www.wp.pl/', 'prad_login', 'prad_haslo', 45.70, 0.5),
    createBill(3, 3, 'Woda', 'Opłaty za wodę', 'https://www.wp.pl/', 'woda_login', 'woda_haslo', 25, 0.66),
  ];

  constructor(
    paymentsService: PaymentsServiceImpl,
    schedulesService: SchedulesServiceImpl) {
    super(paymentsService, schedulesService);
  }

  load(): Observable<Bill[]> {
    return of(this.bills).pipe(delay(1000));
  }

  fetchItem(id: number): Observable<Bill | null> {
    const result = this.bills.find(b => b.id === id);
    return of(result || null).pipe(delay(1000));
  }

  getBills(): Bill[] { return this.bills; }

  add(bill: Bill): Observable<Bill> {
    const id = this.findNextId();
    const result = bill.clone(id);
    this.modifyBills((bills: Bill[]) => bills.push(result));
    return of(result).pipe(delay(1000));
  }

  update(bill: Bill): Observable<boolean> {
    const index = this.bills.findIndex(b => b.id === bill.id);
    if (index > -1) {
      this.modifyBills((bills: Bill[]) => bills[index] = bill);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  delete(billId: number): Observable<boolean> {
    const id = this.bills.findIndex(b => b.id === billId);
    if (id >= 0) {
      this.modifyBills((bills: Bill[]) => bills.splice(id, 1));
      return of(true).pipe(delay(1000));
    } else {
      return of(false).pipe(delay(1000));
    }
  }

  private modifyBills(operation: (bills: Bill[]) => void): void {
    const bills = [...this.bills];
    operation(bills);
    this.bills = bills;
  }

  private findNextId(): number {
    const ids: number[] = this.bills.map(b => b.id);
    ids.sort((a: number, b: number) => a > b ? 1 : -1);
    return ids.length ? ids[ids.length - 1] + 1 : 1;
  }

}
