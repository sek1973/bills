import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import { currencyToNumber, stringToDate } from '../helpers';
import { Bill } from '../model/bill';
import { Schedule } from '../model/schedule';

@Injectable({
  providedIn: 'root',
})
export abstract class SchedulesService {

  constructor() { }

  abstract fetchComming(billId: number): Observable<Schedule | undefined>;

  abstract fetch(billId: number): Observable<Schedule[]>;

  protected createScheduleData(schedule: any): Schedule {
    const result: Schedule = {
      date: schedule.date || new Date(),
      sum: schedule.sum || 0,
      remarks: schedule.remarks || '',
    };
    if (schedule.uid) { result.id = schedule.uid; }
    return result;
  }

  abstract add(schedule: Schedule, billId: number): Observable<number>;

  abstract update(schedule: Schedule, billId: number): Observable<void>;

  abstract delete(schedule: Schedule, billId: number): Observable<void>;

  importSchedules(data: string, lineSeparator: string = '\n', columnSeparator: string = '\t'): { schedules: Schedule[], errors: string[] } {
    const schedules: Schedule[] = [];
    const errors: string[] = [];
    data.split(lineSeparator).forEach((line, index) => {
      const payment = this.parseSchedule(line, columnSeparator);
      if (payment) {
        schedules.push(payment);
      } else {
        errors.push(`Nie można zaimportować wiersza (${index + 1}): ${line}`);
      }
    });
    return { schedules, errors };
  }

  private parseSchedule(text: string, columnSeparator: string = '\t'): Schedule | undefined {
    const cells = text.split(columnSeparator);
    const date: Date | undefined = stringToDate(cells[0]);
    const sum: number | undefined = currencyToNumber(cells[1]);
    const remarks: string = cells[2];
    if (date && sum) {
      const schedule: Schedule = { date, sum };
      if (remarks) { schedule.remarks = remarks; }
    }
    return undefined;
  }

}
