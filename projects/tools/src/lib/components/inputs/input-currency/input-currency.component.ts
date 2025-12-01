import { Component, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputCurrencyDirective } from '../directives/input-currency.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-currency',
    templateUrl: './input-currency.component.html',
    styleUrls: ['./input-currency.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputCurrencyDirective, MatTooltipModule]
})
export class InputCurrencyComponent extends InputBaseComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

}
