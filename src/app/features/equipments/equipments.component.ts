import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EquipmentsService } from '../../core/services/equipments.service';
import { FilterService } from '../../core/services/filter.service';
import { FilterParams, EquipmentFilters } from '../../core/models/filter.model';
import { FilterConfig } from '../../shared/components/filter-panel/filter-panel.component';
import { FormatMoneyPipe } from '../../shared/pipes/format-money.pipe';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  ScatterController, PointElement, LineElement,
  Tooltip, Legend
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale,
  ScatterController, PointElement, LineElement, Tooltip, Legend);

@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.component.html',
  styleUrls: ['./equipments.component.css']
})
export class EquipmentsComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';

  marketRevenue = 0;
  productRevenue = 0;
  activePlayers = 0;

  filterConfig: FilterConfig = {};
  activeFilters: FilterParams = {};

  private charts: Chart[] = [];
  private fmt = new FormatMoneyPipe();

  constructor(private svc: EquipmentsService, private filterSvc: FilterService) {}

  ngOnInit(): void {
    this.filterSvc.getEquipmentFilters().subscribe({
      next: (f: EquipmentFilters) => {
        this.filterConfig = {
          showVendor: true, showRacketType: true, showGameLevel: true,
          showYear: true, showPriceRange: true,
          vendors: f.vendors, racketTypes: f.racket_types,
          gameLevels: f.game_levels, years: f.years,
          priceMin: f.price_range?.min ?? 6.9,
          priceMax: f.price_range?.max ?? 799.9
        };
      },
      error: () => {
        this.filterConfig = {
          showVendor: true, showRacketType: true, showGameLevel: true,
          showYear: true, showPriceRange: true,
          vendors: ['Bullpadel', 'Head', 'Adidas', 'Siux', 'Nox'],
          racketTypes: ['attaque', 'polyvalente', 'défense'],
          gameLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
          years: [2023, 2024, 2025], priceMin: 6.9, priceMax: 799.9
        };
      }
    });
    this.loadData();
  }

  onFiltersChanged(params: FilterParams): void {
    this.activeFilters = params;
    this.loadData();
  }

  ngOnDestroy(): void { this.charts.forEach(c => c.destroy()); }

  loadData(): void {
    this.loading = true;
    this.error = '';
    const f = this.activeFilters;
    forkJoin({
      summary: this.svc.getSummary(f),
      revenueByVendor: this.svc.getRevenueByVendor(f),
      perfByPrice: this.svc.getPerformanceByPrice(f),
      top5: this.svc.getTop5Vendors(f),
      racket: this.svc.getRacketPerformance(f)
    }).subscribe({
      next: data => {
        this.marketRevenue = data.summary.market_revenue;
        this.productRevenue = data.summary.product_revenue;
        this.activePlayers = data.summary.active_players;
        this.loading = false;
        setTimeout(() => {
          this.buildRevenueByVendorChart(data.revenueByVendor.data);
          this.buildScatterChart(data.perfByPrice.data);
          this.buildTop5Chart(data.top5.data);
          this.buildRacketChart(data.racket.data);
        }, 50);
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load equipment data.';
      }
    });
  }

  private buildRevenueByVendorChart(data: any[]): void {
    const canvas = document.getElementById('vendorRevenueChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const vendors = [...new Set(data.map(d => d.vendor))];
    const years = [...new Set(data.map(d => d.year))].sort();
    const yearColors: Record<number, string> = { 2023: '#42A5F5', 2024: '#1565C0', 2025: '#0d47a1' };

    const datasets = years.map(year => ({
      label: String(year),
      data: vendors.map(v => {
        const item = data.find(d => d.vendor === v && d.year === year);
        return item ? item.revenue : 0;
      }),
      backgroundColor: yearColors[year] || '#1565C0',
      borderRadius: 4
    }));

    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: vendors, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: { label: (ctx) => `${ctx.dataset.label}: ${this.fmt.transform(ctx.raw as number)}` }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true, grid: { color: '#E3F2FD' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildScatterChart(data: any[]): void {
    const canvas = document.getElementById('scatterChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const types = [...new Set(data.map(d => d.type))];
    const typeColors: Record<string, string> = {
      'Polyvalente': '#1565C0',
      'Attaque': '#E91E8C',
      'Défense': '#FF8A65'
    };

    const datasets = types.map(type => ({
      label: type,
      data: data.filter(d => d.type === type).map(d => ({ x: d.price, y: d.win_rate })),
      backgroundColor: typeColors[type] || '#1565C0',
      pointRadius: 6
    }));

    const chart = new Chart(canvas, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: {
              label: (ctx) => {
                const raw = ctx.raw as { x: number; y: number };
                return `${ctx.dataset.label} — €${raw.x} | ${raw.y}% win rate`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: 'Price (€)' }, grid: { color: '#E3F2FD' } },
          y: { title: { display: true, text: 'Win Rate (%)' }, grid: { color: '#E3F2FD' } }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildTop5Chart(data: any[]): void {
    const canvas = document.getElementById('top5VendorChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const sorted = [...data].sort((a, b) => b.revenue_2025 - a.revenue_2025);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sorted.map(d => d.vendor),
        datasets: [
          { label: '2023', data: sorted.map(d => d.revenue_2023), backgroundColor: '#42A5F5', borderRadius: 4 },
          { label: '2024', data: sorted.map(d => d.revenue_2024), backgroundColor: '#1565C0', borderRadius: 4 },
          { label: '2025', data: sorted.map(d => d.revenue_2025), backgroundColor: '#0d47a1', borderRadius: 4 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: { label: (ctx) => `${ctx.dataset.label}: ${this.fmt.transform(ctx.raw as number)}` }
          }
        },
        scales: {
          x: {
            beginAtZero: true, grid: { color: '#E3F2FD' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          },
          y: { grid: { display: false } }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildRacketChart(data: any[]): void {
    const canvas = document.getElementById('racketChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();

    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.type),
        datasets: [
          { label: 'Actual', data: data.map(d => d.actual), backgroundColor: '#1565C0', borderRadius: 4 },
          {
            label: 'Target',
            data: data.map(d => d.target),
            backgroundColor: '#E3F2FD',
            borderColor: '#1565C0',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, max: 100, grid: { color: '#E3F2FD' } }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  get marketRevenueFmt(): string { return this.fmt.transform(this.marketRevenue); }
  get productRevenueFmt(): string { return this.fmt.transform(this.productRevenue); }
}
