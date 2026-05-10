import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { OverviewBill, PushNotificationService } from '@bills/model';
import { AppSelectors, AppState, AuthActions, BillsActions, BillsSelectors } from '@bills/store';
import {
  BillDueColorDirective,
  CurrencyToStringPipe,
  DateToStringPipe,
  NotificationService,
  PullToRefreshDirective,
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableMenuItem,
  ThemeService
} from '@bills/tools';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatTooltipModule, TableComponent, TableCellDirective, BillDueColorDirective, DateToStringPipe, CurrencyToStringPipe, PullToRefreshDirective]
})
export class OverviewComponent implements OnInit {
  editMode = signal(false);
  overviewBills = signal<OverviewBill[]>([]);
  filterInactive = signal(true);
  filtered = computed(() =>
    this.filterInactive() ? this.overviewBills().filter(b => b.active) : this.overviewBills()
  );
  menuItems = computed<TableMenuItem[]>(() => [
    {
      label: 'Odśwież',
      icon: 'refresh',
      action: () => !this.loading() && this.refresh()
    },
    {
      label: 'Zapłacony',
      icon: 'check',
      action: () => !this.loading() && this.payBill()
    },
    {
      label: this.filterInactive() ? 'Pokaż nieaktywne' : 'Ukryj nieaktywne',
      icon: 'filter_alt',
      action: () => this.toggleInactiveFilter()
    },
    {
      label: 'Raporty',
      icon: 'analytics',
      action: () => this.router.navigate(['/raporty'])
    },
    ...(this.pushNotifications.isSupported ? [{
      label: this.pushNotifications.isSubscribed() ? 'Wyłącz powiadomienia' : 'Włącz powiadomienia',
      icon: this.pushNotifications.isSubscribed() ? 'notifications_off' : 'notifications',
      action: () => this.pushNotifications.isSubscribed()
        ? this.pushNotifications.unsubscribe()
        : this.pushNotifications.subscribe()
    }] : []),
    {
      label: this.themeService.darkMode() ? 'Tryb jasny' : 'Tryb ciemny',
      icon: this.themeService.darkMode() ? 'light_mode' : 'dark_mode',
      action: () => this.themeService.toggle()
    },
    {
      label: 'Wyloguj',
      icon: 'power_settings_new',
      action: () => this.logout()
    }
  ]);
  columns: TableColumn[] = [
    { name: 'name', header: 'Nazwa', sort: true, filter: true },
    { name: 'dueDate', header: 'Termin', sort: true, filter: true },
    { name: 'sum', header: 'Kwota', sort: true, filter: true }
  ];
  inactiveRowStyle = (row: OverviewBill): Record<string, string> => row.active ? {} : { color: 'grey' };

  @ViewChild('table')
  table!: TableComponent<OverviewBill>;

  private store = inject(Store<AppState>);
  private router = inject(Router);
  private notification = inject(NotificationService);
  pushNotifications = inject(PushNotificationService);
  themeService = inject(ThemeService);
  #destroyRef = inject(DestroyRef);
  readonly loading = toSignal(this.store.select(AppSelectors.selectLoading), { initialValue: false });

  ngOnInit(): void {
    this.store.select(BillsSelectors.selectOverviewBills)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(bills => this.overviewBills.set(bills));
  }

  onRowClicked(row: OverviewBill | undefined): void {
    if (this.table) {
      this.table.canDelete.set(row ? true : false);
      this.table.canEdit.set(row ? true : false);
    }
  }

  deleteBill(): void {
    const bill = this.table.activeRow();
    if (bill) { this.store.dispatch(BillsActions.deleteBill({ bill })); }
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
    // No-op: loadOverviewBills is now dispatched globally at startup
  }

  payBill(): void {
    const bill = this.table.activeRow();
    if (bill) { this.store.dispatch(BillsActions.payBill({ bill })); }
  }

  toggleInactiveFilter(): void {
    this.filterInactive.update(v => !v);
  }

}

