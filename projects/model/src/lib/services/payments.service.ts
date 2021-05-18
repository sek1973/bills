import { Injectable } from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { bufferCount, catchError, map } from 'rxjs/operators';
import { currencyToNumber, stringToDate } from '../helpers';
import { Payment } from '../model';
import { ImportReport } from './common';

@Injectable({
  providedIn: 'root',
})
export abstract class PaymentsService {

  constructor() { }

  abstract load(billId: number): Observable<Payment[]>;

  abstract createPaymentData(payment: Payment): Payment;

  abstract add(payment: Payment): Observable<number>;

  abstract update(payment: Payment): Observable<boolean>;

  abstract delete(payment: Payment): Observable<boolean>;

  importPayments(data: string, billId: number, lineSeparator: string = '\n', columnSeparator: string = '\t'):
    Observable<ImportReport[]> {
    const requests: Observable<ImportReport>[] = [];
    const errors: string[] = [];
    data.split(lineSeparator).forEach((line, index) => {
      const payment = this.parsePayment(line, billId, columnSeparator);
      if (payment) {
        const request: Observable<ImportReport> = this.add(payment).pipe(
          map(id => ({ id })),
          catchError(e => of({ error: e.toString() })));
        requests.push(request);
      } else {
        requests.push(of({ error: `Nie można zaimportować wiersza (${index + 1}): ${line}` }));
      }
    });
    return requests.length ? concat(...requests).pipe(bufferCount(requests.length)) : of([]);
  }

  private parsePayment(text: string, billId: number, columnSeparator: string = '\t'): Payment | undefined {
    const cells = text.split(columnSeparator);
    const deadline: Date | undefined = stringToDate(cells[0]);
    const paiddate: Date | undefined = stringToDate(cells[1]);
    const sum: number | undefined = currencyToNumber(cells[2]);
    const share: number | undefined = currencyToNumber(cells[3]);
    const remarks: string = cells[4];
    if (deadline && paiddate && sum !== undefined && share !== undefined) {
      return new Payment(deadline, sum, share, paiddate, remarks, billId);
    }
    return undefined;
  }

}
