import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    PageNotFoundComponent
  ],
  imports: [
    ViewsRoutingModule,
    BrowserModule,
    ToolsModule,
    MatDialogModule,
    MatProgressBarModule,
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
