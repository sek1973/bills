import { Component, OnInit } from '@angular/core';

import { InputComponentBase } from './../input-component-base';

@Component({
  selector: 'app-input-toggle',
  templateUrl: './input-toggle.component.html',
  styleUrls: ['./input-toggle.component.scss']
})
export class InputToggleComponent extends InputComponentBase implements OnInit {

  constructor() { super(); }

  ngOnInit() {
  }

}
