import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Bill, BillDescription, Unit } from 'projects/model/src/lib/model';
import { AppState, BillsActions } from 'projects/store/src/lib/state';
import { DescriptionProvider } from 'projects/tools/src/lib/components/inputs/input-component-base';
import { SelectItem, unitsToSelectItems, validateDistinctBillName, validatePaymentReminderDate } from 'projects/tools/src/public-api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() bill?: Bill;
  @Input() bills?: Bill[];
  @Input() newBill: boolean = false;
  private _editMode = false;

  @Input() set editMode(val: boolean) {
    this._editMode = val;
  }
  get editMode(): boolean {
    return this._editMode;
  }

  canSave = false;

  unitEnumItems: SelectItem<Unit>[] = [];

  private statusSubscription = Subscription.EMPTY;

  form: FormGroup = new FormGroup({
    uid: new FormControl(),
    id: new FormControl(),
    name: new FormControl(undefined, [Validators.required, Validators.minLength(3)]),
    description: new FormControl(),
    active: new FormControl(undefined, Validators.required),
    deadline: new FormControl(undefined, Validators.required),
    repeat: new FormControl(),
    unit: new FormControl(),
    reminder: new FormControl(),
    sum: new FormControl(),
    share: new FormControl(undefined, Validators.required),
    url: new FormControl(),
    login: new FormControl(),
    password: new FormControl()
  });

  constructor(
    private store: Store<AppState>,
    private router: Router) {
    this.statusSubscription = this.form.statusChanges
      .subscribe({ next: status => this.setEditStatus(status) });
    this.setUnitEnumItems();
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.statusSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.editMode) { this.form.enable(); } else { this.form.disable(); }
    this.loadBill();
    this.setNameValidators();
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
    const bill = this.bill ? this.bill : new Bill();
    const value = this.createFormValueFromBill(bill);
    this.form.patchValue(value, { emitEvent: false, onlySelf: true });
    this.setNameValidators();
    this.setReminderValidators();
    this.form.markAllAsTouched();
  }

  private setNameValidators(): void {
    const billsNames = this.bills?.map(b => b.name).filter(n => this.newBill ? true : n !== this.bill?.name) || [];
    const name = this.form.get('name');
    name?.setValidators([Validators.required, Validators.minLength(3), validateDistinctBillName(billsNames)]);
    name?.updateValueAndValidity();
  }

  private setReminderValidators(): void {
    const reminder = this.form.get('reminder') as FormControl;
    const deadline = this.form.get('deadline') as FormControl;
    reminder?.setValidators([validatePaymentReminderDate(deadline)]);
    reminder?.updateValueAndValidity();
  }

  editBill(): void {
    this.editMode = true;
  }

  payBill(): void {
    if (this.bill) {
      this.store.dispatch(BillsActions.payBill({ bill: this.bill }));
    }
  }

  saveBill(): void {
    const bill = this.createBillFromFormValue(this.form.value);
    if (this.newBill) {
      this.store.dispatch(BillsActions.createBill({ bill }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill }));
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
      this.editMode = false;
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
