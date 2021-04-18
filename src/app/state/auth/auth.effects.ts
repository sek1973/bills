import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { AuthActions } from '../auth';

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private snackBar: MatSnackBar) { }

  login$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        switchMap(userData => this.authService.login(userData.user, userData.password)
          .pipe(
            map(() => this.snackBar.open('Zalogowano do aplikacji!', 'Ukryj', { duration: 3000 })),
            map(() => AuthActions.loginSuccess()),
            catchError(error => of(AuthActions.loginFailure({ error })))
          )
        )
      );
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
