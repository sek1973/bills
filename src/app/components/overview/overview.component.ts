import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDays, getSafe } from 'src/app/helpers';
import { Bill } from 'src/app/model/bill';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { BillsDataSource } from '../../services/bills.datasource';
import { BillsFirebaseService } from '../../services/bills.firebase.service';
import { ConfirmDialogInputType } from '../tools/confirm-dialog/confirm-dialog.model';
import { validateBillName } from '../tools/inputs/validators/validators';
import { AuthService } from './../../services/auth.service';
import { ConfirmDialogResponse } from './../tools/confirm-dialog/confirm-dialog.component';
import { TableComponent } from './../tools/table/table.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  dataSource!: BillsDataSource;
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'deadline', header: 'Termin' },
    { name: 'sum', header: 'Kwota' }
  ];
  loading = false;

  @ViewChild('table')
  table!: TableComponent;

  constructor(
    private billsFirebaseService: BillsFirebaseService,
    private authService: AuthService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.dataSource = new BillsDataSource(this.billsFirebaseService);
  }

  onRowClicked(row: Bill): void {
    this.table.canDelete = row ? true : false;
    this.table.canEdit = row ? true : false;
  }

  getValue(row: Bill, column: string): string {
    return getSafe(() => row[column as keyof Bill]);
  }

  getId(row: Bill): number | undefined {
    return row.id;
  }

  deleteBill(): void {
    const row = this.table.activeRow as Bill;
    if (row) {
      this.confirmationService
        .confirm('Usuń rachunek',
          'Czy na pewno chcesz usunąć bieżący rachunek wraz z historią płatności? Operacji nie będzie można cofnąć! ' +
          'Aby potwierdzić podaj nazwę rachunku.', 'Nie', 'Tak',
          ConfirmDialogInputType.InputTypeText, undefined, [Validators.required, validateBillName(row.name)], 'Nazwa rachunku', 'Nazwa rachunku')
        .subscribe({
          next: (response) => {
            if (response) {
              this.billsFirebaseService.delete(row)
                .then(() => this.snackBar.open('Opłacenie rachunku zapisane!', 'Ukryj', { duration: 3000 }),
                  error => this.snackBar.open('Błąd usuwania rachunku: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' }));
            }
          }
        });
    }
  }

  editBill(): void {
    const row = this.table.activeRow;
    if (row) {
      this.router.navigate(['/rachunek', this.getId(row)]);
    }
  }

  addBill(): void {
    this.router.navigate(['/rachunek']);
  }

  logout(): void {
    this.billsFirebaseService.disconnect();
    this.authService.logout().then(
      () => {
        this.router.navigate(['/login']);
        this.snackBar.open('Wylogowano z aplikacji!', 'Ukryj', { duration: 3000 });
      },
      (rejected: string) =>
        this.snackBar.open('Błąd wylogowania z aplikacji:' + rejected, 'Ukryj', { panelClass: 'snackbar-style-error' }));
  }

  refresh(): void {
    this.billsFirebaseService.load();
  }

  formatActiveColor(row: Bill): string {
    if (!row.active) { return 'lightgray'; }
    return '';
  }

  formatColor(row: Bill): string {
    const color = this.formatActiveColor(row);
    if (color !== '') { return color; }
    if (row.deadline < new Date()) { return 'red'; }
    if (row.deadline < addDays()) { return 'darkgoldenrod'; }
    return '';
  }

  payBill(): void {
    if (this.table.activeRow) {
      const bill = this.table.activeRow;
      this.confirmationService
        .confirm('Rachunek opłacony',
          'Podaj kwotę jaka została zapłacona:', 'Anuluj', 'OK',
          ConfirmDialogInputType.InputTypeCurrency, bill.sum * bill.share, [Validators.required], 'Kwota', 'Kwota')
        .subscribe((response: boolean | ConfirmDialogResponse) => {
          if (response) {
            this.loading = true;
            this.billsFirebaseService.pay(bill, (response as ConfirmDialogResponse).value)
              .then(() => {
                this.loading = false;
                this.snackBar.open('Opłacenie rachunku zapisane!', 'Ukryj', { duration: 3000 });
              },
                (error: string) => {
                  this.loading = false;
                  this.snackBar.open('Błąd zapisania opłacenia rachunku: ' + error,
                    'Ukryj', { panelClass: 'snackbar-style-error' });
                }
              );
          }
        });
    }
  }

}
