import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
            switchMap(success => {
              if (success) {
                this.snackBar.open('Zalogowano do aplikacji!', 'Ukryj', { duration: 3000, panelClass: 'snackbar-style-success' });
                this.navigationService.goToPreviousPage('/zestawienie');
                return of(AuthActions.loginSuccess({ user: userData.user }));
              } else {
                this.snackBar.open('Błąd logowania. Sprawdź dane i spróbuj ponownie.', 'Ukryj', { duration: 5000, panelClass: 'snackbar-style-error' });
                return of(AuthActions.loginFailure({ error: 'Invalid credentials' }));
              }
            }),
            catchError(error => {
              this.snackBar.open('Błąd logowania. Sprawdź dane i spróbuj ponownie.', 'Ukryj', { duration: 5000, panelClass: 'snackbar-style-error' });
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
              this.snackBar.open('Wylogowano z aplikacji!', 'Ukryj', { duration: 3000, panelClass: 'snackbar-style-success' });
            }),
            map(() => AuthActions.logoutSuccess()),
            catchError(error => of(AuthActions.logoutFailure({ error })))
          )
        )
      );
  });

}
