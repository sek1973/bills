import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { currencyToNumber, stringToDate } from '../helpers';
import { Schedule } from '../model';

@Injectable({
  providedIn: 'root',
})
export abstract class SchedulesService {

  constructor() { }

  abstract fetchComming(billId: number): Observable<Schedule | undefined>;

  abstract load(billId: number): Observable<Schedule[]>;

  abstract add(schedule: Schedule): Observable<number>;

  abstract update(schedule: Schedule): Observable<boolean>;

  abstract delete(schedule: Schedule): Observable<boolean>;

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
      const schedule: Schedule = new Schedule(date, sum);
      if (remarks) { schedule.remarks = remarks; }
    }
    return undefined;
  }

}
