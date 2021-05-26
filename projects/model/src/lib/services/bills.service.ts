import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { addDays, calculateNextDeadline } from '../helpers';
import { Bill, Payment, Schedule, Unit } from '../model';
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

  private createBillData(bill: any): Bill {
    if (bill.id === -1) {
      const bills = this.getBills();
      if (bills && bills.length) {
        bill.id = Math.max(...bills.map(b => b.id ? b.id : 0)) + 1;
      } else { bill.id = 0; }
    }
    const result: Bill = new Bill(
      bill.lp || bill.id,
      bill.name || '',
      bill.description || '',
      bill.active || false,
      bill.url || '',
      bill.login || '',
      bill.password || '',
      bill.sum || 0,
      bill.share || 1,
      bill.deadline || new Date(),
      bill.repeat || 1,
      bill.unit || Unit.Month,
      bill.reminder || addDays(-7, bill.deadline),
      bill.id);
    if (result.deadline && result.reminder && result.reminder > result.deadline) {
      result.reminder = addDays(-7, result.deadline);
    }
    return result;
  }

  abstract add(bill: Bill): Observable<Bill>;

  abstract update(bill: Bill): Observable<boolean>;

  abstract delete(billId: number): Observable<boolean>;

  calculateNextDeadline(bill: Bill): Date | undefined {
    return calculateNextDeadline(bill.deadline, bill.unit, bill.repeat);
  }

  pay(bill: Bill, paid: number): Observable<boolean> {
    const payment = this.createPaymentData(bill, paid);
    const billCopy = this.createBillData(bill);
    let schedule: Schedule | undefined;
    return this.schedulesService.fetchComming(bill.id)
      .pipe(switchMap(sch => {
        schedule = sch;
        this.paymentsService.add(payment);
        this.adjustBillData(billCopy, schedule);
        if (schedule) { this.schedulesService.delete(schedule); }
        return this.update(billCopy);
      }));
  }

  private createPaymentData(bill: Bill, paid: number): Payment {
    return new Payment(bill.deadline, paid, paid * bill.share, new Date(), undefined, bill.id);
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
