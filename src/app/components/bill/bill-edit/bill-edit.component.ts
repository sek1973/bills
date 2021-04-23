import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Bill } from 'src/app/model/bill';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { BillsActions, BillsSelectors } from 'src/app/state';
import { AppState } from 'src/app/state/app/app.state';
import { BillsService } from '../../../services/bills.service';
import { ConfirmDialogResponse } from '../../tools/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInputType } from '../../tools/confirm-dialog/confirm-dialog.model';
import { DescriptionProvider } from '../../tools/inputs/input-component-base';
import { unitsToSelectItems } from '../../tools/inputs/input-select/input-select.component';
import { validateBillName, validateDistinctBillName } from '../../tools/inputs/validators/validators';
import { BillDescription } from './../../../model/bill';
import { Unit } from './../../../model/unit';
import { SelectItem } from './../../tools/inputs/input-select/input-select.component';


@Component({
  selector: 'app-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {
  bill!: Bill;
  @Input() newBill: boolean = false;
  private _editMode = false;
  @Input() set editMode(val: boolean) {
    this._editMode = val;
  }
  get editMode(): boolean {
    return this._editMode;
  }
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  canSave = false;

  unitEnumItems: SelectItem<Unit>[] = [];

  private billSubscription = Subscription.EMPTY;
  private billsSubscription = Subscription.EMPTY;

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
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {
    this.form.statusChanges.subscribe({ next: status => this.setEditStatus(status) });
    this.setUnitEnumItems();
  }

  ngOnInit(): void {
    this.init();
  }

  private loadBill(bill?: Bill): void {
    this.bill = bill ? bill : new Bill();
    this.form.patchValue({
      id: this.bill.id,
      name: this.bill.name,
      description: this.bill.description,
      active: this.bill.active,
      deadline: this.bill.deadline,
      repeat: this.bill.repeat,
      unit: this.bill.unit,
      reminder: this.bill.reminder,
      sum: this.bill.sum,
      share: this.bill.share,
      url: this.bill.url,
      login: this.bill.login,
      password: this.bill.password
    });
  }

  private init(): void {
    this.setEditStatus(this.form.status);
    this.billSubscription.unsubscribe();
    this.billSubscription = this.store.select(BillsSelectors.selectBill)
      .subscribe(bill => this.loadBill(bill));
    this.billsSubscription.unsubscribe();
    this.billsSubscription = this.store.select(BillsSelectors.selectAll)
      .subscribe(bills => {
        const billsNames = bills.map(b => b.name);
        this.form.get('name')?.setValidators([Validators.required, Validators.minLength(3), validateDistinctBillName(billsNames)]);
      });
    if (this.editMode) { this.form.enable(); } else { this.form.disable(); }
  }

  editBill(): void {
    this.loading.emit(true);
    this.editMode = true;
    this.loading.emit(false);
  }

  payBill(): void {
    this.store.dispatch(BillsActions.payBill({ bill: this.bill }));
  }

  saveBill(): void {
    const bill = this.form.value;
    if (this.newBill) {
      this.store.dispatch(BillsActions.createBill({ bill }));
    } else {
      this.store.dispatch(BillsActions.updateBill({ bill }));
    }
  }

  deleteBill(): void {
    this.store.dispatch(BillsActions.deleteBill({ bill: this.bill }));
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
