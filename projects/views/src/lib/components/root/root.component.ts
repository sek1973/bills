import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { debounceTime } from 'rxjs/operators';
import { AppSelectors, AppState } from 'store';
import { AppSpinnerComponent } from 'tools';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppSpinnerComponent, AsyncPipe]
})
export class RootComponent {
  private store = inject(Store<AppState>);
  public loading$ = this.store.select(AppSelectors.selectLoading).pipe(debounceTime(250));
}
