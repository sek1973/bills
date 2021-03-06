import { createAction, props } from '@ngrx/store';
import { Schedule } from 'projects/model/src/lib/model';
import { ImportReport } from 'projects/model/src/public-api';

export const ScheduleApiActions = {

  loadSchedulesSuccess: createAction(
    '[Schedule API] Load Success',
    props<{ schedules: Schedule[] }>()
  ),

  loadSchedulesFailure: createAction(
    '[Schedule API] Load Failure',
    props<{ error: string }>()
  ),

  updateScheduleSuccess: createAction(
    '[Schedule API] Update Schedule Success',
    props<{ schedule: Schedule }>()
  ),

  updateScheduleFailure: createAction(
    '[Schedule API] Update Schedule Failure',
    props<{ error: string }>()
  ),

  createScheduleSuccess: createAction(
    '[Schedule API] Create Schedule Success',
    props<{ schedule: Schedule }>()
  ),

  createScheduleFailure: createAction(
    '[Schedule API] Create Schedule Failure',
    props<{ error: string }>()
  ),

  deleteScheduleSuccess: createAction(
    '[Schedule API] Delete Schedule Success',
    props<{ billId: number }>()
  ),

  deleteScheduleFailure: createAction(
    '[Schedule API] Delete Schedule Failure',
    props<{ error: string }>()
  ),

  importSchedulesSuccess: createAction(
    '[Schedule API] Import Schedules Success',
    props<{ billId: number, report: string | ImportReport[] }>()
  ),

  importSchedulesFailure: createAction(
    '[Schedule API] Import Schedules Failure',
    props<{ error: string }>()
  ),

};
