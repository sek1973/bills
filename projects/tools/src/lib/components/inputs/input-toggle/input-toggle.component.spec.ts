import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputToggleComponent } from './input-toggle.component';

describe('InputToggleComponent', () => {
  let component: InputToggleComponent;
  let fixture: ComponentFixture<InputToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [InputToggleComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
