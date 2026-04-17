import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, effect, inject, input, viewChild } from '@angular/core';
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select, timeFormat } from 'd3';
import { Payment } from 'projects/model/src/lib/model';
import { ThemeService } from 'projects/tools/src/public-api';

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

  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.chartContainer(); // track so effect re-runs once the view is ready
      this.payments();
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
    if (!container) {
      return;
    }

    const data = this.paidPayments();
    container.innerHTML = '';

    if (!data.length) {
      return;
    }

    const isDark = this.themeService.darkMode();
    const textColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const axisTickColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    const separatorColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    const tooltipBg = isDark ? 'rgba(40,35,60,0.97)' : 'rgba(255,252,220,0.95)';
    const tooltipColor = isDark ? 'rgba(255,255,255,0.87)' : '#1a1a1a';
    const tooltipBorder = isDark ? '1px solid rgba(180,130,255,0.3)' : '1px solid rgba(103,58,183,0.25)';

    const margin = { top: 20, right: 12, bottom: 30, left: 48 };
    const width = Math.max(container.clientWidth - margin.left - margin.right, 0);
    const height = 260 - margin.top - margin.bottom;

    const svg = select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const tooltip = select(container)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('opacity', '0')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('padding', '8px 12px')
      .style('background', tooltipBg)
      .style('color', tooltipColor)
      .style('border', tooltipBorder)
      .style('border-radius', '8px')
      .style('font-size', '0.85rem')
      .style('font-weight', '600')
      .style('box-shadow', '0 4px 16px rgba(0, 0, 0, 0.18)')
      .style('white-space', 'nowrap')
      .style('z-index', '1000')
      .style('transition', 'opacity 150ms ease');

    // Use per-payment index as scale key to avoid collisions when the same
    // "day month" label appears in multiple years (e.g. "15 sty" in 2024 and 2025).
    const xDomain = data.map((_, i) => String(i));
    const xScale = scaleBand<string>()
      .domain(xDomain)
      .range([0, width])
      .padding(0.2);

    const maxValue = max(data, (payment: Payment) => payment.sum) ?? 0;
    const yScale = scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([height, 0]);

    const yAxis = axisLeft(yScale).ticks(4).tickFormat((value: any) => `${value}`);
    const yAxisGroup = chart.append('g');
    yAxis(yAxisGroup as any);
    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('.tick text').style('fill', axisTickColor);
    yAxisGroup.selectAll('.tick line').style('stroke', separatorColor);

    const xAxis = axisBottom(xScale).tickSize(0).tickFormat(() => '');
    const xAxisGroup = chart.append('g')
      .attr('transform', `translate(0,${height})`);
    xAxis(xAxisGroup as any);
    xAxisGroup.select('.domain').style('stroke', separatorColor);

    // Year annotation row below primary tick labels.
    // Track first/last index per year so x-positions use the unique index-based scale.
    const yearFormat = timeFormat('%Y');
    const yearBounds = new Map<string, { first: number; last: number }>();
    data.forEach((p, i) => {
      const year = yearFormat(p.deadline instanceof Date ? p.deadline : new Date(p.deadline as any));
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
        .attr('x', cx)
        .attr('y', yearLabelY)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.75rem')
        .style('fill', textColor)
        .text(year)
        .node() as SVGTextElement;
      yearLabelNodes.push(node);
      yearLabelCenters.push(cx);
    });

    // Greedy left-to-right: hide label if it overlaps the previous visible one
    const padding = 6;
    let lastVisibleRight = -Infinity;
    yearLabelNodes.forEach((node, i) => {
      const halfW = (node.getComputedTextLength() / 2) + padding;
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
      const xPrevEnd = (xScale(String(prevBounds.last)) ?? 0) + xScale.bandwidth();
      const xCurrStart = xScale(String(currBounds.first)) ?? 0;
      const xSep = (xPrevEnd + xCurrStart) / 2;
      chart.append('line')
        .attr('x1', xSep).attr('x2', xSep)
        .attr('y1', height + 2).attr('y2', yearLabelY + 8)
        .style('stroke', separatorColor)
        .style('stroke-width', '1');
    }

    chart.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('fill', '#673ab7')
      .attr('x', (_: Payment, i: number) => xScale(String(i)) ?? 0)
      .attr('y', (payment: Payment) => yScale(payment.sum))
      .attr('width', xScale.bandwidth())
      .attr('height', (payment: Payment) => Math.max(height - yScale(payment.sum), 0))
      .on('mouseenter', (event: MouseEvent, payment: Payment) => {
        select(event.target as Element)
          .attr('fill', '#9c6fe4')
          .attr('filter', 'brightness(1.15)');
        const rect = container.getBoundingClientRect();
        const sumText = `${payment.sum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
        const dateText = payment.paiddate ? timeFormat('%d.%m.%Y')(payment.paiddate) : '';
        tooltip
          .html(`<div>${sumText}</div>${dateText ? `<div style="font-size:0.75rem;font-weight:400;margin-top:2px">${dateText}</div>` : ''}`);
        const tooltipWidth = (tooltip.node() as HTMLElement).offsetWidth;
        const rawLeft = event.clientX - rect.left + 12;
        const left = rawLeft + tooltipWidth > container.clientWidth ? event.clientX - rect.left - tooltipWidth - 12 : rawLeft;
        tooltip
          .style('left', `${left}px`)
          .style('top', `${event.clientY - rect.top - 28}px`)
          .style('opacity', '1');
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const tooltipWidth = (tooltip.node() as HTMLElement).offsetWidth;
        const rawLeft = event.clientX - rect.left + 12;
        const left = rawLeft + tooltipWidth > container.clientWidth ? event.clientX - rect.left - tooltipWidth - 12 : rawLeft;
        tooltip
          .style('left', `${left}px`)
          .style('top', `${event.clientY - rect.top - 28}px`);
      })
      .on('mouseleave', (event: MouseEvent) => {
        select(event.target as Element)
          .attr('fill', '#673ab7')
          .attr('filter', null);
        tooltip.style('opacity', '0');
      });
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
