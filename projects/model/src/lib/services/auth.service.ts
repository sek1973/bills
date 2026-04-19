import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class AuthService {
  public abstract authState$: Observable<boolean>;
  /** Emits (void) whenever the Supabase session token is silently refreshed. */
  public abstract sessionRestored$: Observable<void>;

  constructor() { }

  abstract login(user: string, password: string): Observable<boolean>;

  abstract logout(): Observable<boolean>;

  abstract getUserName(): Observable<string>;

  abstract resetPassword(email: string): Observable<boolean>;

  abstract updatePassword(password: string): Observable<boolean>;

}
