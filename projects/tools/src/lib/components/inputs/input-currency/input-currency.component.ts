import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputCurrencyDirective } from '../directives/input-currency.directive';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-currency',
  templateUrl: './input-currency.component.html',
  styleUrls: ['./input-currency.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputCurrencyDirective, MatTooltipModule]
})
export class InputCurrencyComponent extends InputBaseComponent {
}
