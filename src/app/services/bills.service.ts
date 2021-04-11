import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { addDays, } from 'src/app/helpers';
import { Bill } from '../model/bill';
import { Payment } from '../model/payment';
import { Schedule } from '../model/schedule';
import { Unit } from '../model/unit';
import { PaymentsService } from './payments.service';
import { SchedulesService } from './schedules.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BillsService {

  constructor(
    private paymentsService: PaymentsService,
    private schedulesService: SchedulesService) { }

  abstract load(): Observable<Bill[]>;

  fetchItem(id: number): Observable<Bill | null> {
    return of(null);
  }

  private createBillData(bill: any): Bill {
    if (bill.id === undefined) {
      if (this.bills && this.bills.length) {
        bill.id = Math.max(...this.bills.map(b => b.id ? b.id : 0)) + 1;
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
      deadline: bill.deadline || new Date(),
      reminder: bill.reminder || addDays(-7, bill.deadline),
      repeat: bill.repeat || 1,
      unit: bill.unit || Unit.Month,
      url: bill.url || '',
      login: bill.login || '',
      password: bill.password || ''
    };
    if (result.reminder && result.reminder > result.deadline) {
      result.reminder = addDays(-7, result.deadline);
    }
    return result;
  }

  abstract add(bill: Bill): Observable<number>;

  abstract update(bill: Bill): Observable<void>;

  abstract delete(billId: number): Observable<void>;

  calculateNextDeadline(bill: Bill): Date {
    const result = bill.deadline;
    switch (bill.unit) {
      case Unit.Day:
        result.setDate(result.getDate() + bill.repeat);
        break;
      case Unit.Month:
        result.setMonth(result.getMonth() + bill.repeat);
        break;
      case Unit.Week:
        result.setDate(result.getDate() + 7 * bill.repeat);
        break;
      case Unit.Year:
        result.setFullYear(result.getFullYear() + bill.repeat);
        break;
      default:
        break;
    }
    return result;
  }

  pay(bill: Bill, paid: number): Observable<void> {
    const payment = this.createPaymentData(bill, paid);
    const billCopy = this.createBillData(bill);
    let schedule: Schedule | undefined;
    return this.schedulesService.fetchComming(bill.id).pipe(switchMap(sch => {
      schedule = sch;
      this.paymentsService.add(payment, bill?.id || 0);
      this.adjustBillData(billCopy, schedule);
      if (schedule) { this.schedulesService.delete(schedule, bill?.id || 0); }
      return this.update(billCopy);
    }));
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

  private adjustBillData(billCopy: Bill, schedule?: Schedule): Bill {
    const deadline = schedule ? schedule.date : this.calculateNextDeadline(billCopy);
    const sum = schedule ? schedule.sum : billCopy.sum; // consider remarks
    billCopy.deadline = deadline;
    billCopy.reminder = addDays(-7, deadline);
    billCopy.sum = sum;
    return billCopy;
  }

}
