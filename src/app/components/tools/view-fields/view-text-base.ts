import { Input, OnInit, PipeTransform, Directive } from '@angular/core';
import { getSafe } from 'src/app/helpers';

import { DescriptionProvider } from '../inputs/input-component-base';

export interface ValueProvider {
  getValue(...path: string[]): any;
}

export interface LabelProvider {
  getLabelText(...path: string[]): string;
}

@Directive()
export class ViewFieldComponentBase implements OnInit {
  @Input() valueProvider: ValueProvider;
  @Input() descriptionProvider: DescriptionProvider;
  @Input() autoHide = true;

  private _path: string[];
  @Input()
  set path(path: string[]) {
    this._path = path;
    if (path && path.length) {
      this._childPath = path[path.length - 1];
      this.id = path.join(':');
    } else {
      this._childPath = undefined;
    }
  }
  get path(): string[] {
    return this._path;
  }
  private _childPath: string;
  get childAttr() {
    return this._childPath;
  }
  get value(): any {
    return this.valueProvider.getValue(...this.path);
  }
  get labelText(): any {
    return getSafe(() => this.descriptionProvider.getDescriptionObj(...this.path).labelText) || '';
  }
  get hasValue() {
    return (this.value === null || this.value === undefined || this.value === '') ? false : true;
  }
  id: string;

  constructor() { }

  ngOnInit() { }
}
