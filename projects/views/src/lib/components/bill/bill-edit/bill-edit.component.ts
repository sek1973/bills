import { Component, DestroyRef, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill, BillDescription, Unit } from 'projects/model/src/lib/model';
import { addDays } from 'projects/model/src/public-api';
import { AppState, BillsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { SelectItem, unitsToSelectItems, validateDistinctBillName, validatePaymentReminderDate } from 'projects/tools/src/public-api';
import { filter } from 'rxjs';

@Component({
    selector: 'app-bill-edit',
    templateUrl: './bill-edit.component.html',
    styleUrls: ['./bill-edit.component.scss'],
    standalone: false
})
export class BillEditComponent implements OnChanges {
  @Input() bill?: Bill;
  @Input() bills?: Bill[];
  @Input() newBill: boolean = false;
  @Input() editMode: boolean = false;
  @Output() editModeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showSaveAndClose: boolean = true;
  canSave = false;

  unitEnumItems: SelectItem<Unit>[] = [];

  #destroyRef = inject(DestroyRef);
  private loadingFormValue: boolean = true;

  form: FormGroup = new FormGroup({
    lp: new FormControl<number | undefined>(-1),
    name: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl<string | undefined>(undefined),
    active: new FormControl<boolean>(true, Validators.required),
    url: new FormControl<string | undefined>(undefined),
    login: new FormControl<string | undefined>(undefined),
    password: new FormControl<string | undefined>(undefined),
    sum: new FormControl<number>(0),
    share: new FormControl<number>(1, Validators.required),
    deadline: new FormControl<Date | undefined>(undefined, Validators.required),
    repeat: new FormControl<number>(1),
    unit: new FormControl<Unit>(Unit.Month),
    reminder: new FormControl<Date | undefined>(undefined),
    id: new FormControl<number>(-1),
  });

  constructor(
    private store: Store<AppState>,
    private router: Router) {
    this.subscribeToStatusChanges();
    this.subscribeToDeadlineChange();
  }

  private subscribeToStatusChanges(): void {
    this.form.statusChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({ next: status => this.setEditStatus(status) });
    this.setUnitEnumItems();
  }

  private subscribeToDeadlineChange(): void {
    const deadlineCtl = this.form.get('deadline') as FormControl<Date | undefined>;
    const reminderCtl = this.form.get('reminder') as FormControl<Date | undefined>;
    deadlineCtl.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef),
        filter(() => !this.loadingFormValue))
      .subscribe((val: Date | undefined) => {
        reminderCtl.setValue(addDays(-7, val));
      });
  }

  ngOnChanges(): void {
    this.loadBill();
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
      password: bill.password
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
    const reminder = this.form.get('reminder') as FormControl<Date | undefined>;
    const deadline = this.form.get('deadline') as FormControl<Date | undefined>;
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
    const bill = this.createBillFromFormValue(this.form.value as Partial<Bill>);
    if (this.newBill) {
      this.store.dispatch(BillsActions.createBill({ bill, redirect: false }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill, redirect: false }));
    }
  }

  saveBillAndClose(): void {
    const bill = this.createBillFromFormValue(this.form.value as Partial<Bill>);
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
