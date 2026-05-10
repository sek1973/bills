import { Injectable } from '@angular/core';
import moment from 'moment';
import { concat, Observable, of } from 'rxjs';
import { bufferCount, catchError, map } from 'rxjs/operators';
import { currencyToNumber, stringToDate } from '../helpers';
import { Payment } from '../model';
import { IMPORT_COLUMN_SEPARATOR, IMPORT_LINE_SEPARATOR, ImportReport } from './common';

@Injectable({
  providedIn: 'root',
})
export abstract class PaymentsService {

  constructor() { }

  /** Loads all payments for a given bill from the data source */
  abstract load(billId: number): Observable<Payment[]>;

  /** Loads all payments across all bills from the data source */
  abstract loadAll(): Observable<Payment[]>;

  /** Creates a new payment data object but doesn't create it in the data source */
  abstract createPaymentData(payment: Payment): Payment;

  /** Adds a new payment to the data source */
  abstract add(payment: Payment): Observable<number>;

  /** Updates an existing payment in the data source */
  abstract update(payment: Payment): Observable<boolean>;

  /** Deletes a payment from the data source */
  abstract delete(payment: Payment): Observable<boolean>;

  /** Imports payments from a CSV string */
  importPayments(data: string, billId: number): Observable<ImportReport[]> {
    const requests: Observable<ImportReport>[] = [];
    data.split(IMPORT_LINE_SEPARATOR).forEach((line, index) => {
      const rowNumber = index + 1;
      const rawLabel = line.split(IMPORT_COLUMN_SEPARATOR)[0];
      const result = this.parsePayment(line, billId);
      if (result) {
        const { payment, warnings } = result;
        const request: Observable<ImportReport> = this.add(payment).pipe(
          map(id => ({ id, row: rowNumber, label: rawLabel })),
          catchError(e => {
            return of({
              error: (payment.deadline ? moment(payment.deadline).format('YYYY.MM.DD') : '')
                + ' - ' + (e.message ?? e.toString()),
              row: rowNumber,
              label: rawLabel
            })
          }));
        requests.push(request);
        warnings.forEach(w => requests.push(of({ warning: `Wiersz (${index + 1}): ${w}`, row: rowNumber, label: rawLabel })));
      } else {
        requests.push(of({ error: `Nie można zaimportować wiersza (${index + 1}): ${line}`, row: rowNumber, label: rawLabel }));
      }
    });
    return requests.length ? concat(...requests).pipe(bufferCount(requests.length)) : of([]);
  }

  private parsePayment(text: string, billId: number): { payment: Payment; warnings: string[] } | undefined {
    const cells = text.split(IMPORT_COLUMN_SEPARATOR);
    const warnings: string[] = [];
    const deadline: Date | undefined = stringToDate(cells[0]);
    const rawPaiddate = cells[1];
    const paiddate: Date | undefined = stringToDate(rawPaiddate);
    if (rawPaiddate && !paiddate) {
      warnings.push(`Nie można odczytać daty płatności: "${rawPaiddate}"`);
    }
    const rawSum = cells[2];
    const parsedSum = currencyToNumber(rawSum);
    if (parsedSum === undefined) {
      warnings.push(`Nie można odczytać kwoty: "${rawSum ?? ''}"; przyjęto 0`);
    }
    const sum: number = parsedSum ?? 0;
    const remarks: string = cells[3];
    if (deadline) {
      return { payment: new Payment(deadline, sum, paiddate, remarks, undefined, billId), warnings };
    }
    return undefined;
  }

}
