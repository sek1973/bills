import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService, BillsService, PaymentsService, SchedulesService } from 'projects/model/src/public-api';
import { BillsStoreModule } from 'projects/store/src/public-api';
import { ToolsModule } from 'projects/tools/src/public-api';
import { ViewsModule } from 'projects/views/src/public-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthServiceImpl, BillsServiceImpl, PaymentsServiceImpl, SchedulesServiceImpl } from './services';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
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
