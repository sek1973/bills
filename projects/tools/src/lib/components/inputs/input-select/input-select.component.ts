import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  styleUrls: ['./input-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatTooltipModule, MatOptionModule]
})
export class InputSelectComponent extends InputBaseComponent {

  selectItems = input<SelectItem<Unit>[]>([]);

}
