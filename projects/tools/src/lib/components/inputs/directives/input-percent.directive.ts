import { PercentPipe } from '@angular/common';
import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { percentToNumber, percentToString } from 'projects/model/src/public-api';

export const APP_PERCENT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => InputPercentDirective),
  multi: true,
};

@Directive({
    selector: '[appInputPercent]',
    providers: [APP_PERCENT_VALUE_ACCESSOR],
    standalone: true
})
export class InputPercentDirective implements ControlValueAccessor {

  isDisabled: boolean = false;
  percentPipe?: PercentPipe;
  onChange: any = () => { };
  onTouched: any = () => { };

  @HostListener('input', ['$event.target.value'])
  input(value: any): void {
    this.onChange(value);
  }

  @HostListener('blur', ['$event.target.value'])
  blur(value: any): void {
    if (value !== undefined && value !== null) {
      value = value.replace(',', '.');
    }
    this.renderer.setProperty(this.element.nativeElement, 'value', percentToString(value));
  }

  @HostListener('focus', ['$event.target.value'])
  focus(value: any): void {
    this.renderer.setProperty(this.element.nativeElement, 'value', percentToNumber(value));
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    if (['.', 'Backspace', 'Tab', 'Escape', 'Enter'].indexOf(event.key) !== -1 ||
      // Allow: Ctrl+A
      (event.key.toUpperCase() === 'A' && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+C
      (event.key.toUpperCase() === 'C' && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+V
      (event.key.toUpperCase() === 'V' && (event.ctrlKey || event.metaKey)) ||
      // Allow: Ctrl+X
      (event.key.toUpperCase() === 'X' && (event.ctrlKey || event.metaKey)) ||
      // Allow: home, end, left, right
      (['Home', 'End', 'ArrowLeft', 'ArrowRight'].indexOf(event.key)) !== -1 ||
      // any digit
      (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key)) !== -1) {
      // let it happen, don't do anything
      return;
    }
    event.preventDefault();
  }

  constructor(
    private renderer: Renderer2,
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
