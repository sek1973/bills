import { Component, OnInit } from '@angular/core';

import { InputComponentBase } from './../input-component-base';

@Component({
  selector: 'app-input-date',
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss']
})
export class InputDateComponent extends InputComponentBase implements OnInit {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
