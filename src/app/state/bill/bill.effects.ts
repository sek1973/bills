import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, map, mergeMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { BillsService } from 'src/app/services/bills.service';
import { BillApiActions, BillDetailsActions } from '.';
import { AuthActions } from '../auth';

@Injectable()
export class BillEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private snackBar: MatSnackBar) { }

  login$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        mergeMap((userName) => this.authService.login(userName)
          .pipe(
            map(() => AuthActions.loginSuccess()),
            map(() => this.snackBar.open('Zalogowano do aplikacji!', 'Ukryj', { duration: 3000 }),
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
            map(() => AuthActions.logoutSuccess()),
            map(() => this.snackBar.open('Wylogowano z aplikacji!', 'Ukryj', { duration: 3000 }),
              catchError(error => of(BillApiActions.updateBillFailure({ error })))
            )
          )
        );
  });

}
