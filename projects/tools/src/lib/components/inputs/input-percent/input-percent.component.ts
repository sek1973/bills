import { Component } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputPercentDirective } from '../directives/input-percent.directive';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-percent',
    templateUrl: './input-percent.component.html',
    styleUrls: ['./input-percent.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputPercentDirective, MatTooltipModule]
})
export class InputPercentComponent extends InputBaseComponent {

  constructor() { super(); }

}
