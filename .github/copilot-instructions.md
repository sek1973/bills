# Angular 20 + NgRx + Supabase Project Standards

## 1. Core Framework (Angular 20)
- **Component Pattern:** Use Standalone components exclusively. No NgModules.
- **Dependency Injection:** Use the `inject()` function at the class level. Avoid constructor injection.
- **Reactivity:** Use **Signals** (`signal`, `computed`, `effect`) for local state. 
- **Change Detection:** Project is **Zoneless**. Do not use `ChangeDetectorRef`.
- **Templates:** Use the modern control flow (`@if`, `@for`, `@switch`).
- **Date Handling:** Use `moment` (as per package.json) for all date manipulations.

## 2. State Management (NgRx 20)
- **Store Strategy:** Use `provideStore` and `provideEffects` in `app.config.ts`.
- **SignalStore:** Favor `@ngrx/signals` (SignalStore) for feature state to minimize RxJS boilerplate where appropriate.
- **Functional Effects:** Write effects as functional constants using `createEffect` with `functional: true`.

## 3. Backend (Supabase)
- **Client Access:** Use a singleton `SupabaseService` that wraps `createClient`.
- **Type Safety:** Always use the generated types from `@supabase/supabase-js`. 
- **RLS Policy Rule:** When writing SQL for RLS, always wrap `auth.uid()` in a select for performance: `((select auth.uid()) = user_id)`.

## 4. Token Optimization & Style
- **Terse Responses:** Do not explain "How-to" basics. Only provide the code diff or implementation.
- **No Imports:** Skip standard Angular core imports unless specifically asked; assume they exist.
- **Testing:** Use `Vitest` (not Karma/Jasmine) and `@testing-library/angular`.