import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { Bill, Payment, UserSettingsService } from '@bills/model';
import { AppSelectors, AppState, BillsActions, BillsSelectors, PaymentsSelectors } from '@bills/store';
import { PullToRefreshDirective, ThemeService } from '@bills/tools';
import { PaymentsComponent } from '../payments/payments.component';
import { BillEditComponent } from './bill-edit/bill-edit.component';
import { PaymentsChartComponent } from './payments-chart/payments-chart.component';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, BillEditComponent, PaymentsComponent, PaymentsChartComponent, PullToRefreshDirective]
})
export class BillComponent implements OnInit {
  billEdit = viewChild(BillEditComponent);
  paymentsComponent = viewChild(PaymentsComponent);

  #destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private store = inject(Store<AppState>);
  private userSettings = inject(UserSettingsService);
  readonly themeService = inject(ThemeService);

  protected readonly editMode = signal(false);
  protected readonly newBill = signal(false);
  protected readonly bill = signal<Bill | undefined>(undefined);
  protected readonly bills = signal<Bill[] | undefined>(undefined);
  protected readonly payments = signal<Payment[]>([]);
  protected routeParamId: number = -1;

  readonly loading = toSignal(this.store.select(AppSelectors.selectLoading), { initialValue: false });
  protected readonly activeColor = computed(() => this.bill()?.active ? 'primary' : 'basic');
  protected readonly amountDetailsVisible = computed(() => this.userSettings.showAmountDetails());
  protected readonly detailsTooltip = computed(() => this.userSettings.showAmountDetails() ? 'Ukryj szczegóły' : 'Pokaż szczegóły');
  protected readonly activeLabel = computed(() => this.bill()?.active ? 'Aktywny' : 'Nieaktywny');

  constructor() {
    this.store.select(BillsSelectors.selectBill)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(bill => {
        this.bill.set(bill);
        this.handleData();
      });
    this.store.select(BillsSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((bills) => {
        this.bills.set(bills);
        const val = this.route.snapshot.params['id' as keyof Params];
        this.dispatchSelectedBill(val);
      });

    this.store.select(PaymentsSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(payments => this.payments.set(payments || []));

    if (!this.bills()?.length) {
      this.store.dispatch(BillsActions.loadOverviewBills());
    }

  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(param => {
        const val = param.get('id');
        this.dispatchSelectedBill(val as string);
      });
  }

  private dispatchSelectedBill(val: string): void {
    this.routeParamId = val?.length ? Number.parseInt(val, undefined) : -1;
    const bill = this.bills()?.find(b => b.id === this.routeParamId);
    this.store.dispatch(BillsActions.setCurrentBill({ bill }));
  }

  private handleData(): void {
    if (!this.bill()) {
      this.createBill();
      this.editMode.set(true);
      this.newBill.set(true);
    } else {
      this.editMode.set(false);
      this.newBill.set(false);
    }
  }

  private createBill(): void {
    this.bill.set(new Bill());
  }

  getTitle(): string {
    const title = this.bill()?.name;
    return title || 'Rachunek bez nazwy';
  }

  onEditModeChange(event: boolean): void {
    this.editMode.set(event);
  }

  editBill(): void { this.billEdit()?.editBill(); }
  payBill(): void {
    const bill = this.bill();
    if (bill) { this.store.dispatch(BillsActions.payBill({ bill })); }
  }
  saveBill(): void { this.billEdit()?.saveBill(); }
  deleteBill(): void { this.billEdit()?.deleteBill(); }
  cancel(): void { this.billEdit()?.cancel(); }
  refresh(): void {
    this.store.dispatch(BillsActions.loadOverviewBills());
    this.paymentsComponent()?.refresh();
  }
  toggleActive(): void { this.billEdit()?.toggleActive(); }
  toggleAmountDetails(): void {
    this.userSettings.showAmountDetails.update(v => !v);
  }

}
