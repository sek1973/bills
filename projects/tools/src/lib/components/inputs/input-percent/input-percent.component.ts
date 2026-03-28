import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputPercentDirective } from '../directives/input-percent.directive';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-percent',
  templateUrl: './input-percent.component.html',
  styleUrls: ['./input-percent.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputPercentDirective, MatTooltipModule]
})
export class InputPercentComponent extends InputBaseComponent {
}
