import { NgModule } from '@angular/core';
import { ModelComponent } from './model.component';

@NgModule({
  declarations: [
    ModelComponent
  ],
  imports: [
  ],
  exports: [
    ModelComponent
  ]
})
export class ModelModule { }

export * from './helpers';
export * from './model';
export * from './services';
