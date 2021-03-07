import { PercentPipe } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { percentToNumber, percentToString } from 'src/app/helpers';

export const APP_PERCENT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => InputPercentDirective),
  multi: true,
};

@Directive({
  selector: '[appInputPercent]',
  providers: [APP_PERCENT_VALUE_ACCESSOR]
})
export class InputPercentDirective implements ControlValueAccessor {

  isDisabled: boolean;
  percentPipe: PercentPipe;
  onChange: any = () => { };
  onTouched: any = () => { };

  @HostListener('input', ['$event.target.value'])
  input(value) {
    this.onChange(value);
  }

  @HostListener('blur', ['$event.target.value'])
  blur(value) {
    if (value !== undefined && value !== null) {
      value = value.replace(',', '.');
    }
    this.renderer.setProperty(this.element.nativeElement, 'value', percentToString(value));
  }

  @HostListener('focus', ['$event.target.value'])
  focus(value) {
    this.renderer.setProperty(this.element.nativeElement, 'value', percentToNumber(value));
  }

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    const e = <KeyboardEvent>event;
    if ([46, 8, 9, 27, 13, 110, 188, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      // let it happen, don't do anything
      return;
    }
    // number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  }

  constructor(private renderer: Renderer2,
    private element: ElementRef) {
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: any): void {
    const element = this.element.nativeElement;
    this.renderer.setProperty(element, 'value', percentToString(value));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }


}
