import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select, timeFormat } from 'd3';
import { Payment } from 'projects/model/src/lib/model';

@Component({
  selector: 'app-payments-chart',
  standalone: true,
  templateUrl: './payments-chart.component.html',
  styleUrls: ['./payments-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsChartComponent implements AfterViewInit, OnDestroy {

  private _payments: Payment[] = [];

  @Input() set payments(value: Payment[]) {
    this._payments = value || [];
    this.drawChart();
  }

  get payments(): Payment[] {
    return this._payments;
  }

  @Input() billName = '';
  @ViewChild('chart', { static: false }) chartContainer?: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;
  private readonly formatLabel = timeFormat('%-d %b');

  ngAfterViewInit(): void {
    this.drawChart();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
  }

  get paidPayments(): Payment[] {
    return (this.payments || [])
      .filter(payment => payment.paiddate && payment.deadline)
      .slice()
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  private drawChart(): void {
    const container = this.chartContainer?.nativeElement;
    if (!container) {
      return;
    }

    const data = this.paidPayments;
    container.innerHTML = '';

    if (!data.length) {
      return;
    }

    const margin = { top: 20, right: 12, bottom: 50, left: 48 };
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
      .style('background', 'rgba(255, 252, 220, 0.95)')
      .style('color', '#1a1a1a')
      .style('border', '1px solid rgba(103, 58, 183, 0.25)')
      .style('border-radius', '8px')
      .style('font-size', '0.85rem')
      .style('font-weight', '600')
      .style('box-shadow', '0 4px 16px rgba(0, 0, 0, 0.18)')
      .style('white-space', 'nowrap')
      .style('z-index', '1000')
      .style('transition', 'opacity 150ms ease');

    const xDomain = data.map(payment => this.formatLabel(payment.deadline));
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

    const xAxis = axisBottom(xScale).tickSizeOuter(0);
    const xAxisGroup = chart.append('g')
      .attr('transform', `translate(0,${height})`);
    xAxis(xAxisGroup as any);
    xAxisGroup.selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.6em')
      .attr('dy', '0.25em');

    chart.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('fill', '#673ab7')
      .attr('x', (payment: Payment) => xScale(this.formatLabel(payment.deadline)) ?? 0)
      .attr('y', (payment: Payment) => yScale(payment.sum))
      .attr('width', xScale.bandwidth())
      .attr('height', (payment: Payment) => Math.max(height - yScale(payment.sum), 0))
      .on('mouseenter', (event: MouseEvent, payment: Payment) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .text(`${payment.sum.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`)
          .style('left', `${event.clientX - rect.left + 12}px`)
          .style('top', `${event.clientY - rect.top - 28}px`)
          .style('opacity', '1');
      })
      .on('mousemove', (event: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style('left', `${event.clientX - rect.left + 12}px`)
          .style('top', `${event.clientY - rect.top - 28}px`);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', '0');
      });
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || !this.chartContainer) {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => this.drawChart());
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private disconnectObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }
}
