import { createAction, props } from '@ngrx/store';
import { Schedule } from 'src/app/model';

export const loadSchedulesSuccess = createAction(
  '[Schedule API] Load Success',
  props<{ schedules: Schedule[] }>()
);

export const loadSchedulesFailure = createAction(
  '[Schedule API] Load Failure',
  props<{ error: string }>()
);

export const updateScheduleSuccess = createAction(
  '[Schedule API] Update Schedule Success',
  props<{ schedule: Schedule }>()
);

export const updateScheduleFailure = createAction(
  '[Schedule API] Update Schedule Failure',
  props<{ error: string }>()
);

export const createScheduleSuccess = createAction(
  '[Schedule API] Create Schedule Success',
  props<{ schedule: Schedule }>()
);

export const createScheduleFailure = createAction(
  '[Schedule API] Create Schedule Failure',
  props<{ error: string }>()
);

export const deleteScheduleSuccess = createAction(
  '[Schedule API] Delete Schedule Success',
  props<{ scheduleId: number }>()
);

export const deleteScheduleFailure = createAction(
  '[Schedule API] Delete Schedule Failure',
  props<{ error: string }>()
);
