import { createAction, props } from '@ngrx/store';
import { Schedule } from 'projects/model/src/lib/model';

export const SchedulesActions = {

  loadSchedules: createAction(
    '[Schedules] Load',
    props<{ billId: number }>()
  ),

  updateSchedule: createAction(
    '[Schedules] Update Schedule',
    props<{ schedule: Schedule }>()
  ),

  createSchedule: createAction(
    '[Schedules] Create Schedule',
    props<{ schedule: Schedule }>()
  ),

  deleteSchedule: createAction(
    '[Schedules] Delete Schedule',
    props<{ schedule: Schedule }>()
  ),

};
