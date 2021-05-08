import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'projects/model/src/public-api';
import { NavigationService } from 'projects/tools/src/public-api';
import { of } from 'rxjs';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { AppState } from '../app';
import { AuthActions } from '../auth';
import { BillsActions } from '../bill';

@Injectable()
export class AuthEffects {

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    private navigationService: NavigationService) { }

  login$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(AuthActions.login),
        switchMap(userData => this.authService.login(userData.user, userData.password)
          .pipe(
            map(() => this.snackBar.open('Zalogowano do aplikacji!', 'Ukryj', { duration: 3000 })),
            map(() => this.navigationService.goToPreviousPage('/zestawienie')),
            map(() => this.store.dispatch(BillsActions.loadBills())),
            map(() => AuthActions.loginSuccess({ user: userData.user })),
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
