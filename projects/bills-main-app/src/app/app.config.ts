import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { AuthService, BillsService, OverviewBillsService, PaymentsService, PushNotificationService } from '@bills/model';
import { provideBillsStore } from '@bills/store';
import { provideToolsDeps } from '@bills/tools';
import { provideViews } from '@bills/views';
import { provideEffects } from '@ngrx/effects';
import { environment } from '../environments/environment';
import { BillsServiceImpl, OverviewBillsServiceImpl, PaymentsServiceImpl, PushNotificationServiceImpl } from './services';
import { AuthServiceImpl } from './services/auth.service';
import { RealtimeEffects } from './services/realtime.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBillsStore(environment.production),
    provideToolsDeps(),
    provideViews(),
    { provide: AuthService, useExisting: AuthServiceImpl },
    { provide: BillsService, useExisting: BillsServiceImpl },
    { provide: PaymentsService, useExisting: PaymentsServiceImpl },
    { provide: OverviewBillsService, useExisting: OverviewBillsServiceImpl },
    { provide: PushNotificationService, useExisting: PushNotificationServiceImpl },
    provideEffects([RealtimeEffects]),
  ]
};
