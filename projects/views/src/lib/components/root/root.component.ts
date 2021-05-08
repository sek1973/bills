import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppSelectors, AppState } from 'projects/store/src/lib/state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css']
})
export class RootComponent implements OnInit {
  public loading$ = this.store.select(AppSelectors.selectLoading).pipe(map(val => { console.log('loding value: ', val); return val; }));

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
  }

}
