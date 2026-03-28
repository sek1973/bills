import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { AuthService, BillsService, PaymentsService, SchedulesService } from 'projects/model/src/public-api';
import { BillsStoreModule } from 'projects/store/src/public-api';
import { ToolsModule } from 'projects/tools/src/public-api';
import { ViewsModule } from 'projects/views/src/public-api';
import { BillsServiceImpl, PaymentsServiceImpl, SchedulesServiceImpl } from './services';
import { AuthServiceImpl } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(ToolsModule, ViewsModule, BillsStoreModule),
    { provide: AuthService, useExisting: AuthServiceImpl },
    { provide: BillsService, useExisting: BillsServiceImpl },
    { provide: PaymentsService, useExisting: PaymentsServiceImpl },
    { provide: SchedulesService, useExisting: SchedulesServiceImpl },
  ]
};
