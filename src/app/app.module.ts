import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  AddHiddenAttributeDirective,
  AddHrefAttributeDirective,
  AppSpinnerComponent,
  BillComponent,
  BillEditComponent,
  ConfirmDialogComponent,
  InputCurrencyComponent,
  InputCurrencyDirective,
  InputDateComponent,
  InputHyperlinkComponent,
  InputPasswordComponent,
  InputPercentComponent,
  InputPercentDirective,
  InputSelectComponent,
  InputTextareaComponent,
  InputTextComponent,
  InputToggleComponent,
  LoginComponent,
  OverviewComponent,
  PageNotFoundComponent,
  PaymentDialogComponent,
  PaymentsComponent,
  ScheduleDialogComponent,
  SchedulesComponent,
  TableComponent,
  ViewFieldTextComponent,
  ViewFieldToggleComponent
} from './components';
import { InputBaseComponent } from './components/tools/inputs/input-component-base';
import { TableCellDirective } from './components/tools/table/directives';
import { CurrencyToStringPipe } from './pipes/currency-to-string.pipe';
import { DynamicPipe } from './pipes/dynamic.pipe';
import { TimespanToStringPipe } from './pipes/timespan-to-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    InputBaseComponent,
    AppComponent,
    LoginComponent,
    BillComponent,
    OverviewComponent,
    InputTextComponent,
    InputToggleComponent,
    InputPasswordComponent,
    PaymentsComponent,
    PageNotFoundComponent,
    AppSpinnerComponent,
    TableComponent,
    TableCellDirective,
    SchedulesComponent,
    ScheduleDialogComponent,
    PaymentDialogComponent,
    InputDateComponent,
    TimespanToStringPipe,
    CurrencyToStringPipe,
    ConfirmDialogComponent,
    ViewFieldTextComponent,
    ViewFieldToggleComponent,
    BillEditComponent,
    DynamicPipe,
    InputSelectComponent,
    InputCurrencyComponent,
    InputCurrencyDirective,
    InputPercentComponent,
    InputPercentDirective,
    InputHyperlinkComponent,
    AddHiddenAttributeDirective,
    AddHrefAttributeDirective,
    InputTextareaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatTableModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatPasswordStrengthModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatSelectModule,
    MatMenuModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      name: 'Bills',
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
