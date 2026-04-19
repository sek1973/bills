import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, OnDestroy, OnInit, PLATFORM_ID, inject, output } from '@angular/core';

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

  private indicator!: HTMLElement;
  private startY = 0;
  private pulling = false;
  private cleanup: Array<() => void> = [];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.indicator = this.createIndicator();
    this.attachListeners();
  }

  ngOnDestroy(): void {
    this.cleanup.forEach(fn => fn());
    this.indicator?.remove();
  }

  private createIndicator(): HTMLElement {
    const div = this.doc.createElement('div');
    div.className = 'ptr-indicator';
    div.innerHTML = `<span class="material-icons ptr-icon">refresh</span>`;
    this.doc.body.appendChild(div);
    return div;
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
    const progress = Math.min(pull / THRESHOLD, 1);

    // translateY starts at -60px (hidden above), reaches +20px at threshold
    this.indicator.style.transform = `translateY(${pull - 60}px)`;
    this.indicator.style.opacity = String(progress);

    const icon = this.indicator.querySelector<HTMLElement>('.ptr-icon');
    if (icon) {
      icon.style.transform = `rotate(${progress * 360}deg)`;
      icon.style.color = pull >= THRESHOLD ? 'var(--mat-sys-primary, #6200ee)' : '';
    }
  }

  private onEnd(): void {
    if (!this.pulling) return;
    this.pulling = false;

    const match = this.indicator.style.transform.match(/translateY\((.+?)px\)/);
    const ty = parseFloat(match?.[1] ?? '-60');
    const pull = ty + 60; // reverse of `pull - 60`
    const triggered = pull >= THRESHOLD;

    this.indicator.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    this.indicator.style.transform = 'translateY(-60px)';
    this.indicator.style.opacity = '0';

    if (triggered) this.pullToRefresh.emit();

    setTimeout(() => {
      this.indicator.style.transition = '';
      const icon = this.indicator.querySelector<HTMLElement>('.ptr-icon');
      if (icon) {
        icon.style.transform = '';
        icon.style.color = '';
      }
    }, 300);
  }
}
