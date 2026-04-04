import { inject, Injectable } from '@angular/core';
import { AuthService } from 'projects/model/src/public-api';
import { from, Observable, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthServiceImpl extends AuthService {
  private authStateSubject = new ReplaySubject<boolean>(1);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  private service = inject(SupabaseService);

  constructor() {
    super();

    // Resolve the real session before emitting anything — prevents the guard
    // from seeing the false initial value on a direct URL / page refresh.
    this.service.client.auth.getSession().then(({ data }) => {
      this.authStateSubject.next(data.session !== null);
    });

    // Keep in sync with subsequent Supabase auth events (login, logout, token refresh).
    this.service.client.auth.onAuthStateChange((_, session) => {
      this.authStateSubject.next(session !== null);
    });
  }

  login(user: string, password: string): Observable<boolean> {
    return from(this.service.signInWithEmail(user, password)).pipe(
      map(result => {
        if (result.error) {
          this.authStateSubject.next(false);
          console.error('Login error:', result.error.message);
          return false;
        } else {
          this.authStateSubject.next(true);
          return true;
        }
      })
    );
  }

  logout(): Observable<boolean> {
    return from(this.service.signOut()).pipe(
      map(result => {
        if (result.error) {
          this.authStateSubject.next(false);
          console.error('Logout error:', result.error.message);
          return false;
        } else {
          this.authStateSubject.next(false);
          return true;
        }
      }));
  }

  getUserName(): Observable<string> {
    return of('');
  }

  resetPassword(email: string): Observable<boolean> {
    const redirectTo = `${window.location.origin}/nowe-haslo`;
    return from(this.service.resetPasswordForEmail(email, redirectTo)).pipe(
      map(result => {
        if (result.error) {
          console.error('Reset password error:', result.error.message);
          return false;
        }
        return true;
      })
    );
  }

  updatePassword(password: string): Observable<boolean> {
    return from(this.service.updatePassword(password)).pipe(
      map(result => {
        if (result.error) {
          console.error('Update password error:', result.error.message);
          return false;
        }
        return true;
      })
    );
  }

}
