import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import moment from 'moment';
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
  closestUpcoming = signal<Payment | undefined>(undefined);
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'reminder', header: 'Przypomnienie' },
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
        next: payments => {
          const list = payments || [];
          this.data.set(list);
          this.updateClosestUpcoming(list);
        }
      });
  }

  private updateClosestUpcoming(payments: Payment[]): void {
    const unpaid = payments
      .filter(p => !p.paiddate && p.deadline)
      .sort((a, b) => moment(a.deadline).diff(moment(b.deadline)));
    this.closestUpcoming.set(unpaid.length ? unpaid[0] : undefined);
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

  paymentRowStyle = (row: Payment, index: number): Record<string, string> => {
    const style: Record<string, string> = {};
    const even = index % 2 === 0;
    if (row.paiddate) {
      style['background-color'] = even ? '#c8e6c9' : '#e8f5e9';
    } else {
      const now = moment();
      const deadline = moment(row.deadline);
      if (deadline.diff(now, 'days') < 1) {
        style['background-color'] = even ? '#ffcdd2' : '#ffebee';
      } else if (deadline.isBetween(moment().add(1, 'days'), moment().add(7, 'days'))) {
        style['background-color'] = even ? '#fcf7cb' : '#fbf9e6';
      }
    }

    if (row?.id && row.id === this.closestUpcoming()?.id) {
      style['font-weight'] = 'bold';
    }

    return style;
  };

  payClosest(): void {
    const closest = this.closestUpcoming();
    if (closest) {
      const withPaid = closest.clone(closest.id);
      withPaid.paiddate = new Date();
      this.dialog.open(PaymentDialogComponent, {
        width: '500px',
        data: { payment: withPaid, bill: this.bill, title: 'Edytuj zrealizowaną płatność' }
      }).afterClosed().subscribe(result => {
        if (result && result !== 'cancel') {
          const otherUpcoming = this.data().filter(p => !p.paiddate && p.deadline && p.id !== closest.id);
          if (!otherUpcoming.length) {
            this.addPayment();
          }
        }
      });
    } else {
      const today = new Date();
      this.dialog.open(PaymentDialogComponent, {
        width: '500px',
        data: { bill: this.bill, prefillPaidDate: today, prefillDeadline: today, title: 'Dodaj zrealizowaną płatność' }
      }).afterClosed().subscribe(result => {
        if (result && result !== 'cancel') {
          this.addPayment();
        }
      });
    }
  }

  addPayment(): void {
    this.openDialog();
  }

  editPayment(): void {
    const row = this.table.activeRow();
    if (row) { this.openDialog(row); }
  }

  private openDialog(payment?: Payment): void {
    // compute suggested base date for next payment
    let suggestedBase: Date = new Date();
    const list = this.data();
    if (list && list.length) {
      const unpaid = list
        .filter(p => !p.paiddate && p.deadline)
        .sort((a, b) => moment(a.deadline).diff(moment(b.deadline)));
      if (unpaid.length) {
        // take the latest upcoming deadline as base
        suggestedBase = unpaid[unpaid.length - 1].deadline ? new Date(unpaid[unpaid.length - 1].deadline) : new Date();
      } else {
        const paidWithDeadline = list
          .filter(p => p.paiddate && p.deadline)
          .sort((a, b) => moment(b.deadline).diff(moment(a.deadline)));
        if (paidWithDeadline.length) {
          suggestedBase = paidWithDeadline[0].deadline ? new Date(paidWithDeadline[0].deadline) : new Date();
        }
      }
    }

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { payment, bill: this.bill, suggestedBase }
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
