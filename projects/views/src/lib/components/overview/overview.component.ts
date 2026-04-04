import { NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { getSafe } from 'projects/model/src/public-api';
import { AppState, AuthActions, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { TableCellDirective } from 'projects/tools/src/lib/components/table/directives/table-cell.directive';
import { CurrencyToStringPipe } from 'projects/tools/src/lib/pipes/currency-to-string.pipe';
import { NotificationService, TableComponent } from 'projects/tools/src/public-api';
import { Subscription } from 'rxjs';
import { BillEditComponent } from '../bill/bill-edit/bill-edit.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgStyle, MatButtonModule, MatTooltipModule, TableComponent, TableCellDirective, CurrencyToStringPipe, BillEditComponent]
})
export class OverviewComponent implements OnInit, OnDestroy {
  editMode = signal(false);
  data = signal<Bill[]>([]);
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'sum', header: 'Kwota' }
  ];
  private dataSubscription = Subscription.EMPTY;

  @ViewChild('table')
  table!: TableComponent<Bill>;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.dataSubscription = this.store
      .select(BillsSelectors.selectAll)
      .subscribe({
        next: bills => this.data.set(bills || [])
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

  onRowClicked(row: Bill | undefined): void {
    if (this.table) {
      this.table.canDelete.set(row ? true : false);
      this.table.canEdit.set(row ? true : false);
    }
  }

  getValue(row: Bill, column: string): string {
    return getSafe(() => row[column as keyof Bill]);
  }

  getId(row: Bill): number | undefined {
    return row.id;
  }

  deleteBill(): void {
    const row = this.table.activeRow() as Bill;
    if (row) {
      this.store.dispatch(BillsActions.deleteBill({ bill: row }));
    }
  }

  editBill(): void {
    const row = this.table.activeRow();
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

  changePassword(): void {
    this.router.navigate(['/zmien-haslo']);
  }

  onLogout(loggedIn: boolean): void {
    if (loggedIn === false) {
      this.router.navigate(['/login']);
      this.notification.success('Wylogowano z aplikacji!');
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
    return this.formatActiveColor(row);
  }

  payBill(): void {
    const bill = this.table.activeRow();
    if (bill) {
      this.store.dispatch(BillsActions.payBill({ bill }));
    }
  }

  onEditModeChange(event: boolean): void {
    this.editMode.set(event);
  }

}
