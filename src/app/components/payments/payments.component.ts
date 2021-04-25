import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { PaymentsActions, PaymentsSelectors } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { PaymentsService } from '../../services/data/payments.service';
import { TableDataSource } from '../tools';
import { ConfirmDialogResponse } from '../tools/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInputType } from '../tools/confirm-dialog/confirm-dialog.model';
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

  activeRow: any;

  dataSource?: TableDataSource<Payment>;
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'share', header: 'Udział' },
    { name: 'remarks', header: 'Uwagi' }
  ];
  private dataSubscription = Subscription.EMPTY;

  constructor(
    private paymentsFirebaseService: PaymentsService,
    @Inject(MatDialog) public dialog: MatDialog,
    private store: Store<AppState>) { }

  ngOnInit(): void {
    this.dataSubscription = this.store
      .select(PaymentsSelectors.selectAll)
      .subscribe({
        next: payments => {
          if (this.dataSource) {
            this.dataSource.data = payments;
          } else {
            this.dataSource = new TableDataSource(payments);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
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
    this.dataSource?.load();
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
    this.confirmationService
      .confirm('Importuj historyczne płatności',
        'Wklej ze schowka lub wpisz dane w poniższe pole a następnie naciśnij importuj.', 'Anuluj', 'Importuj',
        ConfirmDialogInputType.InputTypeTextArea, undefined, [Validators.required], 'Dane', 'Dane')
      .subscribe((response) => {
        if (response) {
          this.loading.emit(true);
          const data = (response as ConfirmDialogResponse).value as string;
          if (!data || data === null || data === undefined || data === '') {
            this.loading.emit(false);
            this.snackBar.open('Brak danych do zaimportowania', 'Ukryj', { panelClass: 'snackbar-style-error' });
          } else {
            this.paymentsFirebaseService.importPayments(data, this.billId).then(() => {
              this.loading.emit(false);
              this.snackBar.open('Dane zaimportowane!', 'Ukryj', { duration: 3000 });
            },
              error => {
                this.loading.emit(false);
                this.snackBar.open('Błąd importu danych: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' });
              });
          }
        }
      });
  }

}
