import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService } from 'src/app/services/system/confirmation.service';
import { PaymentsService } from '../../services/data/payments.service';
import { ConfirmDialogResponse } from '../tools/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInputType } from '../tools/confirm-dialog/confirm-dialog.model';
import { Payment } from './../../model/payment';
import { PaymentsDataSource } from './../../services/payments.datasource';
import { TableComponent } from './../tools/table/table.component';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';


@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  private _builUid!: string;
  @Input() set billUid(val: string) {
    this._builUid = val;
    this.setTableDataSource();
  }
  get billUid(): string {
    return this._builUid;
  }
  @ViewChild('table', { read: TableComponent })
  table!: TableComponent;
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();

  activeRow: any;

  dataSource?: PaymentsDataSource;
  columns = [
    { name: 'deadline', header: 'Termin' },
    { name: 'paiddate', header: 'Zapłacono' },
    { name: 'sum', header: 'Kwota' },
    { name: 'share', header: 'Udział' },
    { name: 'remarks', header: 'Uwagi' }
  ];

  constructor(
    private paymentsFirebaseService: PaymentsService,
    @Inject(MatDialog) public dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void { }

  private setTableDataSource(): void {
    this.dataSource = new PaymentsDataSource(this.paymentsFirebaseService, this.billUid);
    this.dataSource.load();
  }

  onRowClicked(row: any): void {
    if (this.activeRow !== row) {
      this.activeRow = row;
    }
  }

  getId(row: Payment): string | undefined {
    return row.uid;
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
      data: { payment, billUid: this.billUid }
    });

    dialogRef.afterClosed().subscribe();
  }

  deletePayment(): void {
    if (this.table.activeRow) {
      this.confirmationService
        .confirm('Usuń zrealizowaną płatność', 'Czy na pewno chcesz usunąć tę płatność z historii?', 'Nie', 'Tak')
        .subscribe((response) => {
          if (response) {
            this.paymentsFirebaseService.delete(this.table.activeRow, this.billUid).then(
              () => this.snackBar.open('Usunięto płatność.', 'Ukryj', { duration: 3000 }),
              error => this.snackBar.open('Błąd usuwania płatności: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' }));
          }
        });
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
            this.paymentsFirebaseService.importPayments(data, this.billUid).then(() => {
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
