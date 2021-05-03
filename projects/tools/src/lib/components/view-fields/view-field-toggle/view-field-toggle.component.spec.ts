import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFieldToggleComponent } from './view-field-toggle.component';

describe('ViewFieldToggleComponent', () => {
  let component: ViewFieldToggleComponent;
  let fixture: ComponentFixture<ViewFieldToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFieldToggleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFieldToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
