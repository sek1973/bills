import { Injectable } from '@angular/core';
import { Payment, PaymentsService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class PaymentsServiceImpl extends PaymentsService {

  constructor() { super(); }

  load(billId: number): Observable<Payment[]> { return of([]); }

  createPaymentData(payment: Payment): Payment { return new Payment(); }

  add(payment: Payment): Observable<number> { return of(0); }

  update(payment: Payment): Observable<void> { return of(); }

  delete(payment: Payment): Observable<void> { return of(); }

}
