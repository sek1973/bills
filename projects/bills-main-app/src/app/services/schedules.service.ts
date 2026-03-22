import { inject, Injectable } from '@angular/core';
import { Schedule, SchedulesService } from 'projects/model/src/public-api';
import { from, map, Observable } from 'rxjs';
import { ScheduleRow } from './db.types';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class SchedulesServiceImpl extends SchedulesService {

  private serverService: SupabaseService = inject(SupabaseService);

  fetchComming(billId: number): Observable<Schedule | undefined> {
    return from(
      this.serverService.client.from('schedules').select<'*', ScheduleRow>('*')
        .eq('bill_id', billId)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(1)
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data?.length ? this.fromRow(data[0]) : undefined;
      })
    );
  }

  load(billId: number): Observable<Schedule[]> {
    return from(this.serverService.client.from('schedules').select<'*', ScheduleRow>('*').eq('bill_id', billId)).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.map(r => this.fromRow(r));
      })
    );
  }

  add(schedule: Schedule): Observable<number> {
    return from(this.serverService.client.from('schedules').insert(this.toRow(schedule)).select('id').single<ScheduleRow>()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data.id;
      })
    );
  }

  update(schedule: Schedule): Observable<boolean> {
    return from(this.serverService.client.from('schedules').update(this.toRow(schedule)).eq('id', schedule.id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

  private fromRow(r: ScheduleRow): Schedule {
    return new Schedule(
      r.date ? new Date(r.date) : undefined,
      r.sum,
      r.remarks ?? undefined,
      r.bill_id,
      r.id,
    );
  }

  private toRow(schedule: Schedule): Omit<ScheduleRow, 'id'> {
    return {
      date: schedule.date?.toISOString() ?? null,
      sum: schedule.sum,
      remarks: schedule.remarks ?? null,
      bill_id: schedule.billId,
    };
  }

  delete(schedule: Schedule): Observable<boolean> {
    return from(this.serverService.client.from('schedules').delete().eq('id', schedule.id)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return true;
      })
    );
  }

}
