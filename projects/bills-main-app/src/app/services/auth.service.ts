import { inject, Injectable } from '@angular/core';
import { AuthService } from 'projects/model/src/public-api';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthServiceImpl extends AuthService {
  private authStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  private service = inject(SupabaseService);

  constructor() { super(); }

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
