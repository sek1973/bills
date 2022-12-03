import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { DateAdapter, MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AddHiddenAttributeDirective,
  AddHrefAttributeDirective,
  AppSpinnerComponent,
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
  TableComponent,
  ViewFieldTextComponent,
  ViewFieldToggleComponent
} from './components';
import { InputBaseComponent } from './components/inputs/input-component-base';
import { TableCellDirective } from './components/table/directives';
import { BillsDateAdapter, BILLS_DATE_FORMATS } from './helpers/date.adapter';
import { CurrencyToStringPipe } from './pipes/currency-to-string.pipe';
import { DynamicPipe } from './pipes/dynamic.pipe';
import { NumberToPercentPipe } from './pipes/number-to-percent.pipe';
import { DateToStringPipe } from './pipes/timespan-to-string.pipe';
import { ToolsComponent } from './tools.component';

@NgModule({
  declarations: [
    InputBaseComponent,
    ToolsComponent,
    InputSelectComponent,
    InputCurrencyComponent,
    InputCurrencyDirective,
    InputPercentComponent,
    InputPercentDirective,
    InputHyperlinkComponent,
    AddHiddenAttributeDirective,
    AddHrefAttributeDirective,
    InputTextareaComponent,
    InputTextComponent,
    InputToggleComponent,
    InputPasswordComponent,
    AppSpinnerComponent,
    TableComponent,
    TableCellDirective,
    InputDateComponent,
    DateToStringPipe,
    CurrencyToStringPipe,
    ConfirmDialogComponent,
    ViewFieldTextComponent,
    ViewFieldToggleComponent,
    DynamicPipe,
    NumberToPercentPipe,
  ],
  imports: [
    BrowserModule,
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
    MatSelectModule,
    MatMenuModule,
  ],
  exports: [
    InputBaseComponent,
    ToolsComponent,
    InputSelectComponent,
    InputCurrencyComponent,
    InputCurrencyDirective,
    InputPercentComponent,
    InputPercentDirective,
    InputHyperlinkComponent,
    AddHiddenAttributeDirective,
    AddHrefAttributeDirective,
    InputTextareaComponent,
    InputTextComponent,
    InputToggleComponent,
    InputPasswordComponent,
    AppSpinnerComponent,
    TableComponent,
    TableCellDirective,
    InputDateComponent,
    DateToStringPipe,
    CurrencyToStringPipe,
    NumberToPercentPipe,
    ConfirmDialogComponent,
    ViewFieldTextComponent,
    ViewFieldToggleComponent,
    DynamicPipe,
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: BILLS_DATE_FORMATS },
    { provide: DateAdapter, useClass: BillsDateAdapter },
  ]
})
export class ToolsModule { }

export * from './components';
export * from './helpers';
export * from './services';
