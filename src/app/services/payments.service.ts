import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { currencyToNumber, stringToDate } from '../helpers';
import { Bill } from '../model/bill';
import { Payment } from '../model/payment';
@Injectable({
  providedIn: 'root',
})
export class PaymentsService {

  constructor() { }

  fetch(uid: string): Observable<Payment[]> {    
    return of([]);
  }

  createPaymentData(payment: any): Payment {
    const result: Payment = {
      deadline: payment.deadline || new Date(),
      paiddate: payment.paiddate || undefined,
      sum: payment.sum,
      share: payment.share,
      remarks: payment.remarks || ''
    };
    if (payment.uid) { result.uid = payment.uid; }
    return result;
  }

  add(payment: Payment, billId: number): Observable<number> {
    return of(0);
  }

  update(payment: Payment, billId: number): Observable<void> {
    return of();
  }

  delete(payment: Payment, billUid: string): Observable<void> {
    return of();
  }

  importPayments(data: string, billId: number, lineSeparator: string = '\n', columnSeparator: string = '\t'): Observable<void> {
    const errors: string[] = [];
    data.split(lineSeparator).forEach((line, index) => {
        const payment = this.parsePayment(line, columnSeparator);
        if (payment) {
          try {
            this.add(payment, billId);
          } catch (error) {
            errors.push(`Nie można zaimportować wiersza (${index + 1}): ${line}`);
          }
        } else {
          errors.push(`Nie można zaimportować wiersza (${index + 1}): ${line}`);
        }
      });
      if (errors.length) { return throwError('Import zakończony z błędami:\n' + errors.join('\n')); }
      return of();    
  }

  private parsePayment(text: string, columnSeparator: string = '\t'): Payment {
    const cells = text.split(columnSeparator);
    const deadline: Date | undefined = stringToDate(cells[0]);
    const paiddate: Date | undefined = stringToDate(cells[1]);
    const sum: number | undefined = currencyToNumber(cells[2]);
    const share: number | undefined = currencyToNumber(cells[3]);
    const remarks: string = cells[4];
    const payment: Payment = {
      deadline: deadline,
      paiddate: paiddate,
      sum: sum,
      share: share
    };
    if (remarks) { payment.remarks = remarks; }
    return (deadline && paiddate && sum !== undefined && share !== undefined) ? payment : undefined;
  }

}
