import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ToolsModule } from 'projects/tools/src/public-api';
import {
  BillComponent,
  BillEditComponent,
  LoginComponent,
  OverviewComponent,
  PageNotFoundComponent,
  PaymentDialogComponent,
  PaymentsComponent,
  ScheduleDialogComponent,
  SchedulesComponent
} from './components';
import { RootComponent } from './components/root/root.component';
import { ViewsComponent } from './views.component';
import { ViewsRoutingModule } from './views.routing';

@NgModule({
  declarations: [
    ViewsComponent,
    BillComponent,
    BillEditComponent,
    BillComponent,
    OverviewComponent,
    PaymentsComponent,
    SchedulesComponent,
    ScheduleDialogComponent,
    PaymentDialogComponent,
    LoginComponent,
    PageNotFoundComponent,
    RootComponent
  ],
  imports: [
    ViewsRoutingModule,
    BrowserModule,
    ToolsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTabsModule,
    MatButtonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    ViewsComponent,
    BillComponent,
    BillEditComponent,
    BillComponent,
    OverviewComponent,
    PaymentsComponent,
    SchedulesComponent,
    ScheduleDialogComponent,
    PaymentDialogComponent,
  ]
})
export class ViewsModule { }
