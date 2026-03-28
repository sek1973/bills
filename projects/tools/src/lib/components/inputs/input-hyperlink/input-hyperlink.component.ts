import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getSafe } from 'projects/model/src/public-api';
import { AddHiddenAttributeDirective } from '../directives/add-hidden-attribute.directive';
import { AddHrefAttributeDirective } from '../directives/add-href-attribute.directive';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-hyperlink',
  templateUrl: './input-hyperlink.component.html',
  styleUrls: ['./input-hyperlink.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, AddHrefAttributeDirective, MatInputModule, AddHiddenAttributeDirective, MatTooltipModule]
})
export class InputHyperlinkComponent extends InputBaseComponent {

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
