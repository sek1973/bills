import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule]
})
export class InputTextComponent extends InputBaseComponent {
  type = input<
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
    | 'week'>('text');
  textFormatFn = input<((value: string) => string) | null>(null);

  protected onChange(): void {
    const fn = this.textFormatFn();
    if (!fn) return;
    const ctrl = this.formControl();
    if (!ctrl) return;
    const formatted = fn(ctrl.value ?? '');
    if (formatted !== ctrl.value) {
      ctrl.setValue(formatted, { emitEvent: true });
    }
  }
}
