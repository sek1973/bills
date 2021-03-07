import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Bill } from 'src/app/model/bill';

import { BillsFirebaseService } from './bills.firebase.service';

@Injectable()
export class ReminderService {
  private bills: Bill[] = [];
  private timerId: any;
  private subscription = Subscription.EMPTY;
  /** interval in minutes */
  public interval = 1;

  constructor(private billsFirebaseService: BillsFirebaseService) {
  }

  private pushReminder() {
    if (this.bills && this.bills.length) {
      const reminders = this.bills.filter(bill => {
        return (
          bill.reminder.toDate() <= new Date()
          && bill.active
          && bill.deadline.toDate() > new Date());
      });
      if (reminders.length) {
        console.log(`Przypomnienie o płatności dla ${reminders.length} rachunku(ów)`);
      }
      const overdued = this.bills.filter(bill => {
        return bill.deadline.toDate() <= new Date() && bill.active;
      });
      if (overdued.length) {
        console.log(`Zaległe płatności dla ${overdued.length} rachunku(ów)`);
      }
    }
  }

  public start() {
    this.subscription.unsubscribe();
    this.subscription = this.billsFirebaseService.billsObservable.subscribe((bills) =>
      this.bills = bills
    );
    this.timerId = setInterval(() => this.pushReminder(), this.interval * 1000 * 60);
  }

  public stop() {
    this.subscription.unsubscribe();
    clearInterval(this.timerId);
  }
}
