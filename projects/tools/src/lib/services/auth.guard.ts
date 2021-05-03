import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from 'projects/model/src/public-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PreviousUrlService } from './previous-url.service';

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
