import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Bill } from 'src/app/model/bill';
import { BillsFirebaseService } from './bills.service';


@Injectable()
export class ReminderService {
  private bills: Bill[] = [];
  private timerId: any;
  private subscription = Subscription.EMPTY;
  /** interval in minutes */
  public interval = 1;

  constructor(private billsFirebaseService: BillsFirebaseService) {
  }

  private pushReminder(): void {
    if (this.bills && this.bills.length) {
      const reminders = this.bills.filter(bill => {
        return (
          bill.reminder && bill.reminder <= new Date()
          && bill.active
          && bill.deadline > new Date());
      });
      if (reminders.length) {
        console.log(`Przypomnienie o płatności dla ${reminders.length} rachunku(ów)`);
      }
      const overdued = this.bills.filter(bill => {
        return bill.deadline <= new Date() && bill.active;
      });
      if (overdued.length) {
        console.log(`Zaległe płatności dla ${overdued.length} rachunku(ów)`);
      }
    }
  }

  public start(): void {
    this.subscription.unsubscribe();
    this.subscription = this.billsFirebaseService.billsObservable.subscribe((bills) =>
      this.bills = bills
    );
    this.timerId = setInterval(() => this.pushReminder(), this.interval * 1000 * 60);
  }

  public stop(): void {
    this.subscription.unsubscribe();
    clearInterval(this.timerId);
  }
}
