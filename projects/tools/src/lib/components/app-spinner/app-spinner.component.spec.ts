import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppSpinnerComponent } from './app-spinner.component';
import { OverlayService } from './overlay-service';

describe('AppSpinnerComponent', () => {
  interface MockOverlayRef {
    hasAttached(): boolean;
    attach(): void;
    detach(): void;
  }

  interface MockOverlayService {
    createOverlay: ReturnType<typeof vi.fn>;
    attachTemplatePortal: ReturnType<typeof vi.fn>;
    positionGloballyCenter: ReturnType<typeof vi.fn>;
  }

  let mockOverlayRef: MockOverlayRef;
  let mockOverlayService: MockOverlayService;

  beforeEach(async () => {
    let attached = false;
    mockOverlayRef = {
      hasAttached: () => attached,
      attach: () => { attached = true; },
      detach: () => { attached = false; },
    };

    mockOverlayService = {
      createOverlay: vi.fn(() => mockOverlayRef),
      attachTemplatePortal: vi.fn((ref: MockOverlayRef) => ref.attach()),
      positionGloballyCenter: vi.fn(() => ({})),
    };

    await TestBed.configureTestingModule({
      imports: [AppSpinnerComponent],
    })
      .overrideProvider(OverlayService, { useValue: mockOverlayService })
      .compileComponents();
  });

  it('has correct default input values', () => {
    const fixture = TestBed.createComponent(AppSpinnerComponent);
    const comp = fixture.componentInstance;
    // initialize component
    fixture.detectChanges();

    expect(comp.diameter()).toBe(100);
    expect(comp.mode()).toBe('indeterminate');
    expect(comp.strokeWidth()).toBe(10);
    expect(comp.backdropEnabled()).toBe(true);
    expect(comp.positionGloballyCenter()).toBe(true);
  });

  it('creates overlay with correct config in ngOnInit', () => {
    const fixture = TestBed.createComponent(AppSpinnerComponent);
    fixture.detectChanges(); // runs ngOnInit

    expect(mockOverlayService.createOverlay).toHaveBeenCalled();
    const cfg = (mockOverlayService.createOverlay).mock.calls[0][0];
    expect(cfg.hasBackdrop).toBe(true);
    expect(mockOverlayService.positionGloballyCenter).toHaveBeenCalled();
  });

});
