import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    // tslint:disable-next-line: directive-selector
    selector: 'ng-template[cellTemplateForColumn]',
    standalone: true
})
export class TableCellDirective {

  @Input() cellTemplateForColumn!: string;

  constructor(public templateRef: TemplateRef<any>) { }

}
