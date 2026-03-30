import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getSafe } from 'projects/model/src/public-api';
import { map, merge, of, startWith, switchMap } from 'rxjs';
import { AddHrefAttributeDirective } from '../directives/add-href-attribute.directive';
import { InputBaseComponent } from './../input-component-base';

@Component({
  selector: 'app-input-hyperlink',
  templateUrl: './input-hyperlink.component.html',
  styleUrls: ['./input-hyperlink.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, AddHrefAttributeDirective, MatInputModule, MatTooltipModule]
})
export class InputHyperlinkComponent extends InputBaseComponent {

  override formControl = computed(() => getSafe(() => this.fieldFormGroup()?.get(this.fieldName()) as UntypedFormControl));

  private fcState = toSignal(
    toObservable(this.formControl).pipe(
      switchMap(fc => {
        if (!fc) return of(null);
        return merge(fc.valueChanges, fc.statusChanges).pipe(
          startWith(null),
          map(() => ({ value: fc.value as string, disabled: fc.disabled }))
        );
      })
    )
  );

  controlValue = computed(() => {
    this.editMode();
    return this.fcState()?.value ?? this.formControl()?.value ?? '';
  });

  externalUrl = computed(() => {
    const url = this.controlValue();
    if (!url) return '';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  });

}
