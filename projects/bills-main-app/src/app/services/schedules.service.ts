import { Injectable } from '@angular/core';
import { Schedule, SchedulesService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SchedulesServiceImpl extends SchedulesService {

  constructor() { super(); }

  fetchComming(billId: number): Observable<Schedule | undefined> { return of(undefined); }

  load(billId: number): Observable<Schedule[]> { return of([]); }

  add(schedule: Schedule): Observable<number> { return of(0); }

  update(schedule: Schedule): Observable<boolean> { return of(false); }

  delete(schedule: Schedule): Observable<boolean> { return of(false); }

}
