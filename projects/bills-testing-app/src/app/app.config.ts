import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { AuthService, BillsService, PaymentsService } from '@bills/model';
import { provideBillsStore } from '@bills/store';
import { provideToolsDeps } from '@bills/tools';
import { provideViews } from '@bills/views';
import { environment } from '../environments/environment';
import { AuthServiceImpl, BillsServiceImpl, PaymentsServiceImpl } from './services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBillsStore(environment.production),
    provideToolsDeps(),
    provideViews(),
    { provide: AuthService, useExisting: AuthServiceImpl },
    { provide: BillsService, useExisting: BillsServiceImpl },
    { provide: PaymentsService, useExisting: PaymentsServiceImpl },
  ]
};
