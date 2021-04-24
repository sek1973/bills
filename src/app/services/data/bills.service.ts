import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { addDays } from 'src/app/helpers';
import { Bill } from '../../model/bill';
import { Payment } from '../../model/payment';
import { Schedule } from '../../model/schedule';
import { Unit } from '../../model/unit';
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

  abstract fetchItem(id: number): Observable<Bill | null>;

  abstract getBills(): Bill[];

  abstract fetchBills(): Observable<Bill[]>;

  private createBillData(bill: any): Bill {
    if (bill.id === -1) {
      const bills = this.getBills();
      if (bills && bills.length) {
        bill.id = Math.max(...bills.map(b => b.id ? b.id : 0)) + 1;
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
    return new Payment(bill.deadline, paid, paid * bill.share, new Date());
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
