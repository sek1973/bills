import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {
  public abstract authState$: Observable<boolean>;

  constructor() { }

  abstract login(user: string, password: string): Observable<boolean>;

  abstract logout(): Observable<boolean>;

  abstract getUserName(): Observable<string>;

}
