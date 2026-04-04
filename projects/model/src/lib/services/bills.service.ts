import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Bill, Payment, Unit } from '../model';
import { PaymentsService } from './payments.service';

@Injectable({
  providedIn: 'root',
})
export abstract class BillsService {

  protected abstract paymentsService: PaymentsService;

  abstract load(): Observable<Bill[]>;

  abstract fetchItem(id: number): Observable<Bill | null>;

  abstract getBills(): Bill[];

  private createBillData(bill: Bill): Bill {
    if (bill.id === -1) {
      const bills = this.getBills();
      if (bills && bills.length) {
        bill.id = Math.max(...bills.map(b => b.id ? b.id : 0)) + 1;
      } else { bill.id = 0; }
    }
    const result: Bill = new Bill(
      bill.position ?? bill.id,
      bill.name || '',
      bill.description || '',
      bill.active || false,
      bill.url || '',
      bill.login || '',
      bill.sum || 0,
      bill.share || 1,
      bill.repeat || 1,
      bill.unit || Unit.Month,
      bill.id);
    return result;
  }

  abstract add(bill: Bill): Observable<Bill>;

  abstract update(bill: Bill): Observable<boolean>;

  abstract delete(billId: number): Observable<boolean>;

  abstract swapPositions(billIdA: number, newPositionA: number, billIdB: number, newPositionB: number): Observable<boolean>;

  pay(bill: Bill, paid: number, dueDate?: Date): Observable<boolean> {
    const payment = this.createPaymentData(bill, paid, dueDate);
    const billCopy = this.createBillData(bill);
    return this.paymentsService.add(payment).pipe(
      switchMap(() => this.update(billCopy))
    );
  }

  private createPaymentData(bill: Bill, paid: number, dueDate?: Date): Payment {
    return new Payment(dueDate ?? new Date(), paid, new Date(), undefined, undefined, bill.id);
  }

}
