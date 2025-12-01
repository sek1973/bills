import { Component } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getSafe } from 'projects/model/src/public-api';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddHiddenAttributeDirective } from '../directives/add-hidden-attribute.directive';
import { MatInputModule } from '@angular/material/input';
import { AddHrefAttributeDirective } from '../directives/add-href-attribute.directive';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-input-hyperlink',
    templateUrl: './input-hyperlink.component.html',
    styleUrls: ['./input-hyperlink.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, AddHrefAttributeDirective, MatInputModule, AddHiddenAttributeDirective, MatTooltipModule]
})
export class InputHyperlinkComponent extends InputBaseComponent {

  constructor() { super(); }

  get formControl(): UntypedFormControl {
    return getSafe(() => this.fieldFormGroup.get(this.fieldName) as UntypedFormControl);
  }

  get hyperlink(): void {
    if (this.formControl && this.formControl.disabled) {
      return this.formControl.value;
    } else {
      return undefined;
    }
  }

}
