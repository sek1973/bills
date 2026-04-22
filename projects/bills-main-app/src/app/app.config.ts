import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { AuthService, BillsService, OverviewBillsService, PaymentsService, RealtimeService } from 'model';
import { provideBillsStore } from 'store';
import { provideToolsDeps } from 'tools';
import { provideViews } from 'views';
import { environment } from '../environments/environment';
import { BillsServiceImpl, OverviewBillsServiceImpl, PaymentsServiceImpl, RealtimeServiceImpl } from './services';
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
  ]
};
