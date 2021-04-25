import { createAction, props } from '@ngrx/store';
import { Schedule } from 'src/app/model';

export const loadSchedules = createAction(
  '[Schedules] Load'
);

export const updateSchedule = createAction(
  '[Schedules] Update Schedule',
  props<{ schedule: Schedule }>()
);

export const createSchedule = createAction(
  '[Schedules] Create Schedule',
  props<{ schedule: Schedule }>()
);

export const deleteSchedule = createAction(
  '[Schedules] Delete Schedule',
  props<{ schedule: Schedule }>()
);
