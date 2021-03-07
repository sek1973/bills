import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[cellTemplateForColumn]'
})
export class TableCellDirective {

  @Input() cellTemplateForColumn: string;

  constructor(public templateRef: TemplateRef<any>) { }

}
