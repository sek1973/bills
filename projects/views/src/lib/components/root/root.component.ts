import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppSelectors, AppState } from 'projects/store/src/lib/state';
import { AppSpinnerComponent } from 'projects/tools/src/public-api';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
  imports: [RouterOutlet, AppSpinnerComponent, AsyncPipe]
})
export class RootComponent implements OnInit {
  public loading$ = this.store.select(AppSelectors.selectLoading).pipe(debounceTime(250));

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
  }

}
