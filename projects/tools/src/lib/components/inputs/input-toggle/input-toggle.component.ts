import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputBaseComponent } from './../input-component-base';


@Component({
  selector: 'app-input-toggle',
  templateUrl: './input-toggle.component.html',
  styleUrls: ['./input-toggle.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatSlideToggleModule, MatTooltipModule, MatFormFieldModule]
})
export class InputToggleComponent extends InputBaseComponent {
}
