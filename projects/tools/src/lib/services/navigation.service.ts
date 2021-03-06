import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PreviousUrlService } from './previous-url.service';


@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router, private previousUrlService: PreviousUrlService) {
  }

  goToPreviousPage(whenNoneUrl: string): void {
    if (this.previousUrlService.previousUrl) {
      this.router.navigate([this.previousUrlService.previousUrl]);
    } else {
      this.router.navigate([whenNoneUrl]);
    }
  }

  goToPage(url: string): void {
    this.router.navigate([url]);
  }
}
