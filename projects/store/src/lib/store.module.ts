import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'projects/bills-java-app/src/environments/environment';
import { appReducer, BillEffects } from './state';
import { StoreComponent } from './store.component';

@NgModule({
  declarations: [
    StoreComponent
  ],
  imports: [
    StoreModule.forRoot({ data: appReducer }),
    StoreDevtoolsModule.instrument({
      name: 'Bills',
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([BillEffects])
  ],
  exports: [
    StoreComponent
  ]
})
export class BillsStoreModule { }

export * from './state';
