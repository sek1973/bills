import { getSafe } from 'src/app/helpers';
import { Input, OnInit, Directive } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldDescription } from 'src/app/model/field-description';

export interface DescriptionProvider {
  getDescriptionObj: (...path: string[]) => FieldDescription;
}
@Directive()
export class InputComponentBase implements OnInit {
  tooltipShowDelayValue = 1000;
  tooltipHideDelayValue = 2000;
  fieldFormGroup: FormGroup;

  @Input() autoHide: boolean = true;
  private _formGroup: FormGroup;
  @Input() set formGroup(val: FormGroup) {
    this._formGroup = val;
    this.setFieldFormGroup();
  }
  get formGroup(): FormGroup {
    return this._formGroup;
  }
  @Input() descriptionProvider: DescriptionProvider;
  private _editMode: boolean = true;
  @Input() set editMode(val: boolean) {
    this._editMode = val;
    this.setFormGroupState();
  }
  get editMode(): boolean {
    return this._editMode;
  }

  get labelText(): string {
    return getSafe(() => this.descriptionProvider.getDescriptionObj(...this.path).labelText) || '';
  }

  get tooltipText(): string {
    return getSafe(() => this.descriptionProvider.getDescriptionObj(...this.path).tooltipText) || '';
  }

  get placeholderText(): string {
    return getSafe(() => this.descriptionProvider.getDescriptionObj(...this.path).placeholderText) || '';
  }

  get visible(): boolean {
    if (this.autoHide && !this.editMode) {
      const controlValue = getSafe(() => this.fieldFormGroup.get(this.fieldName).value);
      return !this.formControl || controlValue === undefined || controlValue === null || controlValue === '' ? false : true;
    }
    return this.formControl ? true : false;
  }

  private _path: string[];
  @Input()
  set path(val: string[]) {
    this._path = val;
    this.setFieldName();
    this.setFieldFormGroup();
  }
  get path(): string[] {
    return this._path;
  }

  get formControl(): FormControl {
    return this.fieldFormGroup.get(this.fieldName) as FormControl;
  }

  private _fieldName: string;
  get fieldName() {
    return this._fieldName;
  }

  private setFormGroupState(): void {
    if (this.fieldFormGroup) {
      if (this.editMode) {
        this.fieldFormGroup.enable();
      } else {
        this.fieldFormGroup.disable();
      }
    }
  }

  constructor() { }

  ngOnInit() {
    this.setFormGroupState();
  }

  private setFieldName() {
    if (this.path && this.path.length) {
      this._fieldName = this.path[this.path.length - 1];
    } else { this._fieldName = undefined; }
  }

  private setFieldFormGroup(): void {
    if (this.formGroup && this.fieldName) {
      if (this.formGroup.get(this.fieldName) !== null) {
        this.fieldFormGroup = this.formGroup;
      }
      if (this.path.length > 1) {
        const parentFgPath = this.path.slice(0, -1);
        const parentFg = <FormGroup>this.formGroup.get(parentFgPath);
        if (parentFg !== null) {
          this.fieldFormGroup = parentFg;
        }
      }
      this.fieldFormGroup = this.formGroup;
    }
  }

  getErrorMessage(...path: string[]): string {
    const formControl = this.formGroup.get(path);
    if (formControl !== null) {
      const errors = formControl.errors;
      if (errors && errors.values) {
        return errors.values.join('\n');
      }
    }
    return 'Niepoprawna wartość';
  }
}
