import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFieldTextComponent } from './view-field-text.component';

describe('ViewFieldTextComponent', () => {
  let component: ViewFieldTextComponent;
  let fixture: ComponentFixture<ViewFieldTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFieldTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFieldTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
