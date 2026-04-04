import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Bill, Payment, PaymentDescription } from 'projects/model/src/lib/model';
import { AppState, PaymentsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { InputCurrencyComponent, InputDateComponent, InputTextComponent } from 'projects/tools/src/public-api';

export interface PaymentDialogData {
  bill: Bill;
  payment?: Payment;
}
@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, InputDateComponent, InputCurrencyComponent, InputTextComponent]
})
export class PaymentDialogComponent implements OnInit, AfterViewInit {

  protected readonly dialogTitle = computed(() => (this.payment ? 'Edytuj' : 'Dodaj') + ' płatność');
  protected payment?: Payment;
  protected bill?: Bill;
  protected dialogMode: 'add' | 'edit' = 'add';
  protected canSave = signal(false);

  form: UntypedFormGroup = new UntypedFormGroup({
    id: new UntypedFormControl(),
    deadline: new UntypedFormControl(new Date(), Validators.required),
    paiddate: new UntypedFormControl(null),
    sum: new UntypedFormControl(0, Validators.required),
    reminder: new UntypedFormControl(),
    remarks: new UntypedFormControl(),
    billId: new UntypedFormControl() // not visible
  });

  data = inject<PaymentDialogData>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private store = inject(Store<AppState>);

  constructor() {
    this.bill = this.data?.bill;
    this.payment = this.data?.payment;
    this.dialogMode = this.payment ? 'edit' : 'add';
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => this.setFormValue());
  }

  private setEditStatus(status: string): void {
    this.canSave.set(status === 'VALID');
  }

  private setFormValue(): void {
    let value: Partial<Payment>;
    if (this.payment) {
      value = {
        id: this.payment.id,
        deadline: this.payment.deadline,
        paiddate: this.payment.paiddate,
        sum: this.payment.sum,
        reminder: this.payment.reminder,
        remarks: this.payment.remarks
      };
    } else {
      value = {
        deadline: new Date(),
        paiddate: undefined,
        sum: this.bill?.sum ?? 0,
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
    payment.reminder = val.reminder;
    payment.paiddate = val.paiddate;
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
