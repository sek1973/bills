import { Injectable, NgZone } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  // Expose observables for components to subscribe
  public session$: Observable<Session | null> = this.sessionSubject.asObservable();
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // initialize current session
    const current = this.supabase.auth.getSession()
      .then(({ data }) => {
        this.ngZone.run(() => {
          this.sessionSubject.next(data.session ?? null);
          this.userSubject.next(data.session?.user ?? null);
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.sessionSubject.next(null);
          this.userSubject.next(null);
        });
      });

    // subscribe to auth changes (changes across tabs/windows)
    this.supabase.auth.onAuthStateChange((event, session) => {
      // onAuthStateChange callback runs outside Angular zone; ensure change detection
      this.ngZone.run(() => {
        this.sessionSubject.next(session ?? null);
        this.userSubject.next(session?.user ?? null);
      });
    });
  }

  // Sign up with email + password
  async signUpWithEmail(email: string, password: string): Promise<{ data: any; error: any }> {
    const result = await this.supabase.auth.signUp({ email, password });
    // caller should check result.error and inform the user (e.g., check email confirmation)
    return result;
  }

  // Sign in with email + password
  async signInWithEmail(email: string, password: string): Promise<{ data: any; error: any }> {
    const result = await this.supabase.auth.signInWithPassword({ email, password });
    // on success, onAuthStateChange will update the session/user subjects
    return result;
  }

  // Sign in with magic link / OTP (email)
  async signInWithOtp(email: string): Promise<{ data: any; error: any }> {
    const result = await this.supabase.auth.signInWithOtp({ email });
    return result;
  }

  // Sign in using third-party provider (OAuth) — redirects user
  // provider examples: 'github', 'google'
  async signInWithProvider(provider: string, options?: { redirectTo?: string }) {
    return this.supabase.auth.signInWithOAuth({ provider: provider as any, options });
  }

  // Sign out
  async signOut(): Promise<{ error: any }> {
    const result = await this.supabase.auth.signOut();
    // onAuthStateChange will clear session/user subjects
    return result;
  }

  // Get current user (synchronously)
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  // Get current session (synchronously)
  getCurrentSession(): Session | null {
    return this.sessionSubject.value;
  }

  // Example helper to ensure the user is authenticated before calling DB
  // Returns the user's access token to pass in Authorization headers if needed
  getAccessToken(): string | null {
    return this.sessionSubject.value?.access_token ?? null;
  }

  // Example protected query: fetch rows from a table (client-side)
  // Ensure your table has RLS policies allowing the authenticated user to read their data.
  async fetchUserData(table: string, columns = '*'): Promise<{ data: any; error: any }> {
    const user = this.getCurrentUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await this.supabase
      .from(table)
      .select(columns)
      .eq('user_id', user.id); // adjust column to your schema
    return { data, error };
  }

  // Optional: refresh session manually
  async refreshSession(): Promise<void> {
    // Supabase client manages refresh automatically; explicit refresh rarely required.
    const { data, error } = await this.supabase.auth.getSession();
    this.ngZone.run(() => {
      this.sessionSubject.next(data.session ?? null);
      this.userSubject.next(data.session?.user ?? null);
    });
    if (error) throw error;
  }
}