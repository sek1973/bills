import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Payment } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, PaymentsActions, PaymentsSelectors } from 'projects/store/src/lib/state';
import { TableComponent } from 'projects/tools/src/public-api';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  
  @ViewChild('table', { read: TableComponent }) table!: TableComponent<Payment>;

  activeRow?: Payment;
  data: Payment[] = [];
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'share', header: 'Udział' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  bill?: Bill;

  private destroyed$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscribeToBill();
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.store
      .select(PaymentsSelectors.selectAll)
      .pipe(takeUntil(this.destroyed$),
        filter(() => !!this.bill))
      .subscribe({
        next: payments => this.data = payments || []
      });
  }

  private subscribeToBill(): void {
    this.store
      .select(BillsSelectors.selectBill)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: bill => {
          this.bill = bill;
          this.store.dispatch(PaymentsActions.loadPayments({ billId: this.bill?.id || -1 }));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onRowClicked(row: any): void {
    if (this.activeRow !== row) {
      this.activeRow = row;
    }
  }

  getId(row: Payment): number | undefined {
    return row?.id;
  }

  refresh(): void {
    this.store.dispatch(PaymentsActions.loadPayments({ billId: this.bill?.id || -1 }));
  }

  addPayment(): void {
    this.openDialog();
  }

  editPayment(): void {
    if (this.table.activeRow) { this.openDialog(this.table.activeRow); }
  }

  private openDialog(payment?: Payment): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { payment, bill: this.bill }
    });

    dialogRef.afterClosed().subscribe();
  }

  deletePayment(): void {
    if (this.table.activeRow) {
      this.store.dispatch(PaymentsActions.deletePayment({ payment: this.table.activeRow }));
    }
  }

  onRowActivated(row: Payment): void {
    if (this.table) {
      this.table.canDelete = row ? true : false;
      this.table.canEdit = row ? true : false;
    }
  }

  pasteData(): void {
    this.store.dispatch(PaymentsActions.importPayments({ billId: this.bill?.id || -1 }));
  }

}
