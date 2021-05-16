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

  createPaymentData(payment: Payment): Payment { return new Payment(); }

  add(payment: Payment): Observable<number> { return of(0); }

  update(payment: Payment): Observable<boolean> { return of(false); }

  delete(payment: Payment): Observable<boolean> { return of(false); }

}
