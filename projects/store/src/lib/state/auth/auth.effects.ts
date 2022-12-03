import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from 'projects/model/src/public-api';
import { NavigationService } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { AuthActions } from '../auth';
import { BillsActions } from '../bill';

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private navigationService: NavigationService) { }

  login$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        switchMap(userData => this.authService.login(userData.user, userData.password)
          .pipe(
            map(() => this.snackBar.open('Zalogowano do aplikacji!', 'Ukryj', { duration: 3000 })),
            map(() => this.navigationService.goToPreviousPage('/zestawienie')),
            map(() => AuthActions.loginSuccess({ user: userData.user })),
            catchError(error => of(AuthActions.loginFailure({ error })))
          )
        )
      );
  });

  loginSuccess$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        switchMap(() => of(BillsActions.loadBills())));
  });

  logout$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.logout),
        concatMap(() => this.authService.logout()
          .pipe(
            map(() => this.snackBar.open('Wylogowano z aplikacji!', 'Ukryj', { duration: 3000 })),
            map(() => AuthActions.logoutSuccess()),
            catchError(error => of(AuthActions.logoutFailure({ error })))
          )
        )
      );
  });

}
