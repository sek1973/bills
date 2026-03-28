import { NgModule } from '@angular/core';
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
import { ViewsRoutingModule } from './views.routing';

@NgModule({
  imports: [
    ViewsRoutingModule,
    BillComponent,
    BillEditComponent,
    OverviewComponent,
    PaymentsComponent,
    SchedulesComponent,
    ScheduleDialogComponent,
    PaymentDialogComponent,
    LoginComponent,
    PageNotFoundComponent,
    RootComponent,
  ],
  exports: [
    BillComponent,
    BillEditComponent,
    OverviewComponent,
    PaymentsComponent,
    SchedulesComponent,
    ScheduleDialogComponent,
    PaymentDialogComponent,
  ]
})
export class ViewsModule { }
