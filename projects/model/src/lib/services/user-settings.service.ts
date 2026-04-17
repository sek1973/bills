import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'bills-user-settings';

interface UserSettings {
  showAmountDetails: boolean;
}

const DEFAULTS: UserSettings = {
  showAmountDetails: false,
};

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  readonly showAmountDetails = signal(this.#load().showAmountDetails);

  constructor() {
    effect(() => {
      this.#save({ showAmountDetails: this.showAmountDetails() });
    });
  }

  #load(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  }

  #save(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
}
