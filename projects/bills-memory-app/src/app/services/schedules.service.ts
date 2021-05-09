import { Injectable } from '@angular/core';
import { Schedule, SchedulesService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export abstract class SchedulesServiceImpl extends SchedulesService {

  constructor() { super(); }

  fetchComming(billId: number): Observable<Schedule | undefined> { return of(undefined); }

  fetch(billId: number): Observable<Schedule[]> { return of([]); }

  add(schedule: Schedule, billId: number): Observable<number> { return of(0); }

  update(schedule: Schedule, billId: number): Observable<boolean> { return of(false); }

  delete(schedule: Schedule, billId: number): Observable<boolean> { return of(false); }

}
