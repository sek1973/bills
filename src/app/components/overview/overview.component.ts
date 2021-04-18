import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { addDays, getSafe } from 'src/app/helpers';
import { Bill } from 'src/app/model/bill';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { AuthActions, BillsActions, BillsSelectors } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { ConfirmDialogInputType } from '../tools/confirm-dialog/confirm-dialog.model';
import { validateBillName } from '../tools/inputs/validators/validators';
import { ConfirmDialogResponse } from './../tools/confirm-dialog/confirm-dialog.component';
import { TableComponent } from './../tools/table/table.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  dataSource$!: Observable<Bill[]>;
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'deadline', header: 'Termin' },
    { name: 'sum', header: 'Kwota' }
  ];
  loading = false;

  @ViewChild('table')
  table!: TableComponent;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.dataSource$ = this.store.select(BillsSelectors.selectAll);
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
              this.store.dispatch(BillsActions.deleteBill({ billId: row.id }));
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
    this.store.dispatch(AuthActions.logout());
  }

  onLogout(loggedIn: boolean): void {
    if (loggedIn === false) {
      this.router.navigate(['/login']);
      this.snackBar.open('Wylogowano z aplikacji!', 'Ukryj', { duration: 3000 });
    }
  }

  refresh(): void {
    this.store.dispatch(BillsActions.loadBills());
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
            const value = (response as ConfirmDialogResponse)?.value;
            this.store.dispatch(BillsActions.payBill({ billId: bill.id, sum: value }));
          }
        });
    }
  }

}
