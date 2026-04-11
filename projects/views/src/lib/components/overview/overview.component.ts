import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { OverviewBill, OverviewBillsService, RealtimeService } from 'projects/model/src/public-api';
import { AppState, AuthActions, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { BillDueColorDirective } from 'projects/tools/src/lib/components/table/directives/bill-due-color.directive';
import { TableCellDirective } from 'projects/tools/src/lib/components/table/directives/table-cell.directive';
import { TableMenuItem } from 'projects/tools/src/lib/components/table/table-column.model';
import { CurrencyToStringPipe } from 'projects/tools/src/lib/pipes/currency-to-string.pipe';
import { DateToStringPipe } from 'projects/tools/src/lib/pipes/timespan-to-string.pipe';
import { NotificationService, TableComponent } from 'projects/tools/src/public-api';
import { catchError, of, Subscription, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatTooltipModule, TableComponent, TableCellDirective, BillDueColorDirective, DateToStringPipe, CurrencyToStringPipe]
})
export class OverviewComponent implements OnInit, OnDestroy {
  editMode = signal(false);
  data = signal<Bill[]>([]);
  OverviewBills = signal<OverviewBill[]>([]);
  filterInactive = signal(true);
  filtered = computed(() =>
    this.filterInactive() ? this.OverviewBills().filter(b => b.active) : this.OverviewBills()
  );
  menuItems = computed<TableMenuItem[]>(() => [
    {
      label: this.filterInactive() ? 'Pokaż nieaktywne' : 'Ukryj nieaktywne',
      icon: 'filter_alt',
      action: () => this.toggleInactiveFilter()
    },
    {
      label: 'Wyloguj',
      icon: 'power_settings_new',
      action: () => this.logout()
    }
  ]);
  columns = [
    { name: 'name', header: 'Nazwa' },
    { name: 'dueDate', header: 'Termin' },
    { name: 'sum', header: 'Kwota' }
  ];
  inactiveRowStyle = (row: OverviewBill): Record<string, string> => row.active ? {} : { color: 'grey' };
  private dataSubscription = Subscription.EMPTY;

  @ViewChild('table')
  table!: TableComponent<OverviewBill>;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private OverviewBillsService = inject(OverviewBillsService);
  private realtimeService = inject(RealtimeService);
  #destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.subscribeToData();
    this.subscribeToRealtimeChanges();
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

  private subscribeToRealtimeChanges(): void {
    this.realtimeService.billsChanges$
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.store.dispatch(BillsActions.loadBills()));
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

  toggleInactiveFilter(): void {
    this.filterInactive.update(v => !v);
  }

}
