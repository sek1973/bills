import { Component, OnInit } from '@angular/core';
import { InputBaseComponent } from './../input-component-base';


@Component({
  selector: 'app-input-percent',
  templateUrl: './input-percent.component.html',
  styleUrls: ['./input-percent.component.scss']
})
export class InputPercentComponent extends InputBaseComponent implements OnInit {

  constructor() { super(); }

  ngOnInit(): void {
  }

}
