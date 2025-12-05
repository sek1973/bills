import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AuthService, BillsService, PaymentsService, SchedulesService } from 'projects/model/src/public-api';
import { BillsStoreModule } from 'projects/store/src/public-api';
import { ToolsModule } from 'projects/tools/src/public-api';
import { ViewsModule } from 'projects/views/src/public-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BillsServiceImpl, PaymentsServiceImpl, SchedulesServiceImpl } from './services';
import { AuthServiceImpl } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ToolsModule,
    ViewsModule,
    BillsStoreModule
  ],
  providers: [
    { provide: AuthService, useExisting: AuthServiceImpl },
    { provide: BillsService, useExisting: BillsServiceImpl },
    { provide: PaymentsService, useExisting: PaymentsServiceImpl },
    { provide: SchedulesService, useExisting: SchedulesServiceImpl },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
