import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Payment } from 'projects/model/src/lib/model';
import { AppState, BillsSelectors, PaymentsActions, PaymentsSelectors } from 'projects/store/src/lib/state';
import { TableCellDirective } from 'projects/tools/src/lib/components/table/directives/table-cell.directive';
import { CurrencyToStringPipe } from 'projects/tools/src/lib/pipes/currency-to-string.pipe';
import { DateToStringPipe } from 'projects/tools/src/lib/pipes/timespan-to-string.pipe';
import { TableComponent } from 'projects/tools/src/public-api';
import { filter } from 'rxjs/operators';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableComponent, TableCellDirective, DateToStringPipe, CurrencyToStringPipe]
})
export class PaymentsComponent implements OnInit {

  @ViewChild('table', { read: TableComponent }) table!: TableComponent<Payment>;

  activeRow?: Payment;
  data = signal<Payment[]>([]);
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'share', header: 'Udział' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  bill?: Bill;

  #destroyRef = inject(DestroyRef);
  dialog = inject(MatDialog);
  private store = inject(Store<AppState>);

  ngOnInit(): void {
    this.subscribeToBill();
    this.subscribeToData();
  }

  private subscribeToData(): void {
    this.store
      .select(PaymentsSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.#destroyRef),
        filter(() => !!this.bill))
      .subscribe({
        next: payments => this.data.set(payments || [])
      });
  }

  private subscribeToBill(): void {
    this.store
      .select(BillsSelectors.selectBill)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        next: bill => {
          this.bill = bill;
          this.store.dispatch(PaymentsActions.loadPayments({ billId: this.bill?.id || -1 }));
        }
      });
  }


  onRowClicked(row: Payment): void {
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
    const row = this.table.activeRow();
    if (row) { this.openDialog(row); }
  }

  private openDialog(payment?: Payment): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { payment, bill: this.bill }
    });

    dialogRef.afterClosed().subscribe();
  }

  deletePayment(): void {
    const row = this.table.activeRow();
    if (row) {
      this.store.dispatch(PaymentsActions.deletePayment({ payment: row }));
    }
  }

  onRowActivated(row: Payment | undefined): void {
    if (this.table) {
      this.table.canDelete.set(row ? true : false);
      this.table.canEdit.set(row ? true : false);
    }
  }

  pasteData(): void {
    this.store.dispatch(PaymentsActions.importPayments({ billId: this.bill?.id || -1 }));
  }

}
