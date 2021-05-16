import { Injectable } from '@angular/core';
import { Payment, PaymentsService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

function createPayment(
  id: number,
  deadline: Date,
  sum: number,
  share: number,
  paiddate: Date,
  remarks: string,
  billId: number): Payment {
  const result = new Payment(deadline, sum, share, paiddate, remarks, billId);
  result.id = id;
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentsServiceImpl extends PaymentsService {

  private payments: Payment[] = [
    createPayment(1, new Date(), 25, 1, new Date(), 'pierwsza płatność za gaz', 1),
    createPayment(2, new Date(), 35, 0.5, new Date(), 'druga płatność za gaz', 1),
    createPayment(3, new Date(), 15, 0.25, new Date(), 'trzecia płatność za gaz', 1),
    createPayment(4, new Date(), 100, 1, new Date(), 'pierwsza płatność za prąd', 2),
    createPayment(5, new Date(), 200, 0.5, new Date(), 'druga płatność za prąd', 2),
    createPayment(6, new Date(), 300, 0.25, new Date(), 'trzecia płatność za prąd', 2),
  ];

  constructor() { super(); }

  load(billId: number): Observable<Payment[]> {
    return of(this.payments.filter(p => p.billId === billId)).pipe(delay(1000));
  }

  createPaymentData(payment: Payment): Payment {
    const payments = this.payments.filter(p => p.billId === payment.billId);
    const ids = payments.map(p => p.id).sort((a: number, b: number) => a > b ? 1 : -1);
    const id = ids.length ? ids[ids.length - 1] + 1 : 1;
    return { ...payment, id };
  }

  add(payment: Payment): Observable<number> {
    const result = this.createPaymentData(payment);
    this.modifyPayments((payments: Payment[]) => payments.push(result));
    return of(result.id).pipe(delay(1000));
  }

  update(payment: Payment): Observable<boolean> {
    const index = this.payments.findIndex(p => p.id === payment.id);
    if (index > -1) {
      this.modifyPayments((payments: Payment[]) => payments[index] = payment);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  delete(payment: Payment): Observable<boolean> {
    const index = this.payments.findIndex(p => p === payment);
    if (index > -1) {
      this.modifyPayments((payments: Payment[]) => payments.splice(index, 1));
      return of(true).pipe(delay(1000));
    } else {
      return of(false).pipe(delay(1000));
    }
  }

  private modifyPayments(operation: (payments: Payment[]) => void): void {
    const payments = [...this.payments];
    operation(payments);
    this.payments = payments;
  }

}
