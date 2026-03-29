import { Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill, BillDescription, Unit } from 'projects/model/src/lib/model';
import { addDays } from 'projects/model/src/public-api';
import { AppState, BillsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { InputCurrencyComponent, InputDateComponent, InputHyperlinkComponent, InputPercentComponent, InputSelectComponent, InputTextComponent, InputToggleComponent, SelectItem, unitsToSelectItems, validateDistinctBillName, validatePaymentReminderDate } from 'projects/tools/src/public-api';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss'],
  imports: [ReactiveFormsModule, MatButtonModule, InputTextComponent, InputDateComponent, InputToggleComponent, InputSelectComponent, InputCurrencyComponent, InputPercentComponent, InputHyperlinkComponent]
})
export class BillEditComponent {
  bill = input<Bill>();
  bills = input<Bill[]>();
  newBill = input<boolean>(false);
  editMode = input<boolean>(false);
  showSaveAndClose = input<boolean>(true);

  editModeChange = output<boolean>();

  unitEnumItems: SelectItem<Unit>[] = unitsToSelectItems();

  #destroyRef = inject(DestroyRef);
  private store = inject(Store<AppState>);
  private router = inject(Router);
  private loadingFormValue = false;

  form: FormGroup = new FormGroup({
    lp: new FormControl<number | undefined>(-1),
    name: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl<string | undefined>(undefined),
    active: new FormControl<boolean>(true, Validators.required),
    url: new FormControl<string | undefined>(undefined),
    login: new FormControl<string | undefined>(undefined),
    sum: new FormControl<number>(0),
    share: new FormControl<number>(1, Validators.required),
    deadline: new FormControl<Date | undefined>(undefined, Validators.required),
    repeat: new FormControl<number>(1),
    unit: new FormControl<Unit>(Unit.Month),
    reminder: new FormControl<Date | undefined>(undefined),
    id: new FormControl<number>(-1),
  });

  canSave = toSignal(
    this.form.statusChanges.pipe(map(s => s === 'VALID')),
    { initialValue: false }
  );

  descriptionProvider: DescriptionProvider = {
    getDescriptionObj: (...path: string[]) => BillDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
  };

  constructor() {
    const deadlineCtl = this.form.get('deadline') as FormControl<Date | undefined>;
    const reminderCtl = this.form.get('reminder') as FormControl<Date | undefined>;
    deadlineCtl.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef), filter(() => !this.loadingFormValue))
      .subscribe(val => reminderCtl.setValue(addDays(-7, val)));

    effect(() => this.loadBill());
  }

  private createFormValueFromBill(bill: Bill): Partial<Bill> {
    return {
      id: bill.id,
      name: bill.name,
      description: bill.description,
      active: bill.active,
      deadline: bill.deadline,
      repeat: bill.repeat,
      unit: bill.unit,
      reminder: bill.reminder,
      sum: bill.sum,
      share: bill.share,
      url: bill.url,
      login: bill.login,
    };
  }

  private createBillFromFormValue(value: Partial<Bill>): Bill {
    return new Bill(
      value.lp,
      value.name,
      value.description,
      value.active,
      value.url,
      value.login,
      value.sum,
      value.share,
      value.deadline,
      value.repeat,
      value.unit,
      value.reminder,
      value.id
    );
  }

  private loadBill(): void {
    this.loadingFormValue = true;
    const bill = this.bill() ?? new Bill();
    const value = this.createFormValueFromBill(bill);
    this.form.patchValue(value, { emitEvent: false, onlySelf: true });
    this.setNameValidators();
    this.setReminderValidators();
    this.form.markAllAsTouched();
    this.loadingFormValue = false;
  }

  private setNameValidators(): void {
    const billsNames = this.bills()?.map(b => b.name).filter(n => this.newBill() ? true : n !== this.bill()?.name) || [];
    const name = this.form.get('name');
    name?.setValidators([Validators.required, Validators.minLength(3), validateDistinctBillName(billsNames)]);
    name?.updateValueAndValidity();
  }

  private setReminderValidators(): void {
    const reminder = this.form.get('reminder') as FormControl<Date | undefined>;
    const deadline = this.form.get('deadline') as FormControl<Date | undefined>;
    reminder?.setValidators([validatePaymentReminderDate(deadline)]);
    reminder?.updateValueAndValidity();
  }

  editBill(): void {
    this.editModeChange.emit(true);
  }

  payBill(): void {
    const bill = this.bill();
    if (bill) {
      this.store.dispatch(BillsActions.payBill({ bill }));
    }
  }

  saveBill(): void {
    const bill = this.createBillFromFormValue(this.form.value as Partial<Bill>);
    if (this.newBill()) {
      this.store.dispatch(BillsActions.createBill({ bill, redirect: false }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill, redirect: false }));
    }
  }

  saveBillAndClose(): void {
    const bill = this.createBillFromFormValue(this.form.value as Partial<Bill>);
    if (this.newBill()) {
      this.store.dispatch(BillsActions.createBill({ bill, redirect: false }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill, redirect: true }));
    }
  }

  deleteBill(): void {
    const bill = this.bill();
    if (bill) {
      this.store.dispatch(BillsActions.deleteBill({ bill }));
    }
  }

  cancel(): void {
    if (this.newBill()) {
      this.router.navigate(['/zestawienie']);
    } else {
      this.editModeChange.emit(false);
      this.loadBill();
    }
  }

  getErrorMessage(...path: string[]): string {
    const formControl = this.form.get(path);
    if (formControl !== null) {
      const errors = formControl.errors;
      if (errors) {
        return errors.values().join('\n');
      }
    }
    return 'Invalid value provided';
  }

}
