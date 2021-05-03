import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreviousUrlService {
  private _previousUrl: string = '';
  set previousUrl(val: string) {
    this._previousUrl = val;
  }
  get previousUrl(): string {
    return this._previousUrl;
  }

  constructor() { }

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }
}
