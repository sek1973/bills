import { OverlayService } from './overlay-service';
import { OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Component, Input, OnInit, ViewChild, TemplateRef, DoCheck, ViewContainerRef } from '@angular/core';
import { ProgressSpinnerMode, ThemePalette } from '@angular/material';

@Component({
  selector: 'app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss'],
  providers: [OverlayService]
})
export class AppSpinnerComponent implements OnInit, DoCheck {

  @Input() color?: ThemePalette;
  @Input() diameter?: number = 100;
  @Input() mode?: ProgressSpinnerMode;
  @Input() strokeWidth?: number;
  @Input() value?: number;
  @Input() backdropEnabled = true;
  @Input() positionGloballyCenter = true;
  @Input() displayProgressSpinner: boolean;

  @ViewChild('progressSpinnerRef', { static: true }) private progressSpinnerRef: TemplateRef<any>;
  private overlayConfig: OverlayConfig;
  private overlayRef: OverlayRef;
  constructor(private vcRef: ViewContainerRef, private overlayService: OverlayService) { }
  ngOnInit() {
    this.overlayConfig = {
      hasBackdrop: this.backdropEnabled
    };
    if (this.positionGloballyCenter) {
      this.overlayConfig['positionStrategy'] = this.overlayService.positionGloballyCenter();
    }
    this.overlayRef = this.overlayService.createOverlay(this.overlayConfig);
  }
  ngDoCheck() {
    if (this.displayProgressSpinner && !this.overlayRef.hasAttached()) {
      this.overlayService.attachTemplatePortal(this.overlayRef, this.progressSpinnerRef, this.vcRef);
    } else if (!this.displayProgressSpinner && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

}
