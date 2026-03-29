import { inject, Injector, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicPipe',
})
export class DynamicPipe implements PipeTransform {

  private injector = inject(Injector);

  transform(value: any, pipeToken: any, pipeArgs: any[]): any {
    if (!pipeToken) {
      return value;
    }
    else {
      const pipe = this.injector.get<any>(pipeToken);
      return pipe.transform(value, ...pipeArgs);
    }
  }

}
