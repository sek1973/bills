import { Component, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
    selector: 'app-input-toggle',
    templateUrl: './input-toggle.component.html',
    styleUrls: ['./input-toggle.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatSlideToggleModule, MatTooltipModule, MatFormFieldModule]
})
export class InputToggleComponent extends InputBaseComponent implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

}
