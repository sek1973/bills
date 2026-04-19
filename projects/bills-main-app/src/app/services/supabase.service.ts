import { Injectable, signal } from '@angular/core';
import { AuthChangeEvent, createClient, Provider, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // Sequential in-memory lock — prevents concurrent token refresh races in a
  // single-tab zoneless environment (replaces the noop that allowed races).
  private _refreshLock: Promise<void> = Promise.resolve();

  // Hard cap on how long a single lock-held operation may run before we
  // forcibly release the lock.  Without this, a hung network request keeps
  // _refreshLock pending forever and deadlocks every subsequent auth call.
  private static readonly LOCK_TIMEOUT_MS = 30_000;

  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
          const next = this._refreshLock.then(() => {
            const timeout = new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error('Supabase auth lock timeout')),
                SupabaseService.LOCK_TIMEOUT_MS,
              )
            );
            return Promise.race([fn(), timeout]);
          });
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

  private readonly _connectivityRestored = new Subject<void>();
  /** Emits after the session is successfully refreshed following a network recovery. */
  readonly connectivityRestored$ = this._connectivityRestored.asObservable();

  private _lastRestoreAttempt = 0;
  private static readonly RESTORE_COOLDOWN_MS = 15_000;

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

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.refreshOnReconnect());
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.refreshOnReconnect();
      });
    }
  }

  /**
   * Force a session refresh after a potential network outage.
   * Retries with exponential backoff because the `online` event often fires
   * before DNS is ready (ERR_NAME_NOT_RESOLVED).
   */
  private refreshOnReconnect(): void {
    if (!this._session()) return;

    const now = Date.now();
    if (now - this._lastRestoreAttempt < SupabaseService.RESTORE_COOLDOWN_MS) return;
    this._lastRestoreAttempt = now;

    this.refreshWithRetry(0);
  }

  private static readonly MAX_RETRIES = 5;
  private static readonly RETRY_DELAYS = [2_000, 4_000, 8_000, 15_000, 30_000];

  private refreshWithRetry(attempt: number): void {
    this.supabase.auth.refreshSession().then(({ data, error }) => {
      if (!error && data.session) {
        // Delay so the auth lock fully drains before PostgREST requests
        // call getSession() internally (which also acquires the lock).
        setTimeout(() => this._connectivityRestored.next(), 2_000);
      } else if (attempt < SupabaseService.MAX_RETRIES) {
        setTimeout(() => this.refreshWithRetry(attempt + 1), SupabaseService.RETRY_DELAYS[attempt]);
      }
    }).catch(() => {
      if (attempt < SupabaseService.MAX_RETRIES) {
        setTimeout(() => this.refreshWithRetry(attempt + 1), SupabaseService.RETRY_DELAYS[attempt]);
      }
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