import { Component, Input, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-text',
    templateUrl: './input-text.component.html',
    styleUrls: ['./input-text.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule]
})
export class InputTextComponent extends InputBaseComponent implements OnInit {
  @Input()
  type:
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'month'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week' = 'text';

  constructor() { super(); }

  ngOnInit(): void {
  }

}
