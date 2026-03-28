import { Component, computed, effect, input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FieldDescription } from 'projects/model/src/lib/model';
import { getErrorMessage } from './validators/validators';

export interface DescriptionProvider {
  getDescriptionObj: (...path: string[]) => FieldDescription;
}
@Component({
  selector: 'app-input-base',
  template: '',
  standalone: true
})
export class InputBaseComponent {
  tooltipShowDelayValue = 1000;
  tooltipHideDelayValue = 2000;
  fieldFormGroup!: UntypedFormGroup;

  autoHide = input<boolean>(true);
  formGroup = input.required<UntypedFormGroup>();
  descriptionProvider = input.required<DescriptionProvider>();
  editMode = input<boolean>(true);
  path = input.required<string[]>();

  protected _labelText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.labelText || '');
  protected _tooltipText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.tooltipText || '');
  protected _placeholderText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.placeholderText || '');

  get visible(): boolean {
    if (this.autoHide() && !this.editMode()) {
      const controlValue = this.fieldFormGroup?.get(this.fieldName)?.value;
      return !this.formControl || controlValue === undefined || controlValue === null || controlValue === '' ? false : true;
    }
    return this.formControl ? true : false;
  }

  get formControl(): UntypedFormControl {
    return this.fieldFormGroup.get(this.fieldName) as UntypedFormControl;
  }

  private _fieldName!: string;
  get fieldName(): string {
    return this._fieldName;
  }

  private setFormGroupState(): void {
    if (this.fieldFormGroup) {
      if (this.editMode()) {
        this.fieldFormGroup.enable({ emitEvent: false, onlySelf: true });
      } else {
        this.fieldFormGroup.disable({ emitEvent: false, onlySelf: true });
      }
    }
  }

  constructor() {
    effect(() => {
      this.setFieldName();
      this.setFieldFormGroup();
      this.setFormGroupState();
    });
  }

  private setFieldName(): void {
    const path = this.path();
    if (path && path.length) {
      this._fieldName = path[path.length - 1];
    } else { this._fieldName = ''; }
  }

  private setFieldFormGroup(): void {
    const formGroup = this.formGroup();
    const path = this.path();
    if (formGroup && this.fieldName) {
      if (formGroup.get(this.fieldName) !== null) {
        this.fieldFormGroup = formGroup;
      }
      if (path.length > 1) {
        const parentFgPath = path.slice(0, -1);
        const parentFg = formGroup.get(parentFgPath) as UntypedFormGroup;
        if (parentFg !== null) {
          this.fieldFormGroup = parentFg;
        }
      }
      this.fieldFormGroup = formGroup;
    }
  }

  getErrorMessage(path: string[]): string {
    return getErrorMessage(path, this.formGroup());
  }
}
