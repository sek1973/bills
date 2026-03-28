import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[appAddHrefAttribute]',
  standalone: true
})
export class AddHrefAttributeDirective {

  add = input<boolean>(false, { alias: 'appAddHrefAttribute' });
  link = input<string>('', { alias: 'appAddHrefAttributeLink' });

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      if (this.link() && this.add()) {
        this.renderer.setAttribute(this.elementRef.nativeElement, 'href', this.link());
      } else {
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'href');
      }
    });
  }

}
