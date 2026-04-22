import { inject, Injectable } from '@angular/core';
import { AuthService } from '@bills/model';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AppState, AuthActions } from '../../../../store/src/lib/state';

@Injectable({ providedIn: 'root' })
export class AuthServiceImpl extends AuthService {
  private store = inject(Store<AppState>);
  private authStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();
  public sessionRestored$: Observable<void> = of(undefined);

  constructor() {
    super();
    setTimeout(() => this.store.dispatch(AuthActions.login({ user: 'user', password: 'password' })));
  }

  login(user: string, password: string): Observable<boolean> {
    this.authStateSubject.next(true);
    return of(true).pipe(delay(1000));
  }

  logout(): Observable<boolean> {
    this.authStateSubject.next(false);
    return of(false).pipe(delay(1000));
  }

  getUserName(): Observable<string> {
    return of('');
  }

  resetPassword(email: string): Observable<boolean> {
    return of(true).pipe(delay(1000));
  }

  updatePassword(password: string): Observable<boolean> {
    return of(true).pipe(delay(1000));
  }

}
