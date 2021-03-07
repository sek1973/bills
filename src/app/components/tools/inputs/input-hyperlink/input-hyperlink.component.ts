import { FormControl } from '@angular/forms';
import { getSafe } from 'src/app/helpers';
import { Component, OnInit } from '@angular/core';

import { InputComponentBase } from './../input-component-base';

@Component({
  selector: 'app-input-hyperlink',
  templateUrl: './input-hyperlink.component.html',
  styleUrls: ['./input-hyperlink.component.scss']
})
export class InputHyperlinkComponent extends InputComponentBase implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

  get formControl(): FormControl {
    return getSafe(() => this.fieldFormGroup.get(this.fieldName) as FormControl);
  }

  get hyperlink() {
    if (this.formControl && this.formControl.disabled) {
      return this.formControl.value;
    } else {
      return undefined;
    }
  }

}
