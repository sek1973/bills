import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { currencyToNumber, stringToDate } from '../helpers';
import { Bill } from '../model/bill';
import { Schedule } from '../model/schedule';

@Injectable({
  providedIn: 'root',
})
export class SchedulesService {

  constructor() { }

  fetchComming(bill: Bill): Observable<Schedule | null> {
    return of(null);
  }

  fetch(billId: string): Observable<Schedule[]> {
    return of([]);
  }

  private createScheduleData(schedule: any): Schedule {
    const result: Schedule = {
      date: schedule.date || new Date(),
      sum: schedule.sum || 0,
      remarks: schedule.remarks || '',
    };
    if (schedule.uid) { result.id = schedule.uid; }
    return result;
  }

  add(schedule: Schedule, billId: string): Observable<number> {
    return of(0);
  }

  update(schedule: Schedule, billId: string): Observable<void> {
    return of();
  }

  delete(schedule: Schedule, billId: string): Observable<void> {
    return of();
  }

  importSchedules(data: string, billId: string, lineSeparator: string = '\n', columnSeparator: string = '\t'): Observable<void> {
    const payments: Schedule[] = []
    const errors: string[] = [];
    data.split(lineSeparator).forEach((line, index) => {
      const payment = this.parseSchedule(line, columnSeparator);
      if (payment) {
        payments.push(payment);
      } else {
        errors.push(`Nie można zaimportować wiersza (${index + 1}): ${line}`);
      }
    });
    if (errors.length) { return throwError(errors); }
    return of();
  }

  private parseSchedule(text: string, columnSeparator: string = '\t'): Schedule | undefined {
    const cells = text.split(columnSeparator);
    const date: Date | undefined = stringToDate(cells[0]);
    const sum: number | undefined = currencyToNumber(cells[1]);
    const remarks: string = cells[2];
    if (date && sum) {
      const schedule: Schedule = {
        date: date,
        sum: sum
      };
      if (remarks) { schedule.remarks = remarks; }
    }
    return undefined;
  }

}
