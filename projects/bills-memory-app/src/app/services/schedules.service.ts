import { Injectable } from '@angular/core';
import { addDays, Schedule, SchedulesService } from 'projects/model/src/public-api';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

function createSchedule(
  id: number,
  date: Date,
  sum: number,
  remarks: string,
  billId: number): Schedule {
  const result = new Schedule(date, sum, remarks, billId);
  result.id = id;
  return result;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulesServiceImpl extends SchedulesService {

  private schedules: Schedule[] = [
    createSchedule(1, new Date(), 25, 'planowana płatność za gaz 1', 1),
    createSchedule(2, addDays(14), 50, 'planowana płatność za gaz 2', 1),
    createSchedule(3, addDays(28), 75, 'planowana płatność za gaz 3', 1),
    createSchedule(4, new Date(), 100, 'planowana płatność za wodę 1', 3),
    createSchedule(5, addDays(14), 125, 'planowana płatność za wodę 2', 3),
    createSchedule(6, addDays(28), 150, 'planowana płatność za wodę 3', 3),
  ];

  constructor() { super(); }

  fetchComming(billId: number): Observable<Schedule | undefined> { return of(undefined); }

  load(billId: number): Observable<Schedule[]> {
    return of(this.schedules.filter(s => s.billId === billId)).pipe(delay(1000));
  }

  createScheduleData(schedule: Schedule): Schedule {
    const id = this.findNextId(schedule.billId || -1);
    return { ...schedule, id };
  }

  add(schedule: Schedule): Observable<number> {
    const result = this.createScheduleData(schedule);
    this.modifySchedules((schedules: Schedule[]) => schedules.push(result));
    return of(result.id).pipe(delay(1000));
  }

  update(schedule: Schedule): Observable<boolean> {
    const index = this.schedules.findIndex(s => s.id === schedule.id);
    if (index > -1) {
      this.modifySchedules((schedules: Schedule[]) => schedules[index] = schedule);
      return of(true).pipe(delay(1000));
    }
    return of(false).pipe(delay(1000));
  }

  delete(schedule: Schedule): Observable<boolean> {
    const index = this.schedules.findIndex(s => s === schedule);
    if (index > -1) {
      this.modifySchedules((schedules: Schedule[]) => schedules.splice(index, 1));
      return of(true).pipe(delay(1000));
    } else {
      return of(false).pipe(delay(1000));
    }
  }

  private modifySchedules(operation: (schedules: Schedule[]) => void): void {
    const schedules = [...this.schedules];
    operation(schedules);
    this.schedules = schedules;
  }

  private findNextId(billId: number): number {
    const payments = this.schedules.filter(s => s.billId === billId);
    const ids = payments.map(s => s.id);
    ids.sort((a: number, b: number) => a > b ? 1 : -1);
    return ids.length ? ids[ids.length - 1] + 1 : 1;
  }

}
