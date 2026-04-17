import { effect, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'bills-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(
    localStorage.getItem(STORAGE_KEY) !== null
      ? localStorage.getItem(STORAGE_KEY) === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  constructor() {
    effect(() => {
      const isDark = this.darkMode();
      document.documentElement.classList.toggle('dark-mode', isDark);
      localStorage.setItem(STORAGE_KEY, String(isDark));
    });
  }

  toggle(): void {
    this.darkMode.update(v => !v);
  }
}
