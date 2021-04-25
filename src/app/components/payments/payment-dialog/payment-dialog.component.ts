import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { getSafe } from 'src/app/helpers';
import { Payment } from 'src/app/model/payment';
import { PaymentsActions } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { DescriptionProvider } from '../../tools/inputs/input-component-base';
import { PaymentDescription } from './../../../model/payment';

export interface PaymentDialogData {
  billId: string;
  payment?: Payment;
}
@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit, AfterViewInit {

  payment: Payment;
  billId: number;
  dialogTitle: string;
  dialogMode: 'add' | 'edit' = 'add';
  loading = true;
  canSave = false;

  form: FormGroup = new FormGroup({
    uid: new FormControl(),
    deadline: new FormControl(new Date(), Validators.required),
    paiddate: new FormControl(new Date(), Validators.required),
    sum: new FormControl(0, Validators.required),
    share: new FormControl(0, Validators.required),
    remarks: new FormControl(),
    billId: new FormControl() // not visible
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    private store: Store<AppState>) {
    this.billId = getSafe(() => data.billId);
    this.payment = getSafe(() => data.payment);
    this.dialogTitle = (this.payment ? 'Edytuj' : 'Dodaj') + ' zrealizowaną płatność';
    this.dialogMode = this.payment ? 'edit' : 'add';
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
    this.loading = false;
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.setFormValue());
  }

  private setEditStatus(status: string): void {
    this.canSave = status === 'VALID' ? true : false;
  }

  private setFormValue(): void {
    if (this.payment) {
      const value = {
        id: this.payment.id,
        deadline: this.payment.deadline,
        paiddate: this.payment.paiddate,
        sum: this.payment.sum,
        share: this.payment.share,
        remarks: this.payment.remarks
      };
      this.form.patchValue(value);
    }
    this.setEditStatus(this.form.status);
  }

  closeDialog(): void {
    this.dialogRef.close('cancel');
  }

  saveData(): void {
    const val = this.form.value;
    this.payment.deadline = val.deadline;
    this.payment.sum = val.sum;
    this.payment.share = val.share;
    this.payment.paiddate = val.paiddate;
    this.payment.remarks = val.remarks;
    this.payment.billId = val.billid;
    if (this.payment.id === -1) {
      this.store.dispatch(PaymentsActions.updatePayment({ payment: this.payment }));
    } else {
      this.store.dispatch(PaymentsActions.createPayment({ payment: this.payment }));
    }
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => PaymentDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }
}
