import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthService } from 'projects/model/src/public-api';
import { AppState, AuthActions } from 'projects/store/src/lib/state';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthServiceImpl extends AuthService {
  private authStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  constructor(private store: Store<AppState>) {
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

}
