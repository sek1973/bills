import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { OverviewBill, OverviewBillsService } from 'projects/model/src/public-api';
import { AppState, AuthActions, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { BillDueColorDirective } from 'projects/tools/src/lib/components/table/directives/bill-due-color.directive';
import { TableCellDirective } from 'projects/tools/src/lib/components/table/directives/table-cell.directive';
import { CurrencyToStringPipe } from 'projects/tools/src/lib/pipes/currency-to-string.pipe';
import { DateToStringPipe } from 'projects/tools/src/lib/pipes/timespan-to-string.pipe';
import { NotificationService, TableComponent } from 'projects/tools/src/public-api';
import { catchError, of, Subscription, switchMap, tap } from 'rxjs';
import { BillEditComponent } from '../bill/bill-edit/bill-edit.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatTooltipModule, TableComponent, TableCellDirective, BillDueColorDirective, DateToStringPipe, CurrencyToStringPipe, BillEditComponent]
})
export class OverviewComponent implements OnInit, OnDestroy {
  editMode = signal(false);
  data = signal<Bill[]>([]);
  OverviewBills = signal<OverviewBill[]>([]);
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'dueDate', header: 'Termin' },
    { name: 'sum', header: 'Kwota' }
  ];
  private dataSubscription = Subscription.EMPTY;

  @ViewChild('table')
  table!: TableComponent<OverviewBill>;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private OverviewBillsService = inject(OverviewBillsService);

  ngOnInit(): void {
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.dataSubscription = this.store
      .select(BillsSelectors.selectAll)
      .pipe(
        tap(bills => this.data.set(bills || [])),
        switchMap(() => this.OverviewBillsService.load().pipe(catchError(() => of([]))))
      )
      .subscribe(OverviewBills => this.OverviewBills.set(OverviewBills));
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }

  onRowClicked(row: OverviewBill | undefined): void {
    if (this.table) {
      this.table.canDelete.set(row ? true : false);
      this.table.canEdit.set(row ? true : false);
    }
  }

  getBillById(id: number): Bill | undefined {
    return this.data().find(b => b.id === id);
  }

  deleteBill(): void {
    const OverviewBill = this.table.activeRow();
    if (OverviewBill) {
      const bill = this.getBillById(OverviewBill.id);
      if (bill) { this.store.dispatch(BillsActions.deleteBill({ bill })); }
    }
  }

  editBill(): void {
    const row = this.table.activeRow();
    if (row) { this.router.navigate(['/rachunek', row.id]); }
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

  payBill(): void {
    const OverviewBill = this.table.activeRow();
    if (OverviewBill) {
      const bill = this.getBillById(OverviewBill.id);
      if (bill) { this.store.dispatch(BillsActions.payBill({ bill })); }
    }
  }

  onEditModeChange(event: boolean): void {
    this.editMode.set(event);
  }

}
