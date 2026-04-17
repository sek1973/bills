import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { ScaleBand, ScaleLinear, Selection, axisBottom, axisLeft, max, scaleBand, scaleLinear, select, timeFormat } from 'd3';
import { Payment } from 'projects/model/src/lib/model';
import { ThemeService } from 'projects/tools/src/public-api';

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
type ChartMode = 'real' | 'monthly' | 'yearly';

interface ChartDataPoint {
  deadline: Date;
  sum: number;
  label: string;
  paiddate?: Date;
}

@Component({
  selector: 'app-payments-chart',
  standalone: true,
  templateUrl: './payments-chart.component.html',
  styleUrls: ['./payments-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsChartComponent implements AfterViewInit, OnDestroy {

  payments = input<Payment[]>([]);
  billName = input('');
  chartContainer = viewChild<ElementRef<HTMLDivElement>>('chart');

  private themeService = inject(ThemeService);

  readonly paidPayments = computed(() =>
    this.payments()
      .filter(payment => payment.paiddate && payment.deadline)
      .slice()
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  );

  readonly chartMode = signal<ChartMode>('real');

  readonly metaLabel = computed(() => {
    const mode = this.chartMode();
    if (mode === 'monthly') return `${this.displayData().length} miesięcy`;
    if (mode === 'yearly') {
      const n = this.displayData().length;
      const suffix = n === 1 ? 'rok' : n < 5 ? 'lata' : 'lat';
      return `${n} ${suffix}`;
    }
    return `${this.paidPayments().length} płatności`;
  });

  readonly modeOptions: { value: ChartMode; label: string }[] = [
    { value: 'real', label: 'Rzeczywiste' },
    { value: 'monthly', label: 'Miesięcznie' },
    { value: 'yearly', label: 'Rocznie' },
  ];

  readonly displayData = computed((): ChartDataPoint[] => {
    const mode = this.chartMode();
    const payments = this.paidPayments();

    if (mode === 'real') {
      return payments.map(p => {
        const d = p.deadline instanceof Date ? p.deadline : new Date(p.deadline as any);
        return { deadline: d, sum: p.sum, label: timeFormat('%d %b')(d), paiddate: p.paiddate };
      });
    }

    const groups = new Map<string, { sum: number; deadline: Date }>();
    payments.forEach(p => {
      const d = p.deadline instanceof Date ? p.deadline : new Date(p.deadline as any);
      const key = mode === 'monthly'
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : String(d.getFullYear());
      if (!groups.has(key)) {
        groups.set(key, {
          sum: 0,
          deadline: mode === 'monthly' ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date(d.getFullYear(), 0, 1),
        });
      }
      groups.get(key)!.sum += p.sum;
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { sum, deadline }]) => ({
        deadline,
        sum,
        label: mode === 'monthly' ? timeFormat('%b %Y')(deadline) : key,
      }));
  });

  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.chartContainer(); // track so effect re-runs once the view is ready
      this.payments();
      this.chartMode(); // redraw on mode change
      this.themeService.darkMode(); // redraw on theme change
      this.drawChart();
    });
  }

  ngAfterViewInit(): void {
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  private drawChart(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    const data = this.displayData();
    container.innerHTML = '';
    if (!data.length) return;

    const mode = this.chartMode();
    const colors = this.buildThemeColors(this.themeService.darkMode());
    const margin = { top: 20, right: 12, bottom: 30, left: 48 };
    const width = Math.max(container.clientWidth - margin.left - margin.right, 0);
    const height = 260 - margin.top - margin.bottom;

    const { chart } = this.createSvgChart(container, width, height, margin);
    const tooltip = this.createTooltip(container, colors);
    const { xScale, yScale } = this.createScales(data, width, height);

    this.renderAxes(chart, xScale, yScale, height, colors);
    if (mode === 'real') {
      this.renderYearLabels(chart, data, xScale, height, colors);
    } else {
      this.renderBarLabels(chart, data, xScale, height, colors);
    }
    this.renderBars(chart, data, xScale, yScale, height, container, tooltip);
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

  private createSvgChart(
    container: HTMLDivElement,
    width: number,
    height: number,
    margin: { top: number; right: number; bottom: number; left: number }
  ): { chart: ChartGroup } {
    const svg = select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    return { chart };
  }

  private createTooltip(container: HTMLDivElement, colors: ChartColors): TooltipDiv {
    return select(container)
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
  }

  private createScales(
    data: ChartDataPoint[],
    width: number,
    height: number
  ): { xScale: ScaleBand<string>; yScale: ScaleLinear<number, number> } {
    const xScale = scaleBand<string>()
      .domain(data.map((_, i) => String(i)))
      .range([0, width])
      .padding(0.2);

    const yScale = scaleLinear()
      .domain([0, max(data, (p: ChartDataPoint) => p.sum) ?? 0])
      .nice()
      .range([height, 0]);

    return { xScale, yScale };
  }

  private renderAxes(
    chart: ChartGroup,
    xScale: ScaleBand<string>,
    yScale: ScaleLinear<number, number>,
    height: number,
    colors: ChartColors
  ): void {
    const yAxisGroup = chart.append('g');
    axisLeft(yScale).ticks(4).tickFormat((v: any) => `${v}`)(yAxisGroup as any);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick text').style('fill', colors.axisTickColor);
    yAxisGroup.selectAll('.tick line').style('stroke', colors.separatorColor);

    const xAxisGroup = chart.append('g').attr('transform', `translate(0,${height})`);
    axisBottom(xScale).tickSize(0).tickFormat(() => '')(xAxisGroup as any);
    xAxisGroup.select('.domain').style('stroke', colors.separatorColor);
  }

  private renderYearLabels(
    chart: ChartGroup,
    data: ChartDataPoint[],
    xScale: ScaleBand<string>,
    height: number,
    colors: ChartColors
  ): void {
    const yearFormat = timeFormat('%Y');
    const yearBounds = new Map<string, { first: number; last: number }>();
    data.forEach((p, i) => {
      const year = yearFormat(p.deadline);
      if (!yearBounds.has(year)) yearBounds.set(year, { first: i, last: i });
      else yearBounds.get(year)!.last = i;
    });

    const yearLabelY = height + 18;
    const yearKeys = Array.from(yearBounds.keys());

    // Append all year labels, then do a greedy overlap pass using getComputedTextLength()
    const yearLabelNodes: SVGTextElement[] = [];
    const yearLabelCenters: number[] = [];
    yearBounds.forEach((bounds, year) => {
      const xStart = xScale(String(bounds.first)) ?? 0;
      const xEnd = (xScale(String(bounds.last)) ?? 0) + xScale.bandwidth();
      const cx = (xStart + xEnd) / 2;
      const node = chart.append('text')
        .attr('x', cx).attr('y', yearLabelY)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.75rem')
        .style('fill', colors.textColor)
        .text(year)
        .node() as SVGTextElement;
      yearLabelNodes.push(node);
      yearLabelCenters.push(cx);
    });

    // Greedy left-to-right: hide label if it overlaps the previous visible one
    let lastVisibleRight = -Infinity;
    yearLabelNodes.forEach((node, i) => {
      const halfW = (node.getComputedTextLength() / 2) + 6;
      const left = yearLabelCenters[i] - halfW;
      if (left < lastVisibleRight) {
        select(node).style('visibility', 'hidden');
      } else {
        lastVisibleRight = yearLabelCenters[i] + halfW;
      }
    });

    for (let i = 1; i < yearKeys.length; i++) {
      const prevBounds = yearBounds.get(yearKeys[i - 1])!;
      const currBounds = yearBounds.get(yearKeys[i])!;
      const xSep = ((xScale(String(prevBounds.last)) ?? 0) + xScale.bandwidth() + (xScale(String(currBounds.first)) ?? 0)) / 2;
      chart.append('line')
        .attr('x1', xSep).attr('x2', xSep)
        .attr('y1', height + 2).attr('y2', yearLabelY + 8)
        .style('stroke', colors.separatorColor)
        .style('stroke-width', '1');
    }
  }

  private renderBarLabels(
    chart: ChartGroup,
    data: ChartDataPoint[],
    xScale: ScaleBand<string>,
    height: number,
    colors: ChartColors
  ): void {
    const labelY = height + 18;
    const nodes: SVGTextElement[] = [];
    const centers: number[] = [];

    data.forEach((d, i) => {
      const cx = (xScale(String(i)) ?? 0) + xScale.bandwidth() / 2;
      const node = chart.append('text')
        .attr('x', cx).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.75rem')
        .style('fill', colors.textColor)
        .text(d.label)
        .node() as SVGTextElement;
      nodes.push(node);
      centers.push(cx);
    });

    let lastVisibleRight = -Infinity;
    nodes.forEach((node, i) => {
      const halfW = (node.getComputedTextLength() / 2) + 4;
      const left = centers[i] - halfW;
      if (left < lastVisibleRight) {
        select(node).style('visibility', 'hidden');
      } else {
        lastVisibleRight = centers[i] + halfW;
      }
    });
  }

  private renderBars(
    chart: ChartGroup,
    data: ChartDataPoint[],
    xScale: ScaleBand<string>,
    yScale: ScaleLinear<number, number>,
    height: number,
    container: HTMLDivElement,
    tooltip: TooltipDiv
  ): void {
    chart.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('fill', '#673ab7')
      .attr('x', (_: ChartDataPoint, i: number) => xScale(String(i)) ?? 0)
      .attr('y', (p: ChartDataPoint) => yScale(p.sum))
      .attr('width', xScale.bandwidth())
      .attr('height', (p: ChartDataPoint) => Math.max(height - yScale(p.sum), 0))
      .on('mouseenter', (event: MouseEvent, p: ChartDataPoint) => {
        select(event.target as Element).attr('fill', '#9c6fe4').attr('filter', 'brightness(1.15)');
        const rect = container.getBoundingClientRect();
        const sumText = `${p.sum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
        const detailText = p.paiddate ? timeFormat('%d.%m.%Y')(p.paiddate) : p.label;
        tooltip.html(`<div>${sumText}</div>${detailText ? `<div style="font-size:0.75rem;font-weight:400;margin-top:2px">${detailText}</div>` : ''}`);
        tooltip
          .style('left', `${this.tooltipLeft(event, container, tooltip)}px`)
          .style('top', `${event.clientY - rect.top - 28}px`)
          .style('opacity', '1');
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style('left', `${this.tooltipLeft(event, container, tooltip)}px`)
          .style('top', `${event.clientY - rect.top - 28}px`);
      })
      .on('mouseleave', (event: MouseEvent) => {
        select(event.target as Element).attr('fill', '#673ab7').attr('filter', null);
        tooltip.style('opacity', '0');
      });
  }

  private tooltipLeft(event: MouseEvent, container: HTMLDivElement, tooltip: TooltipDiv): number {
    const rect = container.getBoundingClientRect();
    const tooltipWidth = (tooltip.node() as HTMLElement).offsetWidth;
    const rawLeft = event.clientX - rect.left + 12;
    return rawLeft + tooltipWidth > container.clientWidth
      ? event.clientX - rect.left - tooltipWidth - 12
      : rawLeft;
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || !this.chartContainer()) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.drawChart());
    this.resizeObserver.observe(this.chartContainer()!.nativeElement);
  }

  private disconnectObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
}
