import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, ComponentRef, Directive, ElementRef, EnvironmentInjector, OnDestroy, OnInit, PLATFORM_ID, createComponent, inject, output } from '@angular/core';
import { AppSpinnerComponent } from '../components/app-spinner/app-spinner.component';

const THRESHOLD = 80;
const MAX_PULL = 120;

@Directive({
  selector: '[pullToRefresh]',
  standalone: true,
})
export class PullToRefreshDirective implements OnInit, OnDestroy {
  readonly pullToRefresh = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);

  private spinnerRef!: ComponentRef<AppSpinnerComponent>;
  private startY = 0;
  private pulling = false;
  private cleanup: Array<() => void> = [];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.createSpinner();
    this.attachListeners();
  }

  ngOnDestroy(): void {
    this.cleanup.forEach(fn => fn());
    if (this.spinnerRef) {
      (this.spinnerRef.location.nativeElement as HTMLElement).remove();
      this.spinnerRef.destroy();
    }
  }

  private createSpinner(): void {
    const hostEl = this.doc.createElement('div');
    this.doc.body.appendChild(hostEl);

    this.spinnerRef = createComponent(AppSpinnerComponent, {
      environmentInjector: this.envInjector,
      hostElement: hostEl,
    });
    this.spinnerRef.setInput('backdropEnabled', false);
    this.spinnerRef.setInput('positionGloballyCenter', true);
    this.spinnerRef.setInput('displayProgressSpinner', false);
    this.appRef.attachView(this.spinnerRef.hostView);
  }

  private attachListeners(): void {
    const host = this.el.nativeElement as HTMLElement;
    const onStart = (e: TouchEvent) => this.onStart(e);
    const onMove = (e: TouchEvent) => this.onMove(e);
    const onEnd = () => this.onEnd();

    host.addEventListener('touchstart', onStart, { passive: true });
    host.addEventListener('touchmove', onMove, { passive: false });
    host.addEventListener('touchend', onEnd, { passive: true });

    this.cleanup = [
      () => host.removeEventListener('touchstart', onStart),
      () => host.removeEventListener('touchmove', onMove),
      () => host.removeEventListener('touchend', onEnd),
    ];
  }

  private onStart(e: TouchEvent): void {
    // Do not trigger if any scrollable ancestor in the event path is scrolled down
    const isAnyAncestorScrolled = (e.composedPath() as Element[]).some(
      el =>
        el instanceof HTMLElement &&
        el !== this.doc.body &&
        el !== this.doc.documentElement &&
        el.scrollHeight > el.clientHeight &&
        el.scrollTop > 0,
    );
    if (!isAnyAncestorScrolled && (this.doc.defaultView?.scrollY ?? 0) <= 0) {
      this.startY = e.touches[0].clientY;
      this.pulling = true;
    }
  }

  private onMove(e: TouchEvent): void {
    if (!this.pulling) return;
    const dy = e.touches[0].clientY - this.startY;
    if (dy <= 0) {
      this.pulling = false;
      return;
    }

    e.preventDefault();
    const pull = Math.min(dy, MAX_PULL);
    this.spinnerRef.setInput('displayProgressSpinner', pull >= THRESHOLD);
  }

  private onEnd(): void {
    if (!this.pulling) return;
    this.pulling = false;

    const triggered = this.spinnerRef.instance.displayProgressSpinner();
    this.spinnerRef.setInput('displayProgressSpinner', false);

    if (triggered) this.pullToRefresh.emit();
  }
}
