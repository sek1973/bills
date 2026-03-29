import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Params, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { AppState, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { PaymentsComponent } from '../payments/payments.component';
import { SchedulesComponent } from '../schedules/schedules.component';
import { BillEditComponent } from './bill-edit/bill-edit.component';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatTooltipModule, MatTabsModule, BillEditComponent, PaymentsComponent, SchedulesComponent]
})
export class BillComponent implements OnInit {
  #destroyRef = inject(DestroyRef);

  editMode = signal(false);
  newBill = signal(false);
  bill?: Bill;
  bills?: Bill[];
  routeParamId: number = -1;

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>) {
    this.store.select(BillsSelectors.selectBill)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(bill => {
        this.bill = bill;
        this.handleData();
      });
    this.store.select(BillsSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((bills) => {
        this.bills = bills;
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
    const bill = this.bills?.find(b => b.id === this.routeParamId);
    this.store.dispatch(BillsActions.setCurrentBill({ bill }));
  }

  private handleData(): void {
    if (!this.bill) {
      this.createBill();
      this.editMode.set(true);
      this.newBill.set(true);
    } else {
      this.editMode.set(false);
      this.newBill.set(false);
    }
  }

  private createBill(): void {
    this.bill = new Bill();
  }

  getTitle(): string {
    const title = this.bill?.name;
    return title || 'Rachunek bez nazwy';
  }

  onEditModeChange(event: boolean): void {
    this.editMode.set(event);
  }

}
