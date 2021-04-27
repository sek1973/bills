import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { addDays, getSafe } from 'src/app/helpers';
import { Bill } from 'src/app/model/bill';
import { AuthActions, BillsActions, BillsSelectors } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { TableComponent } from './../tools/table/table.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  data: Bill[] = [];
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'deadline', header: 'Termin' },
    { name: 'sum', header: 'Kwota' }
  ];
  loading = false;
  private dataSubscription = Subscription.EMPTY;

  @ViewChild('table')
  table!: TableComponent;

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.dataSubscription = this.store
      .select(BillsSelectors.selectAll)
      .subscribe({
        next: bills => this.data = bills || []
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
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
      this.store.dispatch(BillsActions.deleteBill({ bill: row }));
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
      this.store.dispatch(BillsActions.payBill({ bill: bill.id }));
    }
  }

}
