import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthService, BillsService, PaymentsService, SchedulesService } from 'projects/model/src/public-api';
import { ToolsModule } from 'projects/tools/src/public-api';
import { ViewsModule } from 'projects/views/src/public-api';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BillsServiceImpl, PaymentsServiceImpl, SchedulesServiceImpl } from './services';
import { AuthServiceImpl } from './services/auth.service';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';

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
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      name: 'Bills',
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([]),
    MatPasswordStrengthModule
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
