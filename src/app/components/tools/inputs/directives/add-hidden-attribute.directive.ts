import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appAddHiddenAttribute]'
})
export class AddHiddenAttributeDirective {

  private _hidden: boolean;
  @Input('appAddHiddenAttribute') set hidden(val: boolean) {
    this._hidden = val;
    if (this.hidden) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'hidden', '');
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'hidden');
    }
  }
  get hidden(): boolean {
    return this._hidden;
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

}
