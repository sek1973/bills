import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>) => fn(),
      },
    }
  );

  private readonly _session = signal<Session | null>(null);
  private readonly _user = signal<User | null>(null);

  readonly session = this._session.asReadonly();
  readonly user = this._user.asReadonly();

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session ?? null);
      this._user.set(data.session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session ?? null);
      this._user.set(session?.user ?? null);
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

  async signInWithProvider(provider: string, options?: { redirectTo?: string }) {
    return this.supabase.auth.signInWithOAuth({ provider: provider as any, options });
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