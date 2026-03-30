import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { FieldDescription } from 'projects/model/src/lib/model';
import { getErrorMessage } from './validators/validators';

export interface DescriptionProvider {
  getDescriptionObj: (...path: string[]) => FieldDescription;
}
@Component({
  selector: 'app-input-base',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputBaseComponent {
  tooltipShowDelayValue = 1000;
  tooltipHideDelayValue = 2000;

  autoHide = input<boolean>(false);
  formGroup = input.required<UntypedFormGroup>();
  descriptionProvider = input.required<DescriptionProvider>();
  editMode = input<boolean>(true);
  path = input.required<string[]>();

  protected _labelText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.labelText || '');
  protected _tooltipText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.tooltipText || '');
  protected _placeholderText = computed(() => this.descriptionProvider().getDescriptionObj(...this.path())?.placeholderText || '');

  fieldName = computed(() => {
    const path = this.path();
    return path?.length ? path[path.length - 1] : '';
  });

  fieldFormGroup = computed(() => {
    const formGroup = this.formGroup();
    const path = this.path();
    const fieldName = this.fieldName();
    if (!formGroup || !fieldName) return formGroup;
    if (path.length > 1) {
      const parentFg = formGroup.get(path.slice(0, -1)) as UntypedFormGroup;
      if (parentFg) return parentFg;
    }
    return formGroup;
  });

  formControl = computed(() => this.fieldFormGroup()?.get(this.fieldName()) as UntypedFormControl);

  visible = computed(() => {
    const fc = this.formControl();
    if (this.autoHide() && !this.editMode()) {
      const controlValue = fc?.value;
      return !fc || controlValue === undefined || controlValue === null || controlValue === '' ? false : true;
    }
    return fc ? true : false;
  });

  constructor() {
    effect(() => {
      const fg = this.fieldFormGroup();
      if (fg) {
        if (this.editMode()) {
          fg.enable({ emitEvent: false, onlySelf: true });
        } else {
          fg.disable({ emitEvent: false, onlySelf: true });
        }
      }
    });
  }

  getErrorMessage(path: string[]): string {
    return getErrorMessage(path, this.formGroup());
  }
}
