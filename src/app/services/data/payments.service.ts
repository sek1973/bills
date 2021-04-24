import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { currencyToNumber, stringToDate } from '../../helpers';
import { Payment } from '../../model/payment';

@Injectable({
  providedIn: 'root',
})
export abstract class PaymentsService {

  constructor() { }

  abstract load(billId: string): Observable<Payment[]>;

  abstract createPaymentData(payment: Payment): Payment;

  abstract add(payment: Payment, billId: number): Observable<number>;

  abstract update(payment: Payment, billId: number): Observable<void>;

  abstract delete(payment: Payment, billUid: string): Observable<void>;

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

  private parsePayment(text: string, columnSeparator: string = '\t'): Payment | undefined {
    const cells = text.split(columnSeparator);
    const deadline: Date | undefined = stringToDate(cells[0]);
    const paiddate: Date | undefined = stringToDate(cells[1]);
    const sum: number | undefined = currencyToNumber(cells[2]);
    const share: number | undefined = currencyToNumber(cells[3]);
    const remarks: string = cells[4];
    if (deadline && paiddate && sum !== undefined && share !== undefined) {
      const payment: Payment = new Payment(deadline, sum, share, paiddate, remarks);
      return payment;
    }
    return undefined;
  }

}
