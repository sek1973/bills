import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { AuthService, BillsService, OverviewBillsService, PaymentsService, PushNotificationService, RealtimeService } from '@bills/model';
import { provideBillsStore } from '@bills/store';
import { provideToolsDeps } from '@bills/tools';
import { provideViews } from '@bills/views';
import { environment } from '../environments/environment';
import { BillsServiceImpl, OverviewBillsServiceImpl, PaymentsServiceImpl, PushNotificationServiceImpl, RealtimeServiceImpl } from './services';
import { AuthServiceImpl } from './services/auth.service';


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
    { provide: RealtimeService, useExisting: RealtimeServiceImpl },
    { provide: PushNotificationService, useExisting: PushNotificationServiceImpl },
  ]
};
