import { computed, Directive, input } from '@angular/core';
import { addDays } from 'projects/model/src/public-api';

@Directive({
  selector: '[billDueColor]',
  host: { '[style.color]': 'color()' },
})
export class BillDueColorDirective {
  readonly billDueColor = input<Date | undefined>();

  protected readonly color = computed(() => {
    const dueDate = this.billDueColor();
    if (!dueDate) return '';
    if (dueDate < new Date()) return 'red';
    if (dueDate < addDays()) return 'darkgoldenrod';
    return '';
  });
}
