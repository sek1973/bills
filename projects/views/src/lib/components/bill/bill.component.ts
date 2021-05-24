import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { AppState, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {

  private billSubscription = Subscription.EMPTY;
  private billsSubscription = Subscription.EMPTY;
  editMode = false;
  newBill = false;
  bill?: Bill;
  bills?: Bill[];
  routeParamId: number = -1;

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>) {
    this.billSubscription = this.store.select(BillsSelectors.selectBill)
      .subscribe(bill => {
        this.bill = bill;
        this.handleData();
      });
    this.billsSubscription = this.store.select(BillsSelectors.selectAll)
      .subscribe((bills) => {
        this.bills = bills;
        const val = this.route.snapshot.params['id' as keyof Params];
        this.dispatchSelectedBill(val);
      });
  }

  ngOnInit(): void {
    this.billSubscription = this.route.paramMap.subscribe(param => {
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
      this.editMode = true;
      this.newBill = true;
    } else {
      this.editMode = false;
      this.newBill = false;
    }
  }

  private createBill(): void {
    this.bill = new Bill();
  }

  ngOnDestroy(): void {
    this.billSubscription.unsubscribe();
  }

  getTitle(): string {
    const title = this.bill?.name;
    return title || 'Rachunek bez nazwy';
  }

}
