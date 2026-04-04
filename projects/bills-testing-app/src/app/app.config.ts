import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { AuthService, BillsService, PaymentsService } from 'projects/model/src/public-api';
import { provideBillsStore } from 'projects/store/src/public-api';
import { provideToolsDeps } from 'projects/tools/src/public-api';
import { provideViews } from 'projects/views/src/public-api';
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
