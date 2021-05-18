import { Injectable } from '@angular/core';
import { concat, Observable, of } from 'rxjs';
import { bufferCount, catchError, map } from 'rxjs/operators';
import { currencyToNumber, stringToDate } from '../helpers';
import { Schedule } from '../model';
import { ImportReport } from './common';

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

  importSchedules(data: string, billId: number, lineSeparator: string = '\n', columnSeparator: string = '\t'): Observable<ImportReport[]> {
    const requests: Observable<ImportReport>[] = [];
    const errors: string[] = [];
    data.split(lineSeparator).forEach((line, index) => {
      const schedule = this.parseSchedule(line, billId, columnSeparator);
      if (schedule) {
        const request: Observable<ImportReport> = this.add(schedule).pipe(
          map(id => ({ id })),
          catchError(e => of({ error: e.toString() })));
        requests.push(request);
      } else {
        requests.push(of({ error: `Nie można zaimportować wiersza (${index + 1}): ${line}` }));
      }
    });
    return requests.length ? concat(...requests).pipe(bufferCount(requests.length)) : of([]);
  }

  private parseSchedule(text: string, billId: number, columnSeparator: string = '\t'): Schedule | undefined {
    const cells = text.split(columnSeparator);
    const date: Date | undefined = stringToDate(cells[0]);
    const sum: number | undefined = currencyToNumber(cells[1]);
    const remarks: string = cells[2];
    if (date && sum) {
      return new Schedule(date, sum, remarks, billId);
    }
    return undefined;
  }

}
