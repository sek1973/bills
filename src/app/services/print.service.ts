import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor() {}

  /**
 * Allows to print passed element and all its content with styles.
 * @param element - HTML element to be printed
 */
  printPreviewElement(element: HTMLElement): void {
    const WindowPrt = window.open('', '', 'left=0,top=0,width=1500,height=900,toolbar=0,scrollbars=0,status=0');
    const styles = window.getComputedStyle(element);
    if (this.isBrowserIE()) {
      WindowPrt.document.write(element.outerHTML);
      const printContent = WindowPrt.document.body.firstChild as HTMLElement;
      printContent.style.cssText = styles.cssText;
      WindowPrt.document.head.innerHTML = document.head.innerHTML;
    } else {
      const printContent = element.cloneNode(true) as HTMLElement;
      printContent.style.cssText = styles.cssText;
      WindowPrt.document.head.innerHTML = document.head.innerHTML;
      WindowPrt.document.body.append(printContent);
    }
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  isBrowserIE() {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');
    if (msie > 0) return true;

    const trident = ua.indexOf('Trident/');
    if (trident > 0) return true;

    const edge = ua.indexOf('Edge/');
    if (edge > 0) return true;

    return false;
  }
}
