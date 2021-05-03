import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputHyperlinkComponent } from './input-hyperlink.component';

describe('InputHyperlinkComponent', () => {
  let component: InputHyperlinkComponent;
  let fixture: ComponentFixture<InputHyperlinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputHyperlinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputHyperlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
