import { inject, Injectable } from '@angular/core';
import { AuthService } from '@bills/model';
import { NavigationService, NotificationService } from '@bills/tools';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, concatMap, debounceTime, map, mergeMap, switchMap } from 'rxjs/operators';
import { AuthActions } from '../auth';
import { BillsActions } from '../bill';
import { PaymentsActions } from '../payment';

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
        switchMap(() => of(BillsActions.loadOverviewBills())));
  });

  // Reload data when the token is refreshed (normal expiry) or when connectivity
  // is explicitly restored after an outage.  The debounce prevents double-loading
  // if both sources fire on the same refresh.
  tokenRefreshed$ = createEffect(() =>
    this.authService.sessionRestored$.pipe(
      debounceTime(500),
      mergeMap(() => [BillsActions.loadOverviewBills(), PaymentsActions.loadAllPayments()])
    )
  );

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
            catchError(error => {
              this.navigationService.goToPage('/login');
              return of(AuthActions.logoutFailure({ error }));
            })
          )
        )
      );
  });

}
