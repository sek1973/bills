import { Component, Input, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
    selector: 'app-input-textarea',
    templateUrl: './input-textarea.component.html',
    styleUrls: ['./input-textarea.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, TextFieldModule, MatTooltipModule]
})
export class InputTextareaComponent extends InputBaseComponent implements OnInit {

  @Input() inputMinRows: number = 10;
  @Input() inputMaxRows: number = 10;

  constructor() { super(); }

  ngOnInit() {
  }

}
