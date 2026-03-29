import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[appAddHiddenAttribute]',
})
export class AddHiddenAttributeDirective {

  hidden = input<boolean>(false, { alias: 'appAddHiddenAttribute' });

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      if (this.hidden()) {
        this.renderer.setAttribute(this.elementRef.nativeElement, 'hidden', '');
      } else {
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'hidden');
      }
    });
  }

}
