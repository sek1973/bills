import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[cellTemplateForColumn]',
  standalone: true
})
export class TableCellDirective {

  cellTemplateForColumn = input.required<string>();

  templateRef = inject<TemplateRef<any>>(TemplateRef);

}
