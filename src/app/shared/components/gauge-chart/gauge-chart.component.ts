import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip);

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value = 0;
  @Input() label = '';
  @Input() color = '#1565C0';
  @Input() loading = false;

  @ViewChild('gaugeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.canvasRef) {
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef) return;
    const capped = Math.min(this.value, 100);
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [capped, 100 - capped],
          backgroundColor: [this.color, '#E3F2FD'],
          borderWidth: 0,
          circumference: 180,
          rotation: 270
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          tooltip: { enabled: false },
          legend: { display: false }
        },
        animation: { duration: 600 }
      }
    });
  }
}
