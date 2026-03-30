import { computed, Directive, input } from '@angular/core';
import { getSafe } from 'projects/model/src/public-api';
import { DescriptionProvider } from '../inputs/input-component-base';

export interface ValueProvider {
  getValue(...path: string[]): any;
}

export interface LabelProvider {
  getLabelText(...path: string[]): string;
}

@Directive()
export class ViewFieldComponentBase {
  valueProvider = input.required<ValueProvider>();
  descriptionProvider = input.required<DescriptionProvider>();
  autoHide = input(false);
  path = input.required<string[]>();

  childAttr = computed(() => {
    const p = this.path();
    return p?.length ? p[p.length - 1] : undefined;
  });
  id = computed(() => this.path()?.join(':') ?? '');
  value = computed(() => this.valueProvider().getValue(...this.path()));
  labelText = computed(() =>
    getSafe(() => this.descriptionProvider().getDescriptionObj(...this.path()).labelText) || ''
  );
  hasValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined && v !== '';
  });
}
