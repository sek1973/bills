import { OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { Component, DoCheck, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { LegacyProgressSpinnerMode as ProgressSpinnerMode } from '@angular/material/legacy-progress-spinner';
import { OverlayService } from './overlay-service';


@Component({
  selector: 'app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss'],
  providers: [OverlayService]
})
export class AppSpinnerComponent implements OnInit, DoCheck {

  @Input() color?: ThemePalette;
  @Input() diameter?: number = 100;
  @Input() mode: ProgressSpinnerMode = 'indeterminate';
  @Input() strokeWidth?: number;
  @Input() value?: number;
  @Input() backdropEnabled = true;
  @Input() positionGloballyCenter = true;
  @Input() displayProgressSpinner: boolean | null = null;

  @ViewChild('progressSpinnerRef', { static: true })
  private progressSpinnerRef!: TemplateRef<any>;
  private overlayConfig!: OverlayConfig;
  private overlayRef!: OverlayRef;
  constructor(private vcRef: ViewContainerRef, private overlayService: OverlayService) { }

  ngOnInit(): void {
    this.overlayConfig = {
      hasBackdrop: this.backdropEnabled
    };
    if (this.positionGloballyCenter) {
      this.overlayConfig.positionStrategy = this.overlayService.positionGloballyCenter();
    }
    this.overlayRef = this.overlayService.createOverlay(this.overlayConfig);
  }

  ngDoCheck(): void {
    if (this.displayProgressSpinner && !this.overlayRef.hasAttached()) {
      this.overlayService.attachTemplatePortal(this.overlayRef, this.progressSpinnerRef, this.vcRef);
    } else if (!this.displayProgressSpinner && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

}
