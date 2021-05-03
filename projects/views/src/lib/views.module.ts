import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { ToolsModule } from 'projects/tools/src/public-api';
import {
  BillComponent,
  BillEditComponent,
  OverviewComponent,
  PaymentDialogComponent,
  PaymentsComponent,
  ScheduleDialogComponent,
  SchedulesComponent
} from './components';
import { ViewsComponent } from './views.component';

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
  ],
  imports: [
    BrowserModule,
    ToolsModule,
    MatDialogModule,
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
