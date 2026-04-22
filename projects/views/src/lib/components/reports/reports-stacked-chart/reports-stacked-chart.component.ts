import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, input, output, viewChild } from '@angular/core';
import { ScaleBand, ScaleLinear, Selection, axisBottom, axisLeft, max, scaleBand, scaleLinear, select, timeFormat } from 'd3';
import { Payment } from 'model';
import { ThemeService } from 'tools';

interface ChartColors {
  textColor: string;
  axisTickColor: string;
  separatorColor: string;
  tooltipBg: string;
  tooltipColor: string;
  tooltipBorder: string;
}

type ChartGroup = Selection<SVGGElement, unknown, null, undefined>;
type TooltipDiv = Selection<HTMLDivElement, unknown, null, undefined>;
export type ChartMode = 'real' | 'monthly' | 'yearly';

interface ChartDataPoint {
  deadline: Date;
  sum: number;
  label: string;
}

export interface BillSeries {
  billId: number;
  billName: string;
  color: string;
  payments: Payment[];
}

export interface StackedSegment {
  billId: number;
  billName: string;
  color: string;
  value: number;
  y0: number;
  y1: number;
}

export interface StackedBarPoint {
  key: string;
  deadline: Date;
  label: string;
  segments: StackedSegment[];
  total: number;
}

@Component({
  selector: 'app-reports-stacked-chart',
  standalone: true,
  templateUrl: './reports-stacked-chart.component.html',
  styleUrls: ['./reports-stacked-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsStackedChartComponent implements AfterViewInit, OnDestroy {

  series = input<BillSeries[]>([]);
  chartMode = input<ChartMode>('monthly');
  selectedBarIndex = input<number | null>(null);
  barSelected = output<{ index: number; point: StackedBarPoint }>();

  chartContainer = viewChild<ElementRef<HTMLDivElement>>('chart');

  private themeService = inject(ThemeService);

  readonly stackedData = computed((): StackedBarPoint[] => {
    const seriesList = this.series();
    const mode = this.chartMode();

    if (!seriesList.length) return [];

    const billPoints = seriesList.map(s => ({
      billId: s.billId,
      billName: s.billName,
      color: s.color,
      points: this.computeDataPoints(s.payments, mode)
    }));

    const allKeys = new Map<string, { deadline: Date; label: string }>();
    for (const b of billPoints) {
      for (const p of b.points) {
        if (!allKeys.has(p.label)) {
          allKeys.set(p.label, { deadline: p.deadline, label: p.label });
        }
      }
    }

    if (!allKeys.size) return [];

    const sortedKeys = Array.from(allKeys.entries())
      .sort((a, b) => a[1].deadline.getTime() - b[1].deadline.getTime());

    return sortedKeys.map(([, { deadline, label }]) => {
      let y0 = 0;
      const segments: StackedSegment[] = [];
      for (const b of billPoints) {
        const point = b.points.find(p => p.label === label);
        const value = point?.sum ?? 0;
        if (value > 0) {
          const y1 = y0 + value;
          segments.push({ billId: b.billId, billName: b.billName, color: b.color, value, y0, y1 });
          y0 = y1;
        }
      }
      return { key: label, deadline, label, segments, total: Math.round(y0 * 100) / 100 };
    });
  });

  readonly legend = computed(() =>
    this.series().map((s, i) => ({ name: s.billName, color: s.color }))
  );

  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.chartContainer();
      this.stackedData();
      this.selectedBarIndex();
      this.themeService.darkMode();
      this.drawChart();
    });
  }

  ngAfterViewInit(): void {
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private computeDataPoints(payments: Payment[], mode: ChartMode): ChartDataPoint[] {
    const paidPayments = payments
      .filter(p => p.paiddate && p.deadline)
      .slice()
      .sort((a, b) => new Date(a.deadline as any).getTime() - new Date(b.deadline as any).getTime());

    if (!paidPayments.length) return [];

    if (mode === 'real') {
      const byDate = new Map<string, { deadline: Date; sum: number }>();
      for (const p of paidPayments) {
        const d = p.deadline instanceof Date ? p.deadline : new Date(p.deadline as any);
        const key = timeFormat('%d %b %Y')(d);
        const existing = byDate.get(key);
        if (existing) {
          existing.sum += p.sum;
        } else {
          byDate.set(key, { deadline: d, sum: p.sum });
        }
      }
      return Array.from(byDate.entries()).map(([label, { deadline, sum }]) => ({
        deadline,
        sum: Math.round(sum * 100) / 100,
        label
      }));
    }

    const allDates = paidPayments.map(p =>
      p.deadline instanceof Date ? p.deadline : new Date(p.deadline as any)
    );
    const first = allDates[0];
    const last = allDates[allDates.length - 1];

    const windows = allDates.map((d, i) => {
      const t = d.getTime();
      const winStart = i === 0
        ? t - (allDates.length > 1 ? (allDates[1].getTime() - t) / 2 : 43200000)
        : (t + allDates[i - 1].getTime()) / 2;
      const winEnd = i === allDates.length - 1
        ? t + (allDates.length > 1 ? (t - allDates[i - 1].getTime()) / 2 : 43200000)
        : (t + allDates[i + 1].getTime()) / 2;
      const days = Math.max(1, (winEnd - winStart) / 86400000);
      return { dailyRate: paidPayments[i].sum / days, start: winStart, end: winEnd };
    });

    const intervals: { label: string; deadline: Date; start: number; end: number }[] = [];
    if (mode === 'monthly') {
      const cur = new Date(first.getFullYear(), first.getMonth(), 1);
      const rangeEnd = new Date(last.getFullYear(), last.getMonth() + 1, 1);
      while (cur < rangeEnd) {
        const label = timeFormat('%b %Y')(new Date(cur));
        const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        intervals.push({ label, deadline: new Date(cur), start: cur.getTime(), end: nextMonth.getTime() });
        cur.setMonth(cur.getMonth() + 1);
      }
    } else {
      for (let y = first.getFullYear(); y <= last.getFullYear(); y++) {
        intervals.push({
          label: String(y),
          deadline: new Date(y, 0, 1),
          start: new Date(y, 0, 1).getTime(),
          end: new Date(y + 1, 0, 1).getTime(),
        });
      }
    }

    return intervals.map(({ label, deadline, start, end }) => {
      const sum = windows.reduce((acc, w) => {
        const overlapDays = Math.max(0, (Math.min(w.end, end) - Math.max(w.start, start)) / 86400000);
        return acc + w.dailyRate * overlapDays;
      }, 0);
      return { deadline, sum: Math.round(sum * 100) / 100, label };
    }).filter(p => p.sum > 0);
  }

  private drawChart(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    const data = this.stackedData();
    container.innerHTML = '';
    if (!data.length) return;

    const selectedIdx = this.selectedBarIndex();
    const colors = this.buildThemeColors(this.themeService.darkMode());
    const margin = { top: 20, right: 12, bottom: 36, left: 55 };
    const width = Math.max(container.clientWidth - margin.left - margin.right, 0);
    const rawHeight = container.clientHeight > 80 ? container.clientHeight : 280;
    const height = Math.max(rawHeight - margin.top - margin.bottom, 120);

    const svg = select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip: TooltipDiv = select(container)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', '0')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('padding', '8px 12px')
      .style('background', colors.tooltipBg)
      .style('color', colors.tooltipColor)
      .style('border', colors.tooltipBorder)
      .style('border-radius', '8px')
      .style('font-size', '0.85rem')
      .style('font-weight', '600')
      .style('box-shadow', '0 4px 16px rgba(0, 0, 0, 0.18)')
      .style('white-space', 'nowrap')
      .style('z-index', '1000')
      .style('transition', 'opacity 150ms ease');

    const xScale: ScaleBand<string> = scaleBand<string>()
      .domain(data.map((_, i) => String(i)))
      .range([0, width])
      .padding(0.2);

    const yMax = max(data, d => d.total) ?? 0;
    const yScale: ScaleLinear<number, number> = scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height, 0]);

    const yAxisGroup = chart.append('g');
    axisLeft(yScale).ticks(5).tickFormat((v: any) => `${v}`)(yAxisGroup as any);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick text').style('fill', colors.axisTickColor);
    yAxisGroup.selectAll('.tick line').style('stroke', colors.separatorColor);

    const xAxisGroup = chart.append('g').attr('transform', `translate(0,${height})`);
    axisBottom(xScale).tickSize(0).tickFormat(() => '')(xAxisGroup as any);
    xAxisGroup.select('.domain').style('stroke', colors.separatorColor);

    const labelY = height + 18;
    const labelNodes: SVGTextElement[] = [];
    const labelCenters: number[] = [];
    data.forEach((d, i) => {
      const cx = (xScale(String(i)) ?? 0) + xScale.bandwidth() / 2;
      const node = chart.append('text')
        .attr('x', cx).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.75rem')
        .style('fill', colors.textColor)
        .text(d.label)
        .node() as SVGTextElement;
      labelNodes.push(node);
      labelCenters.push(cx);
    });

    let lastVisibleRight = -Infinity;
    labelNodes.forEach((node, i) => {
      const halfW = (node.getComputedTextLength() / 2) + 4;
      const left = labelCenters[i] - halfW;
      if (left < lastVisibleRight) {
        select(node).style('visibility', 'hidden');
      } else {
        lastVisibleRight = labelCenters[i] + halfW;
      }
    });

    const barGroups = chart.selectAll<SVGGElement, StackedBarPoint>('.bar-group')
      .data(data)
      .join('g')
      .attr('class', 'bar-group')
      .attr('transform', (_, i) => `translate(${xScale(String(i)) ?? 0}, 0)`)
      .style('cursor', 'pointer');

    barGroups.each(function (d, i) {
      if (i === selectedIdx) {
        select(this)
          .append('rect')
          .attr('class', 'bar-highlight')
          .attr('x', -2)
          .attr('y', 0)
          .attr('width', xScale.bandwidth() + 4)
          .attr('height', height)
          .attr('fill', 'none')
          .attr('stroke', colors.axisTickColor)
          .attr('stroke-width', '1.5')
          .attr('stroke-dasharray', '3,3')
          .attr('rx', 2);
      }
    });

    barGroups.selectAll<SVGRectElement, StackedSegment>('.segment')
      .data((d: StackedBarPoint) => d.segments)
      .join('rect')
      .attr('class', 'segment')
      .attr('x', 0)
      .attr('width', xScale.bandwidth())
      .attr('y', (seg: StackedSegment) => yScale(seg.y1))
      .attr('height', (seg: StackedSegment) => Math.max(yScale(seg.y0) - yScale(seg.y1), 0))
      .attr('fill', (seg: StackedSegment) => seg.color);

    const self = this;
    barGroups
      .on('mouseenter', function (event: MouseEvent, d: StackedBarPoint) {
        select(this).selectAll<SVGRectElement, StackedSegment>('.segment')
          .attr('filter', 'brightness(1.18)');
        const rect = container.getBoundingClientRect();
        const totalText = d.total.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const lines = d.segments.map(s =>
          `<div style="font-size:0.78rem;font-weight:400;margin-top:3px;display:flex;align-items:center;gap:5px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0"></span>
            ${s.billName}: ${s.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł
          </div>`
        ).join('');
        tooltip
          .html(`<div>${d.label} — <strong>${totalText} zł</strong></div>${lines}`)
          .style('left', `${self.tooltipLeft(event, container, tooltip)}px`)
          .style('top', `${event.clientY - rect.top - 28}px`)
          .style('opacity', '1');
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style('left', `${self.tooltipLeft(event, container, tooltip)}px`)
          .style('top', `${event.clientY - rect.top - 28}px`);
      })
      .on('mouseleave', function () {
        select(this).selectAll<SVGRectElement, StackedSegment>('.segment')
          .attr('filter', null);
        tooltip.style('opacity', '0');
      })
      .on('click', (_event: MouseEvent, d: StackedBarPoint) => {
        const i = this.stackedData().indexOf(d);
        this.barSelected.emit({ index: i, point: d });
      });
  }

  private buildThemeColors(isDark: boolean): ChartColors {
    return {
      textColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      axisTickColor: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
      separatorColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
      tooltipBg: isDark ? 'rgba(40,35,60,0.97)' : 'rgba(255,252,220,0.95)',
      tooltipColor: isDark ? 'rgba(255,255,255,0.87)' : '#1a1a1a',
      tooltipBorder: isDark ? '1px solid rgba(180,130,255,0.3)' : '1px solid rgba(103,58,183,0.25)',
    };
  }

  private tooltipLeft(event: MouseEvent, container: HTMLDivElement, tooltip: TooltipDiv): number {
    const rect = container.getBoundingClientRect();
    const tipWidth = (tooltip.node() as HTMLElement)?.offsetWidth ?? 150;
    const x = event.clientX - rect.left + 12;
    return x + tipWidth > rect.width ? x - tipWidth - 24 : x;
  }

  private setupResizeObserver(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => this.drawChart());
    this.resizeObserver.observe(container);
  }
}
