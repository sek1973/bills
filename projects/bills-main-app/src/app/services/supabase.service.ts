import { Injectable, signal } from '@angular/core';
import { AuthChangeEvent, createClient, Provider, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // Sequential in-memory lock — prevents concurrent token refresh races in a
  // single-tab zoneless environment (replaces the noop that allowed races).
  private _refreshLock: Promise<void> = Promise.resolve();

  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          const next = this._refreshLock.then(() => fn());
          this._refreshLock = next.then(() => { }, () => { });
          return next;
        },
      },
    }
  );

  private readonly _session = signal<Session | null>(null);
  private readonly _user = signal<User | null>(null);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();

  private readonly _authEvents = new Subject<{ event: AuthChangeEvent; session: Session | null }>();
  /** Emits every Supabase auth event (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, …). */
  readonly authEvents$ = this._authEvents.asObservable();

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session ?? null);
      this._user.set(data.session?.user ?? null);
    }).catch(() => {
      this._session.set(null);
      this._user.set(null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session ?? null);
      this._user.set(session?.user ?? null);
      this._authEvents.next({ event, session });
    });
  }

  async signUpWithEmail(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signInWithEmail(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signInWithOtp(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  async signInWithProvider(provider: Provider, options?: { redirectTo?: string }) {
    return this.supabase.auth.signInWithOAuth({ provider: provider, options });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async resetPasswordForEmail(email: string, redirectTo: string) {
    return this.supabase.auth.resetPasswordForEmail(email, { redirectTo });
  }

  async updatePassword(password: string) {
    return this.supabase.auth.updateUser({ password });
  }

  // Expose the typed client for use in feature services
  get client(): SupabaseClient {
    return this.supabase;
  }
}