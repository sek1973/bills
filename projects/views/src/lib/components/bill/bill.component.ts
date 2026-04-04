import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { Bill } from 'projects/model/src/lib/model';
import { AppState, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { PaymentsComponent } from '../payments/payments.component';
import { BillEditComponent } from './bill-edit/bill-edit.component';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatTooltipModule, BillEditComponent, PaymentsComponent]
})
export class BillComponent implements OnInit {
  billEdit = viewChild(BillEditComponent);
  paymentsComp = viewChild(PaymentsComponent);

  #destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private store = inject(Store<AppState>);

  protected readonly editMode = signal(false);
  protected readonly newBill = signal(false);
  protected readonly bill = signal<Bill | undefined>(undefined);
  protected readonly bills = signal<Bill[] | undefined>(undefined);
  protected routeParamId: number = -1;

  protected readonly activeColor = computed(() => this.bill()?.active ? 'primary' : 'basic');
  protected readonly amountDetailsVisible = computed(() => this.billEdit()?.showAmountDetails() ?? false);
  protected readonly detailsTooltip = computed(() => this.billEdit()?.showAmountDetails() ? 'Ukryj szczegóły' : 'Pokaż szczegóły');
  protected readonly detailsIcon = computed(() => this.billEdit()?.showAmountDetails() ? 'close' : 'more_horiz');
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
  payBill(): void { this.paymentsComp()?.payClosest(); }
  saveBill(): void { this.billEdit()?.saveBill(); }
  saveBillAndClose(): void { this.billEdit()?.saveBillAndClose(); }
  deleteBill(): void { this.billEdit()?.deleteBill(); }
  cancel(): void { this.billEdit()?.cancel(); }
  toggleActive(): void { this.billEdit()?.toggleActive(); }
  toggleAmountDetails(): void {
    const edit = this.billEdit();
    if (edit) edit.showAmountDetails.set(!edit.showAmountDetails());
  }

}
