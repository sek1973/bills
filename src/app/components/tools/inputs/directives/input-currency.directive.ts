import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { currencyToNumber, currencyToString } from 'src/app/helpers';

export const APP_CURRENCY_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line: no-use-before-declare
  useExisting: forwardRef(() => InputCurrencyDirective),
  multi: true,
};

@Directive({
  selector: '[appInputCurrency]',
  providers: [APP_CURRENCY_VALUE_ACCESSOR]
})
export class InputCurrencyDirective implements ControlValueAccessor {

  inputElement: HTMLInputElement;
  isDisabled: boolean = false;
  onChange: any = () => { };
  onTouched: any = () => { };

  @HostListener('input', ['$event.target.value'])
  input(value: any): void {
    if (value !== undefined && value !== null) {
      value = value.replace(/[^0-9,.]/g, '')
        .replace(',', '.');
    }
    this.onChange(value);
  }

  @HostListener('blur', ['$event.target.value'])
  blur(value: any): void {
    if (value !== undefined && value !== null) {
      value = value.replace(/[^0-9,.]/g, '')
        .replace(',', '.');
    }
    this.renderer.setProperty(this.element.nativeElement, 'value', currencyToString(value));
  }

  @HostListener('focus', ['$event.target.value'])
  focus(value: any): void {
    this.renderer.setProperty(this.element.nativeElement, 'value', currencyToNumber(value));
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
      (['Home', 'End', 'ArrowLeft', 'ArrowRight'].indexOf(event.key)) !== -1) {
      // let it happen, don't do anything
      return;
    }
    // number
    if (event.shiftKey || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(event.key) !== -1) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedInput: string = event?.clipboardData
      .getData('text/plain')
      .replace(/[^0-9,.]/g, '')
      .replace(',', '.');
    document.execCommand('insertText', false, pastedInput);
  }

  @HostListener('drop', ['$event']) onDrop(event: DragEvent) {
    event.preventDefault();
    const textData = event.dataTransfer
      .getData('text')
      .replace(/[^0-9,.]/g, '')
      .replace(',', '.');
    this.inputElement.focus();
    document.execCommand('insertText', false, textData);
  }

  constructor(private renderer: Renderer2,
    private element: ElementRef) {
    this.inputElement = element.nativeElement;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: any): void {
    const element = this.element.nativeElement;
    this.renderer.setProperty(element, 'value', currencyToString(value));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

}
