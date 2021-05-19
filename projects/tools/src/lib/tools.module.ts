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
    MatMomentDateModule,
    MatSelectModule,
    MatMenuModule
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
  ]
})
export class ToolsModule { }

export * from './components';
export * from './helpers';
export * from './services';
