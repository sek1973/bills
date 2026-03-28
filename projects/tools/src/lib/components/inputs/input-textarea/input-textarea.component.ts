import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputBaseComponent } from './../input-component-base';


@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, MatTooltipModule]
})
export class InputTextareaComponent extends InputBaseComponent {

  inputMinRows = input<number>(10);
  inputMaxRows = input<number>(10);

}
