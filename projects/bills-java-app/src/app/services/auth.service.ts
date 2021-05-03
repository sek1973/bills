import { Injectable } from '@angular/core';
import { AuthService } from 'projects/model/src/public-api';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export abstract class AuthServiceImpl extends AuthService {
  private authStateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  constructor() { super(); }

  login(user: string, password: string): Observable<boolean> {
    this.authStateSubject.next(true);
    return of(true);
  }

  logout(): Observable<boolean> {
    this.authStateSubject.next(false);
    return of(false);
  }

  getUserName(): Observable<string> {
    return of('');
  }

}
