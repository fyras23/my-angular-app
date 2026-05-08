import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TournamentsService } from '../../core/services/tournaments.service';
import { FilterService } from '../../core/services/filter.service';
import { FilterParams, TournamentFilters } from '../../core/models/filter.model';
import { FilterConfig } from '../../shared/components/filter-panel/filter-panel.component';
import { FormatMoneyPipe } from '../../shared/pipes/format-money.pipe';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement, Tooltip, Legend
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';

  playersPerTournament = 0;
  winRate = 0;
  totalPrize = 0;

  filterConfig: FilterConfig = {};
  activeFilters: FilterParams = {};

  private charts: Chart[] = [];
  private fmt = new FormatMoneyPipe();

  constructor(private svc: TournamentsService, private filterSvc: FilterService) {}

  ngOnInit(): void {
    this.filterSvc.getTournamentFilters().subscribe({
      next: (f: TournamentFilters) => {
        this.filterConfig = {
          showYear: true, showCountry: true, showCategory: true, showDateRange: true,
          years: f.years, countries: f.countries, categories: f.categories
        };
      },
      error: () => {
        this.filterConfig = {
          showYear: true, showCountry: true, showCategory: true, showDateRange: true,
          years: [2024, 2025], countries: [], categories: ['Major', 'Finals', 'P1', 'P2']
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
      prizeByCategory: this.svc.getPrizeByCategory(f),
      top10: this.svc.getTop10Prize(f),
      byCountry: this.svc.getByCountry(f),
      byCategory: this.svc.getByCategory(f)
    }).subscribe({
      next: data => {
        this.playersPerTournament = data.summary.players_per_tournament;
        this.winRate = data.summary.win_rate;
        this.totalPrize = data.summary.total_prize;
        this.loading = false;
        setTimeout(() => {
          this.buildPrizeByCategoryChart(data.prizeByCategory.data);
          this.buildByCategoryDonut(data.byCategory.data);
          this.buildTop10Chart(data.top10.data);
          this.buildByCountryChart(data.byCountry.data);
          this.buildDualAxisChart(data.prizeByCategory.data, data.byCategory.data);
        }, 50);
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load tournament data.';
      }
    });
  }

  private buildPrizeByCategoryChart(data: any[]): void {
    const canvas = document.getElementById('prizeCatChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const colors = ['#1565C0', '#42A5F5', '#0d47a1', '#1976D2'];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.category),
        datasets: [{
          label: 'Prize Money',
          data: data.map(d => d.prize),
          backgroundColor: colors,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: { label: (ctx) => this.fmt.transform(ctx.raw as number) }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: '#E3F2FD' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildByCategoryDonut(data: any[]): void {
    const canvas = document.getElementById('catDonutChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const colors = ['#1565C0', '#42A5F5', '#E91E8C', '#0d47a1'];
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildTop10Chart(data: any[]): void {
    const canvas = document.getElementById('top10TournChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const sorted = [...data].sort((a, b) => b.prize - a.prize);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: sorted.map(d => d.name),
        datasets: [{
          label: 'Prize',
          data: sorted.map(d => d.prize),
          backgroundColor: '#1565C0',
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: { label: (ctx) => this.fmt.transform(ctx.raw as number) }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#E3F2FD' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildByCountryChart(data: any[]): void {
    const canvas = document.getElementById('countryPrizeChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const blues = ['#0d47a1', '#1565C0', '#1976D2', '#1E88E5', '#42A5F5'];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.country),
        datasets: [{
          label: 'Prize',
          data: data.map(d => d.prize),
          backgroundColor: blues.slice(0, data.length),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,71,161,0.9)',
            callbacks: { label: (ctx) => this.fmt.transform(ctx.raw as number) }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            grid: { color: '#E3F2FD' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildDualAxisChart(prizeData: any[], catData: any[]): void {
    const canvas = document.getElementById('dualAxisChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const labels = catData.map(d => d.category);
    const prizeMap: Record<string, number> = {};
    prizeData.forEach(d => prizeMap[d.category] = d.prize);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Players', data: catData.map(d => d.count), backgroundColor: '#42A5F5', borderRadius: 4, yAxisID: 'y' },
          { label: 'Prize', data: labels.map(l => prizeMap[l] || 0), backgroundColor: '#1565C0', borderRadius: 4, yAxisID: 'y1' }
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
          y: { beginAtZero: true, position: 'left', grid: { color: '#E3F2FD' }, title: { display: true, text: 'Players' } },
          y1: {
            beginAtZero: true, position: 'right', grid: { drawOnChartArea: false },
            title: { display: true, text: 'Prize (M)' },
            ticks: { callback: (v) => this.fmt.transform(v as number) }
          }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  get totalPrizeFmt(): string { return this.fmt.transform(this.totalPrize); }
}
