import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BillsSelectors, PaymentsActions, PaymentsSelectors } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { SchedulesActions } from 'src/app/state/schedule';
import { Payment } from './../../model/payment';
import { TableComponent } from './../tools/table/table.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit, OnDestroy {
  @ViewChild('table', { read: TableComponent })
  table!: TableComponent;
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeRow?: Payment;

  data: Payment[] = [];
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'share', header: 'Udział' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  billId: number = -1;

  private dataSubscription: Subscription = Subscription.EMPTY;
  private billIdSubscription: Subscription = Subscription.EMPTY;

  constructor(
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.subscribeToBillId();
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.dataSubscription = this.store
      .select(PaymentsSelectors.selectAll)
      .pipe(filter(() => this.billId > -1))
      .subscribe({
        next: payments => this.data = payments || []
      });
  }

  private subscribeToBillId(): void {
    this.billIdSubscription = this.store
      .select(BillsSelectors.selectBillId)
      .subscribe({
        next: billId => {
          this.billId = billId;
          this.store.dispatch(SchedulesActions.loadSchedules({ billId: this.billId }));
        }
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
    this.billIdSubscription.unsubscribe();
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
    this.store.dispatch(PaymentsActions.loadPayments({ billId: this.billId }));
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
      data: { payment, billUid: this.billId }
    });

    dialogRef.afterClosed().subscribe();
  }

  deletePayment(): void {
    if (this.table.activeRow) {
      this.store.dispatch(PaymentsActions.deletePayment({ payment: this.table.activeRow }));
    }
  }

  onRowActivated(row: Payment): void {
    this.table.canDelete = row ? true : false;
    this.table.canEdit = row ? true : false;
  }

  pasteData(): void {
    this.store.dispatch(PaymentsActions.importPayments({ billId: this.billId }));
  }

}
