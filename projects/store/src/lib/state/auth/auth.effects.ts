import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from 'projects/model/src/public-api';
import { NavigationService, NotificationService } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { AuthActions } from '../auth';
import { BillsActions } from '../bill';

@Injectable()
export class AuthEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private navigationService = inject(NavigationService);

  login$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        switchMap(userData => this.authService.login(userData.user, userData.password)
          .pipe(
            switchMap(success => {
              if (success) {
                this.notification.success('Zalogowano do aplikacji!');
                this.navigationService.goToPreviousPage('/zestawienie');
                return of(AuthActions.loginSuccess({ user: userData.user }));
              } else {
                this.notification.error('Błąd logowania. Sprawdź dane i spróbuj ponownie.');
                return of(AuthActions.loginFailure({ error: 'Invalid credentials' }));
              }
            }),
            catchError(error => {
              this.notification.error('Błąd logowania. Sprawdź dane i spróbuj ponownie.');
              return of(AuthActions.loginFailure({ error }));
            })
          )
        )
      );
  });

  loginSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.loginSuccess),
        switchMap(() => of(BillsActions.loadBills())));
  });

  logout$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.logout),
        concatMap(() => this.authService.logout()
          .pipe(
            map(() => {
              this.navigationService.goToPage('/login');
              this.notification.success('Wylogowano z aplikacji!');
            }),
            map(() => AuthActions.logoutSuccess()),
            catchError(error => of(AuthActions.logoutFailure({ error })))
          )
        )
      );
  });

}
