import { Component } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-password',
  templateUrl: './input-password.component.html',
  styleUrls: ['./input-password.component.scss']
})
export class InputPasswordComponent extends InputBaseComponent {
  hide: boolean = true;

  constructor() { super(); }

}
