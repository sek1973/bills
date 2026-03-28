import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { appReducer, BillEffects, PaymentEffects } from './state';
import { AuthEffects } from './state/auth/auth.effects';
import { ScheduleEffects } from './state/schedule';

export function provideBillsStore(production: boolean): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore({ data: appReducer }),
    provideStoreDevtools({ name: 'Bills', maxAge: 25, logOnly: production }),
    provideEffects([AuthEffects, BillEffects, PaymentEffects, ScheduleEffects]),
    importProvidersFrom(MatSnackBarModule),
  ]);
}

export * from './state';

