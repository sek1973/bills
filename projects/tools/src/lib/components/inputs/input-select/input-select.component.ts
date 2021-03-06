import { Component, Input, OnInit } from '@angular/core';
import { Unit, UnitDescription } from 'projects/model/src/lib/model';
import { InputBaseComponent } from './../input-component-base';

export interface SelectItem<T> {
  value: T;
  text: string;
}

export function unitsToSelectItems(): SelectItem<Unit>[] {
  const result: SelectItem<Unit>[] =
    Array.from(UnitDescription.keys())
      .map(key => ({ value: key, text: UnitDescription.get(key) || '' }));
  return result;
}

@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss']
})
export class InputSelectComponent extends InputBaseComponent implements OnInit {

  @Input() selectItems: SelectItem<Unit>[] = [];

  constructor() { super(); }

  ngOnInit(): void {
  }

}
