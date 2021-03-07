import { Directive, Input, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appAddHrefAttribute]'
})
export class AddHrefAttributeDirective {

  private _add: boolean;
  @Input('appAddHrefAttribute') set add(val: boolean) {
    this._add = val;
    this.alterAttribute();
  }
  get add(): boolean {
    return this._add;
  }

  private _link: string;
  @Input('appAddHrefAttributeLink') set link(val: string) {
    this._link = val;
    this.alterAttribute();
  }
  get link(): string {
    return this._link;
  }

  private alterAttribute() {
    if (this.link && this.add) {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'href', this.link);
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, 'href');
    }
  }

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

}