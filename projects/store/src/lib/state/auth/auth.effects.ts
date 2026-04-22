import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AuthService } from 'model';
import { of } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { NavigationService, NotificationService } from 'tools';
import { SupabaseService } from '../../../../../bills-main-app/src/app/services/supabase.service';
import { AppState } from '../app/app.state';
import { AuthActions } from '../auth';
import { BillsActions, BillsSelectors } from '../bill';
import { PaymentsActions } from '../payment';

@Injectable()
export class AuthEffects {

  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private supabaseService = inject(SupabaseService);
  private store = inject(Store<AppState>);
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
    this.supabaseService.authEvents$.pipe(
      filter(({ event }) => event === 'TOKEN_REFRESHED'),
      debounceTime(500),
      withLatestFrom(this.store.select(BillsSelectors.selectBill)),
      mergeMap(([, currentBill]) => {
        const actions = [BillsActions.loadOverviewBills()];
        if (currentBill?.id != null) {
          actions.push(PaymentsActions.loadPayments({ billId: currentBill.id }) as any);
        }
        return actions;
      })
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
