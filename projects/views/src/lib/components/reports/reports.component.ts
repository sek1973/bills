import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService, Bill, Payment, PaymentsService } from 'projects/model/src/public-api';
import { AppState, BillsActions, BillsSelectors } from 'projects/store/src/lib/state';
import { PullToRefreshDirective, ThemeService } from 'projects/tools/src/public-api';
import { PieSegment, ReportsPieChartComponent } from './reports-pie-chart/reports-pie-chart.component';
import { BillSeries, ChartMode, ReportsStackedChartComponent, StackedBarPoint } from './reports-stacked-chart/reports-stacked-chart.component';

const CHART_COLORS = [
  '#673ab7', '#2196f3', '#4caf50', '#ff9800', '#e91e63',
  '#00bcd4', '#ff5722', '#9c27b0', '#3f51b5', '#009688',
  '#f44336', '#8bc34a'
];

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, ReportsStackedChartComponent, ReportsPieChartComponent, PullToRefreshDirective]
})
export class ReportsComponent implements OnInit {

  private store = inject(Store<AppState>);
  private paymentsService = inject(PaymentsService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  themeService = inject(ThemeService);

  readonly bills = signal<Bill[]>([]);
  readonly selectedBillIds = signal<number[]>([]);
  readonly paymentsCache = signal<Map<number, Payment[]>>(new Map());
  readonly loadingIds = signal<Set<number>>(new Set());
  readonly chartMode = signal<ChartMode>('monthly');
  readonly selectedBarIndex = signal<number | null>(null);
  readonly selectedBarPoint = signal<StackedBarPoint | null>(null);

  readonly modeOptions: { value: ChartMode; label: string }[] = [
    { value: 'real', label: 'Rzeczywiste' },
    { value: 'monthly', label: 'Miesięcznie' },
    { value: 'yearly', label: 'Rocznie' },
  ];

  readonly series = computed((): BillSeries[] => {
    const ids = this.selectedBillIds();
    const cache = this.paymentsCache();
    const bills = this.bills();
    return ids
      .map((id, colorIdx) => {
        const bill = bills.find(b => b.id === id);
        if (!bill) return null;
        return {
          billId: id,
          billName: bill.name,
          color: CHART_COLORS[colorIdx % CHART_COLORS.length],
          payments: cache.get(id) ?? []
        };
      })
      .filter((s): s is BillSeries => s !== null);
  });

  readonly pieSegments = computed((): PieSegment[] => {
    const point = this.selectedBarPoint();
    if (!point) return [];
    return point.segments.map(s => ({
      name: s.billName,
      value: s.value,
      color: s.color,
    }));
  });

  readonly pieLabel = computed(() => this.selectedBarPoint()?.label ?? '');

  ngOnInit(): void {
    this.store.dispatch(BillsActions.loadOverviewBills());
    this.store.select(BillsSelectors.selectAll)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(bills => this.bills.set(bills));

    // Reload payment data when the token is silently refreshed after a network blip.
    this.authService.sessionRestored$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refresh());
  }

  toggleBill(bill: Bill): void {
    const ids = this.selectedBillIds();
    const idx = ids.indexOf(bill.id!);
    if (idx >= 0) {
      this.selectedBillIds.set(ids.filter(id => id !== bill.id));
      const cache = new Map(this.paymentsCache());
      cache.delete(bill.id!);
      this.paymentsCache.set(cache);
    } else {
      this.selectedBillIds.set([...ids, bill.id!]);
      if (!this.paymentsCache().has(bill.id!)) {
        this.loadPayments(bill.id!);
      }
    }
    this.selectedBarIndex.set(null);
    this.selectedBarPoint.set(null);
  }

  isSelected(bill: Bill): boolean {
    return this.selectedBillIds().includes(bill.id!);
  }

  getBillColor(bill: Bill): string {
    const idx = this.selectedBillIds().indexOf(bill.id!);
    return idx >= 0 ? CHART_COLORS[idx % CHART_COLORS.length] : 'transparent';
  }

  isLoading(bill: Bill): boolean {
    return this.loadingIds().has(bill.id!);
  }

  setChartMode(mode: ChartMode): void {
    this.chartMode.set(mode);
    this.selectedBarIndex.set(null);
    this.selectedBarPoint.set(null);
  }

  onBarSelected(event: { index: number; point: StackedBarPoint }): void {
    this.selectedBarIndex.set(event.index);
    this.selectedBarPoint.set(event.point);
  }

  refresh(): void {
    this.store.dispatch(BillsActions.loadOverviewBills());
    const ids = [...this.selectedBillIds()];
    this.paymentsCache.set(new Map());
    this.loadingIds.set(new Set());
    ids.forEach(id => this.loadPayments(id));
  }

  private loadPayments(billId: number): void {
    const loading = new Set(this.loadingIds());
    loading.add(billId);
    this.loadingIds.set(loading);

    this.paymentsService.load(billId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: payments => {
          const cache = new Map(this.paymentsCache());
          cache.set(billId, payments);
          this.paymentsCache.set(cache);
          const l = new Set(this.loadingIds());
          l.delete(billId);
          this.loadingIds.set(l);
        },
        error: () => {
          const l = new Set(this.loadingIds());
          l.delete(billId);
          this.loadingIds.set(l);
        }
      });
  }
}
