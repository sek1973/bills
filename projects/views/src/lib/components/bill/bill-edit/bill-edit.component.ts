import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill, BillDescription, Unit } from 'projects/model/src/lib/model';
import { addDays } from 'projects/model/src/public-api';
import { AppState, BillsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { SelectItem, unitsToSelectItems, validateDistinctBillName, validatePaymentReminderDate } from 'projects/tools/src/public-api';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnDestroy, OnChanges {
  @Input() bill?: Bill;
  @Input() bills?: Bill[];
  @Input() newBill: boolean = false;
  @Input() editMode: boolean = false;
  @Output() editModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showSaveAndClose: boolean = true;
  canSave = false;

  unitEnumItems: SelectItem<Unit>[] = [];

  private destroyed$: Subject<void> = new Subject<void>();
  private loadingFormValue: boolean = true;

  form: UntypedFormGroup = new UntypedFormGroup({
    uid: new UntypedFormControl(),
    id: new UntypedFormControl(),
    name: new UntypedFormControl(undefined, [Validators.required, Validators.minLength(3)]),
    description: new UntypedFormControl(),
    active: new UntypedFormControl(undefined, Validators.required),
    deadline: new UntypedFormControl(undefined, Validators.required),
    repeat: new UntypedFormControl(),
    unit: new UntypedFormControl(),
    reminder: new UntypedFormControl(),
    sum: new UntypedFormControl(),
    share: new UntypedFormControl(undefined, Validators.required),
    url: new UntypedFormControl(),
    login: new UntypedFormControl(),
    password: new UntypedFormControl()
  });

  constructor(
    private store: Store<AppState>,
    private router: Router) {
    this.subscribeToStatusChanges();
    this.subscribeToDeadlineChange();
  }

  private subscribeToStatusChanges(): void {
    this.form.statusChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe({ next: status => this.setEditStatus(status) });
    this.setUnitEnumItems();
  }

  private subscribeToDeadlineChange(): void {
    const deadlineCtl = this.form.get('deadline') as UntypedFormControl;
    const reminderCtl = this.form.get('reminder') as UntypedFormControl;
    deadlineCtl.valueChanges
      .pipe(takeUntil(this.destroyed$),
        filter(() => !this.loadingFormValue))
      .subscribe((val: Date) => {
        reminderCtl.setValue(addDays(-7, val));
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadBill();
  }

  private createFormValueFromBill(bill: Bill): any {
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
      password: bill.password
    };
  }

  private createBillFromFormValue(value: any): Bill {
    return new Bill(
      value.lp,
      value.name,
      value.description,
      value.active,
      value.url,
      value.login,
      value.password,
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
    const bill = this.bill ? this.bill : new Bill();
    const value = this.createFormValueFromBill(bill);
    this.form.patchValue(value, { emitEvent: false, onlySelf: true });
    this.setNameValidators();
    this.setReminderValidators();
    this.form.markAllAsTouched();
    this.loadingFormValue = false;
  }

  private setNameValidators(): void {
    const billsNames = this.bills?.map(b => b.name).filter(n => this.newBill ? true : n !== this.bill?.name) || [];
    const name = this.form.get('name');
    name?.setValidators([Validators.required, Validators.minLength(3), validateDistinctBillName(billsNames)]);
    name?.updateValueAndValidity();
  }

  private setReminderValidators(): void {
    const reminder = this.form.get('reminder') as UntypedFormControl;
    const deadline = this.form.get('deadline') as UntypedFormControl;
    reminder?.setValidators([validatePaymentReminderDate(deadline)]);
    reminder?.updateValueAndValidity();
  }

  editBill(): void {
    this.editModeChange.emit(true);
  }

  payBill(): void {
    if (this.bill) {
      this.store.dispatch(BillsActions.payBill({ bill: this.bill }));
    }
  }

  saveBill(): void {
    const bill = this.createBillFromFormValue(this.form.value);
    if (this.newBill) {
      this.store.dispatch(BillsActions.createBill({ bill, redirect: false }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill, redirect: false }));
    }
  }

  saveBillAndClose(): void {
    const bill = this.createBillFromFormValue(this.form.value);
    if (this.newBill) {
      this.store.dispatch(BillsActions.createBill({ bill, redirect: false }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill, redirect: true }));
    }
  }

  deleteBill(): void {
    if (this.bill) {
      this.store.dispatch(BillsActions.deleteBill({ bill: this.bill }));
    }
  }

  cancel(): void {
    if (this.newBill) {
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

  getDescriptionProvider(): DescriptionProvider {
    return {
      getDescriptionObj: (...path: string[]) => BillDescription.get(path[0]) || { tooltipText: '', placeholderText: '', labelText: '' }
    };
  }

  private setUnitEnumItems(): void {
    this.unitEnumItems = unitsToSelectItems();
  }

  private setEditStatus(status: string): void {
    this.canSave = status === 'VALID' ? true : false;
  }

}
