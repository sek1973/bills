import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { BillsActions } from './bill/bill.actions';

@Injectable()
export class AppInitEffects {
  private store = inject(Store);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => BillsActions.loadOverviewBills())
    ), { functional: true }
  );

  constructor(private actions$: Actions) { }
}
