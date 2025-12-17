import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
import { BILLS_DATE_FORMATS, BillsDateAdapter } from './helpers/date.adapter';
import { CurrencyToStringPipe } from './pipes/currency-to-string.pipe';
import { DynamicPipe } from './pipes/dynamic.pipe';
import { NumberToPercentPipe } from './pipes/number-to-percent.pipe';
import { DateToStringPipe } from './pipes/timespan-to-string.pipe';
import { ToolsComponent } from './tools.component';

@NgModule({ exports: [
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
    ], imports: [BrowserModule,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatTableModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatMenuModule,
        MatFormFieldModule,
        MatIconModule,
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
        NumberToPercentPipe], providers: [
        { provide: MAT_DATE_FORMATS, useValue: BILLS_DATE_FORMATS },
        { provide: DateAdapter, useClass: BillsDateAdapter },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class ToolsModule { }

export * from './components';
export * from './helpers';
export * from './services';

