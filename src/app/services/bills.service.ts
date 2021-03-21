import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { addDays, dateToTimestamp } from 'src/app/helpers';
import { Bill } from '../model/bill';
import { Payment } from '../model/payment';
import { Schedule } from '../model/schedule';
import { Unit } from '../model/unit';
import { PaymentsService } from './payments.service';
import { SchedulesService } from './schedules.service';

@Injectable({
  providedIn: 'root',
})
export class BillsFirebaseService {
  private bills: Bill[] = [];
  private billsSubject = new BehaviorSubject<Bill[]>([]);

  private billsLoadingSubject = new BehaviorSubject<boolean>(false);
  public billsLoading$ = this.billsLoadingSubject.asObservable();

  private billsSubscription = Subscription.EMPTY;

  constructor(
    private paymentsService: PaymentsService,
    private schedulesService: SchedulesService) {
    this.load();
  }

  load(): void {
    this.billsSubscription.unsubscribe();
    this.billsSubscription = of(new Array<Bill>())
      .pipe(map(() => this.billsLoadingSubject.next(true)),
        mergeMap(() => this.fetch()),
        map(bills => {
          this.billsLoadingSubject.next(false);
          return bills;
        }),
        catchError(() => of(new Array<Bill>())))
      .subscribe((bills) => {
        this.bills = bills;
        this.billsSubject.next(bills);
      });
  }

  get billsObservable(): Observable<Bill[]> {
    return this.billsSubject.asObservable();
  }

  private fetch(): Observable<Bill[]> {
    return of([]);
  }

  fetchItem(id: number): Observable<Bill> {
    return of(null);
  }

  private createBillData(bill: any): Bill {
    if (bill.id === undefined) {
      if (this.bills && this.bills.length) {
        bill.id = Math.max(...this.bills.map(b => b.id)) + 1;
      } else { bill.id = 0; }
    }
    const result: Bill = {
      lp: bill.lp || bill.id,
      id: bill.id,
      name: bill.name || '',
      description: bill.description || '',
      active: bill.active || false,
      sum: bill.sum || 0,
      share: bill.share || 1,
      deadline: dateToTimestamp(bill.deadline || new Date()),
      reminder: dateToTimestamp(bill.reminder || addDays(-7, bill.deadline)),
      repeat: bill.repeat || 1,
      unit: bill.unit || Unit.Month,
      url: bill.url || '',
      login: bill.login || '',
      password: bill.password || ''
    };
    if (result.reminder > result.deadline) {
      result.reminder = dateToTimestamp(addDays(-7, result.deadline));
    }
    if (bill.uid) { result.uid = bill.uid; }
    return result;
  }

  add(bill: Bill): Observable<number> {
    return of(0);
  }

  update(bill: Bill): Observable<void> {
    return of();
  }

  delete(bill: Bill): Observable<void> {
    return of();
  }

  calculateNextDeadline(bill: Bill): Date {
    const deadline = moment(bill.deadline);
    let result: Moment;
    switch (bill.unit) {
      case Unit.Day:
        result = deadline.add(bill.repeat, 'day');
        break;
      case Unit.Month:
        result = deadline.add(bill.repeat, 'month');
        break;
      case Unit.Week:
        result = deadline.add(bill.repeat, 'week');
        break;
      case Unit.Year:
        deadline.add(bill.repeat, 'year');
        break;
      default:
        break;
    }
    return result?.toDate();
  }

  pay(bill: Bill, paid: number) {
    const payment = this.createPaymentData(bill, paid);
    const billCopy = this.createBillData(bill);
    let schedule: Schedule;
    return this.db.firestore.runTransaction(transaction => {
      return this.schedulesService.fetchComming(bill).then(sch => {
        schedule = sch;
        this.paymentsService.addInTransaction(payment, billUid, transaction);
        this.adjustBillData(billCopy, schedule);
        if (schedule) { this.schedulesService.deleteInTransaction(schedule, billUid, transaction); }
        this.updateInTransaction(billCopy, transaction);
      });
    });
  }

  private createPaymentData(bill: Bill, paid: number): Payment {
    return this.paymentsService.createPaymentData({
      deadline: bill.deadline,
      paiddate: new Date(),
      sum: paid,
      share: paid * bill.share,
      remarks: undefined
    });
  }

  private adjustBillData(billCopy: Bill, schedule: Schedule): Bill {
    const deadline = schedule ? schedule.date : this.calculateNextDeadline(billCopy);
    const sum = schedule ? schedule.sum : billCopy.sum; // consider remarks
    billCopy.deadline = deadline;
    billCopy.reminder = addDays(-7, deadline.toDate());
    billCopy.sum = sum;
    return billCopy;
  }

}
