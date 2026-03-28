import { OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, TemplateRef, ViewContainerRef, effect, inject, input, viewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatProgressSpinnerModule, ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { OverlayService } from './overlay-service';


@Component({
  selector: 'app-spinner',
  templateUrl: './app-spinner.component.html',
  providers: [OverlayService],
  imports: [MatProgressSpinnerModule]
})
export class AppSpinnerComponent implements OnInit {

  color = input<ThemePalette>();
  diameter = input<number>(100);
  mode = input<ProgressSpinnerMode>('indeterminate');
  strokeWidth = input<number>(10);
  value = input<number>();
  backdropEnabled = input(true);
  positionGloballyCenter = input(true);
  displayProgressSpinner = input<boolean | null>(null);

  private progressSpinnerRef = viewChild.required<TemplateRef<any>>('progressSpinnerRef');
  private overlayConfig!: OverlayConfig;
  private overlayRef!: OverlayRef;

  private vcRef = inject(ViewContainerRef);
  private overlayService = inject(OverlayService);

  constructor() {
    effect(() => {
      const show = this.displayProgressSpinner();
      if (!this.overlayRef) return;
      if (show && !this.overlayRef.hasAttached()) {
        this.overlayService.attachTemplatePortal(this.overlayRef, this.progressSpinnerRef(), this.vcRef);
      } else if (!show && this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
      }
    });
  }

  ngOnInit(): void {
    this.overlayConfig = {
      hasBackdrop: this.backdropEnabled()
    };
    if (this.positionGloballyCenter()) {
      this.overlayConfig.positionStrategy = this.overlayService.positionGloballyCenter();
    }
    this.overlayRef = this.overlayService.createOverlay(this.overlayConfig);
  }

}
