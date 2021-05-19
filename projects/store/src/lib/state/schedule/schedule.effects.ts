import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SchedulesService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { ScheduleApiActions } from './schedule-api.actions';
import { SchedulesActions } from './schedule.actions';

@Injectable()
export class ScheduleEffects {

  constructor(
    private actions$: Actions,
    private schedulesService: SchedulesService,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  loadSchedules$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.loadSchedules),
        mergeMap(action => this.schedulesService.load(action.billId)
          .pipe(
            map(schedules => ScheduleApiActions.loadSchedulesSuccess({ schedules })),
            catchError(error => of(ScheduleApiActions.loadSchedulesFailure({ error })))
          )
        )
      );
  });

  updateSchedule$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.updateSchedule),
        concatMap(action =>
          this.schedulesService.update(action.schedule)
            .pipe(
              map(() => ScheduleApiActions.updateScheduleSuccess({ schedule: action.schedule })),
              catchError(error => of(ScheduleApiActions.updateScheduleFailure({ error })))
            )
        )
      );
  });

  updateScheduleSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(ScheduleApiActions.updateScheduleSuccess),
        map(action => {
          this.snackBar.open('Zapisano zmiany dla planowanej płatności', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(SchedulesActions.loadSchedules({ billId: action.schedule.billId || -1 }))));
  });

  createSchedule$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.createSchedule),
        concatMap(action =>
          this.schedulesService.add(action.schedule)
            .pipe(
              map(() => ScheduleApiActions.createScheduleSuccess({ schedule: action.schedule })),
              catchError(error => of(ScheduleApiActions.createScheduleFailure({ error })))
            )
        )
      );
  });

  createScheduleSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(ScheduleApiActions.createScheduleSuccess),
        map(action => {
          this.snackBar.open('Utworzono nową planowaną płatność', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(SchedulesActions.loadSchedules({ billId: action.schedule.billId || -1 }))));
  });

  deleteSchedule$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.deleteSchedule),
        filter(action => action.schedule.id >= 0),
        mergeMap(action => this.confirmationService
          .confirm('Usuń planowaną płatność',
            'Czy na pewno chcesz usunąć bieżącą planowaną płatność? Operacji nie będzie można cofnąć!', 'Nie', 'Tak')
          .pipe(
            filter(response => !!response),
            map(() => SchedulesActions.deleteScheduleConfirmed({ schedule: action.schedule }))
          )
        )
      );
  });

  deleteScheduleConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.deleteScheduleConfirmed),
        switchMap(action => this.schedulesService.delete(action.schedule)
          .pipe(map(() => ScheduleApiActions.deleteScheduleSuccess({ billId: action.schedule.billId || -1 })),
            catchError(error => of(ScheduleApiActions.deleteScheduleFailure({ error })))
          )));
  });

  deleteScheduleSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(ScheduleApiActions.deleteScheduleSuccess),
        map(action => {
          this.snackBar.open('Usunięto płatność', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(SchedulesActions.loadSchedules({ billId: action.billId }))));
  });

  importSchedules$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.importSchedules),
        mergeMap(action => this.confirmationService
          .confirm('Importuj planowane płatności',
            'Wklej ze schowka lub wpisz dane w poniższe pole a następnie naciśnij importuj.', 'Anuluj', 'Importuj',
            ConfirmDialogInputType.InputTypeTextArea, undefined, [Validators.required], 'Dane', 'Dane')
          .pipe(
            filter(response => !!response),
            map(response => {
              const data = (response as ConfirmDialogResponse).value as string;
              if (!data || data === null || data === undefined || data === '') {
                this.snackBar.open('Brak danych do zaimportowania', 'Ukryj', { duration: 3000 });
                return ScheduleApiActions.importSchedulesFailure({ error: 'Brak danych do zaimportowania' });
              } else {
                return SchedulesActions.importSchedulesConfirmed({ data, billId: action.billId });
              }
            })
          )
        )
      );
  });

  importPaymentsConfirmed$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SchedulesActions.importSchedulesConfirmed),
        switchMap(action => this.schedulesService.importSchedules(action.data, action.billId)
          .pipe(map(report => ScheduleApiActions.importSchedulesSuccess({ report, billId: action.billId })),
            catchError(error => of(ScheduleApiActions.importSchedulesFailure({ error })))
          )));
  });

  importPaymentsSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(ScheduleApiActions.importSchedulesSuccess),
        map(action => {
          this.snackBar.open('Zaimportowano planowane płatności', 'Ukryj', { duration: 3000 });
          return action;
        }),
        switchMap(action => of(SchedulesActions.loadSchedules({ billId: action.billId }))));
  });

}
