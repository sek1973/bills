import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Payment, PaymentDescription } from 'projects/model/src/lib/model';
import { AppState, PaymentsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';

export interface PaymentDialogData {
  bill: Bill;
  payment?: Payment;
}
@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss']
})
export class PaymentDialogComponent implements OnInit, AfterViewInit {

  payment?: Payment;
  bill?: Bill;
  dialogTitle: string;
  dialogMode: 'add' | 'edit' = 'add';
  canSave = false;

  form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(),
    deadline: new UntypedFormControl(new Date(), Validators.required),
    paiddate: new UntypedFormControl(new Date(), Validators.required),
    sum: new UntypedFormControl(0, Validators.required),
    share: new UntypedFormControl(0, Validators.required),
    remarks: new UntypedFormControl(),
    billId: new UntypedFormControl() // not visible
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    private store: Store<AppState>) {
    this.bill = data?.bill;
    this.payment = data?.payment;
    this.dialogTitle = (this.payment ? 'Edytuj' : 'Dodaj') + ' zrealizowaną płatność';
    this.dialogMode = this.payment ? 'edit' : 'add';
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.setFormValue());
  }

  private setEditStatus(status: string): void {
    this.canSave = status === 'VALID' ? true : false;
  }

  private setFormValue(): void {
    let value: Partial<Payment>;
    if (this.payment) {
      value = {
        id: this.payment.id,
        deadline: this.payment.deadline,
        paidDate: this.payment.paidDate,
        sum: this.payment.sum,
        share: this.payment.share,
        remarks: this.payment.remarks
      };
    } else {
      value = {
        deadline: this.bill?.deadline ? new Date(this.bill?.deadline) : new Date(),
        paidDate: new Date(),
        sum: this.bill?.sum ?? 0,
        share: (this.bill?.sum || 0) * (this.bill?.share || 1)
      };
    }
    this.form.patchValue(value);
    this.setEditStatus(this.form.status);
  }

  closeDialog(): void {
    this.dialogRef.close('cancel');
  }

  saveData(): void {
    const val = this.form.value;
    const payment = this.payment ? this.payment.clone(this.payment.id) : new Payment();
    payment.deadline = val.deadline;
    payment.sum = val.sum;
    payment.share = val.share;
    payment.paidDate = val.paiddate;
    payment.remarks = val.remarks;
    payment.billId = this.bill?.id || -1;
    if (this.payment) {
      this.store.dispatch(PaymentsActions.updatePayment({ payment }));
    } else {
      this.store.dispatch(PaymentsActions.createPayment({ payment }));
    }
    this.dialogRef.close(payment);
  }

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => PaymentDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }
}
