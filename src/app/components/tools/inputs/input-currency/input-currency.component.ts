import { InputComponentBase } from './../input-component-base';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-input-currency',
  templateUrl: './input-currency.component.html',
  styleUrls: ['./input-currency.component.scss']
})
export class InputCurrencyComponent extends InputComponentBase implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

}
