import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getSafe } from 'projects/model/src/public-api';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-hyperlink',
  templateUrl: './input-hyperlink.component.html',
  styleUrls: ['./input-hyperlink.component.scss']
})
export class InputHyperlinkComponent extends InputBaseComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

  get formControl(): FormControl {
    return getSafe(() => this.fieldFormGroup.get(this.fieldName) as FormControl);
  }

  get hyperlink(): void {
    if (this.formControl && this.formControl.disabled) {
      return this.formControl.value;
    } else {
      return undefined;
    }
  }

}
