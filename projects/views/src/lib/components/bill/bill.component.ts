import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill } from 'projects/model/src/lib/model';
import { AppState, BillDetailsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {

  private subscription = Subscription.EMPTY;
  editMode = false;
  newBill = false;
  bill?: Bill;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>) {
    this.subscription = this.store.select(BillsSelectors.selectBill)
      .subscribe(bill => this.bill = bill);
  }

  ngOnInit(): void {
    let id: number;
    this.subscription = this.route.paramMap.subscribe(param => {
      const val = param.get('id');
      id = val?.length ? Number.parseInt(val, undefined) : -1;
      this.store.dispatch(BillDetailsActions.setCurrentBill({ billId: id }));
    });
  }

  private handleData(bills: Bill[], id: number): void {
    this.bill = bills.find(b => b.id === id);
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
    this.subscription.unsubscribe();
  }

  getTitle(): string {
    const title = this.bill?.name;
    return title || 'Rachunek bez nazwy';
  }

}
