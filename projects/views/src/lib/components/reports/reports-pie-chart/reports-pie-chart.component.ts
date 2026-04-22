import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, inject, input, viewChild } from '@angular/core';
import { ThemeService } from '@bills/tools';
import { arc, pie, select } from 'd3';

export interface PieSegment {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-reports-pie-chart',
  standalone: true,
  templateUrl: './reports-pie-chart.component.html',
  styleUrls: ['./reports-pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsPieChartComponent implements AfterViewInit, OnDestroy {

  segments = input<PieSegment[]>([]);
  label = input('');

  chartContainer = viewChild<ElementRef<HTMLDivElement>>('pieChart');

  private themeService = inject(ThemeService);
  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.chartContainer();
      this.segments();
      this.themeService.darkMode();
      this.drawChart();
    });
  }

  ngAfterViewInit(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => this.drawChart());
    this.resizeObserver.observe(container);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private drawChart(): void {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    container.innerHTML = '';
    const segs = this.segments().filter(s => s.value > 0);
    if (!segs.length) return;

    const isDark = this.themeService.darkMode();
    const textColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.72)';
    const subtleColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.42)';
    const tooltipBg = isDark ? 'rgba(40,35,60,0.97)' : 'rgba(255,252,220,0.95)';
    const tooltipBorder = isDark ? '1px solid rgba(180,130,255,0.3)' : '1px solid rgba(103,58,183,0.25)';
    const strokeColor = isDark ? '#1e1e1e' : '#fff';

    const maxSize = 220;
    const availW = container.clientWidth || maxSize;
    const availH = container.clientHeight || maxSize;
    const size = Math.min(availW, availH, maxSize);
    const radius = size / 2;
    const innerRadius = radius * 0.52;

    const svg = select(container)
      .append('svg')
      .attr('width', size)
      .attr('height', size)
      .append('g')
      .attr('transform', `translate(${radius},${radius})`);

    const pieGen = pie<PieSegment>().value(d => d.value).sort(null);
    const arcGen = arc<any>().innerRadius(innerRadius).outerRadius(radius - 4);
    const arcHover = arc<any>().innerRadius(innerRadius).outerRadius(radius + 4);

    const total = segs.reduce((s, d) => s + d.value, 0);

    const tooltip = select(container)
      .append('div')
      .style('opacity', '0')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('padding', '6px 10px')
      .style('background', tooltipBg)
      .style('color', textColor)
      .style('border', tooltipBorder)
      .style('border-radius', '8px')
      .style('font-size', '0.82rem')
      .style('font-weight', '600')
      .style('white-space', 'nowrap')
      .style('z-index', '1000')
      .style('transition', 'opacity 120ms ease');

    svg.selectAll<SVGPathElement, ReturnType<typeof pieGen>[0]>('path')
      .data(pieGen(segs))
      .join('path')
      .attr('d', arcGen)
      .attr('fill', d => d.data.color)
      .attr('stroke', strokeColor)
      .attr('stroke-width', 2)
      .on('mouseenter', function (event: MouseEvent, d) {
        select(this).transition().duration(120).attr('d', arcHover as any);
        const pct = ((d.data.value / total) * 100).toFixed(1);
        const sumText = d.data.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        tooltip
          .html(`<div>${d.data.name}</div><div style="font-size:0.75rem;font-weight:400;margin-top:2px">${sumText} zł (${pct}%)</div>`)
          .style('left', `${event.offsetX + 14}px`)
          .style('top', `${event.offsetY - 14}px`)
          .style('opacity', '1');
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.style('left', `${event.offsetX + 14}px`).style('top', `${event.offsetY - 14}px`);
      })
      .on('mouseleave', function () {
        select(this).transition().duration(120).attr('d', arcGen as any);
        tooltip.style('opacity', '0');
      });

    const totalFormatted = total.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.15em')
      .style('font-size', '0.88rem')
      .style('font-weight', '700')
      .style('fill', textColor)
      .text(`${totalFormatted} zł`);

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .style('font-size', '0.7rem')
      .style('fill', subtleColor)
      .text('łącznie');
  }
}
