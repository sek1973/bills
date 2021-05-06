import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'projects/bills-java-app/src/environments/environment';
import { authReducer } from './state/auth/auth.reducers';
import { StoreComponent } from './store.component';

@NgModule({
  declarations: [
    StoreComponent
  ],
  imports: [
    StoreModule.forRoot({ data: authReducer }),
    StoreDevtoolsModule.instrument({
      name: 'Bills',
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([])
  ],
  exports: [
    StoreComponent
  ]
})
export class BillsStoreModule { }

export * from './state';
