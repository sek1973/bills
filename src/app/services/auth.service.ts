import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class AuthService {

  constructor() { }

  abstract login(user: string, password: string): Observable<boolean>;

  abstract logout(): Observable<boolean>;

  abstract getUserName(): Observable<string>;

}
