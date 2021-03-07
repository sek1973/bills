import { Component, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-currency',
  templateUrl: './input-currency.component.html',
  styleUrls: ['./input-currency.component.scss']
})
export class InputCurrencyComponent extends InputBaseComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

}
