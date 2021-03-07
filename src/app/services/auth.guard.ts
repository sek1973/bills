import { PreviousUrlService } from './previous-url.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private previousUrlService: PreviousUrlService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (state) {
      this.previousUrlService.previousUrl = state.url;
    }
    return this.authService.authState$.pipe(map(authState => {
      if (authState) { return true; }

      this.router.navigate(['/login']);
      return false;
    }));
  }
}
