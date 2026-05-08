import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CompetitionService } from '../../core/services/competition.service';
import { FilterService } from '../../core/services/filter.service';
import { FilterParams, CompetitionFilters } from '../../core/models/filter.model';
import { FilterConfig } from '../../shared/components/filter-panel/filter-panel.component';
import { FormatMoneyPipe } from '../../shared/pipes/format-money.pipe';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement, Tooltip, Legend
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale,
  DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.css']
})
export class CompetitionComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';

  totalPlayers = 0;
  revenue2024 = 0;
  revenue2025 = 0;
  totalMatches = 0;
  winRate = 0;

  filterConfig: FilterConfig = {};
  activeFilters: FilterParams = {};

  private charts: Chart[] = [];
  private fmt = new FormatMoneyPipe();

  constructor(private svc: CompetitionService, private filterSvc: FilterService) {}

  ngOnInit(): void {
    this.filterSvc.getCompetitionFilters().subscribe({
      next: (f: CompetitionFilters) => {
        this.filterConfig = {
          showYear: true,
          showCountry: true,
          showGender: true,
          showDateRange: true,
          years: f.years,
          countries: f.countries,
          genders: f.genders
        };
      },
      error: () => {
        // Fallback defaults if filter endpoint fails
        this.filterConfig = {
          showYear: true, showCountry: true, showGender: true, showDateRange: true,
          years: [2024, 2025], countries: [], genders: ['Men', 'Women']
        };
      }
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  onFiltersChanged(params: FilterParams): void {
    this.activeFilters = params;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    const f = this.activeFilters;
    forkJoin({
      players: this.svc.getTotalPlayers(f),
      revenue: this.svc.getRevenue(f),
      matches: this.svc.getTotalMatches(f),
      outcomes: this.svc.getMatchOutcomes(f),
      periods: this.svc.getTopPeriods(f),
      gender: this.svc.getGenderSplit(f),
      countries: this.svc.getTop5Countries(f),
      winRate: this.svc.getWinRate(f)
    }).subscribe({
      next: (data) => {
        this.totalPlayers = data.players.total_players;
        this.revenue2024 = data.revenue.revenue_2024;
        this.revenue2025 = data.revenue.revenue_2025;
        this.totalMatches = data.matches.total_matches;
        this.winRate = data.winRate.win_rate;
        this.loading = false;
        setTimeout(() => {
          this.buildOutcomesChart(data.outcomes.data);
          this.buildGenderChart(data.gender.men, data.gender.women);
          this.buildPeriodsChart(data.periods.data);
          this.buildCountriesChart(data.countries.data);
        }, 50);
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load competition data.';
      }
    });
  }

  private buildOutcomesChart(data: any[]): void {
    const canvas = document.getElementById('outcomesChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.month),
        datasets: [
          { label: 'Wins', data: data.map(d => d.wins), backgroundColor: '#1565C0', borderRadius: 4 },
          { label: 'Losses', data: data.map(d => d.losses), backgroundColor: '#E91E8C', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' }
        },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#E3F2FD' } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildGenderChart(men: number, women: number): void {
    const canvas = document.getElementById('genderChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Men', 'Women'],
        datasets: [{ data: [men, women], backgroundColor: ['#1565C0', '#E91E8C'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' }
        },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildPeriodsChart(data: any[]): void {
    const canvas = document.getElementById('periodsChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const data2024 = data.filter(d => d.year === 2024);
    const data2025 = data.filter(d => d.year === 2025);
    const allLabels = [...new Set([...data2024.map(d => d.month), ...data2025.map(d => d.month)])];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: allLabels,
        datasets: [
          { label: '2024', data: data2024.map(d => d.total), backgroundColor: '#42A5F5', borderRadius: 4 },
          { label: '2025', data: data2025.map(d => d.total), backgroundColor: '#1565C0', borderRadius: 4 }
        ]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' }
        },
        scales: { x: { beginAtZero: true, grid: { color: '#E3F2FD' } }, y: { grid: { display: false } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildCountriesChart(data: any[]): void {
    const canvas = document.getElementById('countriesChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    const blues = ['#0d47a1', '#1565C0', '#1976D2', '#1E88E5', '#42A5F5'];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.country),
        datasets: [{ label: 'Tournaments', data: data.map(d => d.count), backgroundColor: blues.slice(0, data.length), borderRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#E3F2FD' } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  get revenue2025Fmt(): string { return this.fmt.transform(this.revenue2025); }
  get revenue2024Fmt(): string { return this.fmt.transform(this.revenue2024); }
  get totalMatchesFmt(): string { return this.totalMatches.toLocaleString(); }
}
