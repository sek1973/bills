import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(user: string, password: string): Observable<boolean> {
    return of(true);
  }

  getUserName(): Observable<string> {
    return of('');
  }

  logout(): Observable<boolean> {
    return of(true);
  }

}
