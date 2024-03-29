import { Component, Input, OnChanges, SimpleChanges, WritableSignal, signal } from '@angular/core';
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
export class InputBaseComponent implements OnChanges {
  tooltipShowDelayValue = 1000;
  tooltipHideDelayValue = 2000;
  fieldFormGroup!: UntypedFormGroup;

  @Input() autoHide: boolean = true;
  @Input() formGroup!: UntypedFormGroup;
  @Input() descriptionProvider!: DescriptionProvider;
  @Input() editMode: boolean = true;
  @Input() path!: string[];

  protected _labelText: WritableSignal<string> = signal<string>('');
  protected _tooltipText: WritableSignal<string> = signal<string>('');
  protected _placeholderText: WritableSignal<string> = signal<string>('');

  private _setLabelText(): void {
    this._labelText.set(this.descriptionProvider.getDescriptionObj(...this.path)?.labelText || '');
  }

  private _setTooltipText(): void {
    this._tooltipText.set(this.descriptionProvider.getDescriptionObj(...this.path)?.tooltipText || '');
  }

  private _setPlaceholderText(): void {
    this._placeholderText.set(this.descriptionProvider.getDescriptionObj(...this.path)?.placeholderText || '');
  }

  get visible(): boolean {
    if (this.autoHide && !this.editMode) {
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
      if (this.editMode) {
        this.fieldFormGroup.enable({ emitEvent: false, onlySelf: true });
      } else {
        this.fieldFormGroup.disable({ emitEvent: false, onlySelf: true });
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.path) {
      this.setFieldName();
      this._setLabelText();
      this._setTooltipText();
      this._setPlaceholderText();
    }
    if (changes.path || changes.formGroup) {
      this.setFieldFormGroup();
    }
    if (changes.editMode || changes.formGroup) {
      this.setFormGroupState();
    }
  }

  private setFieldName(): void {
    if (this.path && this.path.length) {
      this._fieldName = this.path[this.path.length - 1];
    } else { this._fieldName = ''; }
  }

  private setFieldFormGroup(): void {
    if (this.formGroup && this.fieldName) {
      if (this.formGroup.get(this.fieldName) !== null) {
        this.fieldFormGroup = this.formGroup;
      }
      if (this.path.length > 1) {
        const parentFgPath = this.path.slice(0, -1);
        const parentFg = this.formGroup.get(parentFgPath) as UntypedFormGroup;
        if (parentFg !== null) {
          this.fieldFormGroup = parentFg;
        }
      }
      this.fieldFormGroup = this.formGroup;
    }
  }

  getErrorMessage(path: string[]): string {
    return getErrorMessage(path, this.formGroup);
  }
}
