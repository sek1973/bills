import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Payment, RealtimeService } from 'model';
import moment from 'moment';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { AppState, BillsActions, BillsSelectors, PaymentsActions, PaymentsSelectors } from 'store';
import { CurrencyToStringPipe, DateToStringPipe, TableCellDirective, TableColumn, TableComponent, ThemeService } from 'tools';
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
  columns: TableColumn[] = [
    { name: 'deadline', header: 'Termin', sort: true, filter: true },
    { name: 'paiddate', header: 'Zapłacono', sort: true, filter: true },
    { name: 'sum', header: 'Kwota', sort: true, filter: true },
    { name: 'reminder', header: 'Przypomnienie', sort: true, filter: true },
    { name: 'remarks', header: 'Uwagi', sort: true, filter: true }
  ];
  bill?: Bill;

  #destroyRef = inject(DestroyRef);
  dialog = inject(MatDialog);
  private store = inject(Store<AppState>);
  private realtimeService = inject(RealtimeService);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.subscribeToBill();
    this.subscribeToData();
    this.subscribeToRealtimeChanges();
  }

  private subscribeToRealtimeChanges(): void {
    this.realtimeService.paymentsChanges$
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        filter(billId => billId === this.bill?.id)
      )
      .subscribe(() => {
        if (this.bill) {
          this.store.dispatch(PaymentsActions.loadPayments({ billId: this.bill.id }));
        }
      });
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
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        distinctUntilChanged((a, b) => a?.id === b?.id)
      )
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

  paymentRowStyle = computed(() => {
    const isDark = this.themeService.darkMode();
    const closestId = this.closestUpcoming()?.id;
    return (row: Payment, index: number): Record<string, string> => {
      const style: Record<string, string> = {};
      const even = index % 2 === 0;
      if (row.paiddate) {
        style['background-color'] = even
          ? (isDark ? 'rgba(76,175,80,0.22)' : '#c8e6c9')
          : (isDark ? 'rgba(76,175,80,0.11)' : '#e8f5e9');
      } else {
        const now = moment();
        const deadline = moment(row.deadline);
        if (deadline.diff(now, 'days') < 1) {
          style['background-color'] = even
            ? (isDark ? 'rgba(244,67,54,0.25)' : '#ffcdd2')
            : (isDark ? 'rgba(244,67,54,0.12)' : '#ffebee');
        } else if (deadline.isBetween(moment().add(1, 'days'), moment().add(7, 'days'))) {
          style['background-color'] = even
            ? (isDark ? 'rgba(255,235,59,0.2)' : '#fcf7cb')
            : (isDark ? 'rgba(255,235,59,0.1)' : '#fbf9e6');
        }
      }
      if (row?.id && row.id === closestId) {
        style['font-weight'] = 'bold';
      }
      return style;
    };
  });

  payClosest(): void {
    if (this.bill) { this.store.dispatch(BillsActions.payBill({ bill: this.bill })); }
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
