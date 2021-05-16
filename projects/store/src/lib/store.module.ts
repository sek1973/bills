import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'projects/bills-java-app/src/environments/environment';
import { appReducer, BillEffects, PaymentEffects } from './state';
import { AuthEffects } from './state/auth/auth.effects';
import { StoreComponent } from './store.component';

@NgModule({
  declarations: [
    StoreComponent
  ],
  imports: [
    MatSnackBarModule,
    StoreModule.forRoot({ data: appReducer }),
    StoreDevtoolsModule.instrument({
      name: 'Bills',
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([
      AuthEffects,
      BillEffects,
      PaymentEffects
    ])
  ],
  exports: [
    StoreComponent
  ]
})
export class BillsStoreModule { }

export * from './state';
