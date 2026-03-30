import { inject, Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SchedulesService } from 'projects/model/src/public-api';
import { ConfirmationService, ConfirmDialogInputType, ConfirmDialogResponse, NotificationService } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { ScheduleApiActions } from './schedule-api.actions';
import { SchedulesActions } from './schedule.actions';

@Injectable()
export class ScheduleEffects {

  private actions$ = inject(Actions);
  private schedulesService = inject(SchedulesService);
  private confirmationService = inject(ConfirmationService);
  private notification = inject(NotificationService);

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
          this.notification.success('Zapisano zmiany dla planowanej płatności');
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
          this.notification.success('Utworzono nową planowaną płatność');
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
          this.notification.success('Usunięto płatność');
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
            'Wklej ze schowka lub wpisz dane w poniższe pole a następnie naciśnij importuj.\nFormat (kolumny oddzielone tabulatorem, wiersze nową linią): termin | kwota | uwagi', 'Anuluj', 'Importuj',
            ConfirmDialogInputType.InputTypeTextArea, undefined, [Validators.required], 'Dane', 'Dane')
          .pipe(
            filter(response => !!response),
            map(response => {
              const data = (response as ConfirmDialogResponse).value as string;
              if (!data || data === null || data === undefined || data === '') {
                this.notification.warning('Brak danych do zaimportowania');
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
          this.notification.success('Zaimportowano planowane płatności');
          return action;
        }),
        switchMap(action => of(SchedulesActions.loadSchedules({ billId: action.billId }))));
  });

  showScheduleError$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(
          ScheduleApiActions.loadSchedulesFailure,
          ScheduleApiActions.updateScheduleFailure,
          ScheduleApiActions.createScheduleFailure,
          ScheduleApiActions.deleteScheduleFailure
        ),
        map(({ error }) => {
          const message = error?.message || error;
          this.notification.error(`Wystąpił błąd podczas operacji na planowanej płatności: ${message}`);
        })
      );
  }, { dispatch: false });

}
