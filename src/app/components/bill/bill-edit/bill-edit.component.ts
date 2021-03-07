import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Bill } from 'src/app/model/bill';
import { ConfirmationService } from 'src/app/services/confirmation.service';

import { ConfirmDialogResponse } from '../../tools/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogInputType } from '../../tools/confirm-dialog/confirm-dialog.model';
import { DescriptionProvider } from '../../tools/inputs/input-component-base';
import { unitsToSelectItems } from '../../tools/inputs/input-select/input-select.component';
import { validateBillName, validateDistinctBillName } from '../../tools/inputs/validators/validators';
import { BillDescription } from './../../../model/bill';
import { Unit } from './../../../model/unit';
import { BillsFirebaseService } from './../../../services/bills.firebase.service';
import { SelectItem } from './../../tools/inputs/input-select/input-select.component';

@Component({
  selector: 'app-bill-edit',
  templateUrl: './bill-edit.component.html',
  styleUrls: ['./bill-edit.component.scss']
})
export class BillEditComponent implements OnInit {

  private _bill: Bill;
  @Input() set bill(val: Bill) {
    this._bill = val;
    Promise.resolve().then(() => this.loadBill());
  }
  get bill(): Bill {
    return this._bill;
  }
  @Input() newBill: boolean;
  private _editMode: boolean = false;
  @Input() set editMode(val: boolean) {
    this._editMode = val;
  }
  get editMode(): boolean {
    return this._editMode;
  }
  @Output() loading: EventEmitter<boolean> = new EventEmitter<boolean>();
  canSave = false;

  unitEnumItems: SelectItem<Unit>[] = [];

  private subscription = Subscription.EMPTY;

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

  constructor(private billsFirebaseService: BillsFirebaseService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {
    this.form.statusChanges.subscribe(status => this.setEditStatus(status));
    this.setUnitEnumItems();
  }

  ngOnInit() {
  }

  private loadBill() {
    if (this.bill) {
      this.form.patchValue({
        uid: this.bill.uid,
        id: this.bill.id,
        name: this.bill.name,
        description: this.bill.description,
        active: this.bill.active,
        deadline: this.bill.deadline ? this.bill.deadline.toDate() : undefined,
        repeat: this.bill.repeat,
        unit: this.bill.unit,
        reminder: this.bill.reminder ? this.bill.reminder.toDate() : undefined,
        sum: this.bill.sum,
        share: this.bill.share,
        url: this.bill.url,
        login: this.bill.login,
        password: this.bill.password
      });
    }
    this.setEditStatus(this.form.status);
    this.subscription.unsubscribe();
    this.subscription = this.billsFirebaseService.billsObservable.subscribe(bills => {
      const billsNames = bills.map(bill => bill.name).filter(name => name !== this.bill.name);
      this.form.get('name').setValidators([Validators.required, Validators.minLength(3), validateDistinctBillName(billsNames)]);
    });
    if (this.editMode) { this.form.enable(); } else { this.form.disable(); }
  }

  editBill() {
    this.loading.emit(true);
    this.editMode = true;
    this.loading.emit(false);
  }

  payBill() {
    this.confirmationService
      .confirm('Rachunek opłacony',
        'Podaj kwotę do zapłacenia (udział zostanie wyliczony automatycznie):', 'Anuluj', 'OK',
        ConfirmDialogInputType.InputTypeCurrency, this.bill.sum, [Validators.required], 'Kwota', 'Kwota')
      .subscribe((response) => {
        if (response) {
          this.loading.emit(true);
          this.billsFirebaseService.pay(this.bill, Number((response as ConfirmDialogResponse).value))
            .then(() => {
              this.loading.emit(false);
              this.snackBar.open('Opłacenie rachunku zapisane!', 'Ukryj', { duration: 3000 });
            },
              error => this.snackBar.open('Błąd zapisania opłacenia rachunku: ' + error,
                'Ukryj', { panelClass: 'snackbar-style-error' })
            );
        }
      });
  }

  saveBill() {
    this.loading.emit(true);
    const bill = this.form.value;
    if (bill.uid) {
      this.setBill(bill);
    } else {
      this.addBill(bill);
    }
  }

  deleteBill() {
    if (!this.newBill) {
      this.confirmationService
        .confirm('Usuń rachunek',
          'Czy na pewno chcesz usunąć bieżący rachunek wraz z historią płatności? Operacji nie będzie można cofnąć! ' +
          'Aby potwierdzić podaj nazwę rachunku.', 'Nie', 'Tak',
          ConfirmDialogInputType.InputTypeText, undefined,
          [Validators.required, validateBillName(this.bill.name)],
          'Nazwa rachunku', 'Nazwa rachunku')
        .subscribe((response) => {
          if (response) {
            this.loading.emit(true);
            this.billsFirebaseService.delete(this.bill).then(() => {
              this.loading.emit(false);
              this.snackBar.open('Usunięto rachunek.', 'Ukryj', { duration: 3000 });
              this.router.navigate(['/zestawienie']);
            },
              error => this.snackBar.open('Błąd usuwania rachunku: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' }));
          }
        });
    }
  }

  cancel() {
    if (this.newBill) {
      this.router.navigate(['/zestawienie']);
    } else {
      this.editMode = false;
      this.loadBill();
    }
  }

  private setBill(bill: Bill) {
    this.billsFirebaseService.update(bill)
      .then(() => {
        this.editMode = false;
        this.loading.emit(false);
        this.snackBar.open('Dane zapisane!', 'Ukryj', { duration: 3000 });
      })
      .catch((error) => {
        this.loading.emit(false);
        this.snackBar.open('Błąd zapisu danych: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' });
      });
  }

  private addBill(bill: Bill) {
    this.billsFirebaseService.add(bill)
      .then((ref) => {
        this.loading.emit(false);
        this.snackBar.open('Dodano rachunek!', 'Ukryj', { duration: 3000 });
        this.router.navigate([bill.id], { relativeTo: this.route });
      })
      .catch((error) => {
        this.loading.emit(false);
        this.snackBar.open('Błąd zapisu danych: ' + error, 'Ukryj', { panelClass: 'snackbar-style-error' });
      });
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
      getDescriptionObj: (...path: string[]) => BillDescription.get(path[0])
    };
  }

  private setUnitEnumItems() {
    this.unitEnumItems = unitsToSelectItems();
  }

  private setEditStatus(status: string) {
    this.canSave = status === 'VALID' ? true : false;
  }

}
