import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { PerformanceService } from '../../core/services/performance.service';
import { FilterService } from '../../core/services/filter.service';
import { FilterParams, PerformanceFilters } from '../../core/models/filter.model';
import { FilterConfig } from '../../shared/components/filter-panel/filter-panel.component';
import { PlayerSearchItem, PlayerStats, Top3OverviewItem } from '../../core/models/performance.model';
import {
  Chart, BarController, BarElement, CategoryScale, LinearScale,
  RadarController, RadialLinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale,
  RadarController, RadialLinearScale, PointElement, LineElement,
  Tooltip, Legend, Filler);

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';

  totalPlayers = 0;
  men = 0;
  women = 0;
  growthPercent = 0;
  consistency = 0;

  searchQuery = '';
  searchResults: PlayerSearchItem[] = [];
  selectedPlayer: PlayerStats | null = null;
  showDropdown = false;
  searchLoading = false;

  filterConfig: FilterConfig = {};
  activeFilters: FilterParams = {};

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];

  constructor(private svc: PerformanceService, private filterSvc: FilterService) {}

  ngOnInit(): void {
    this.filterSvc.getPerformanceFilters().subscribe({
      next: (f: PerformanceFilters) => {
        this.filterConfig = {
          showYear: true, showGender: true, showCountry: true, showPlayerName: true,
          years: f.years, genders: f.genders, countries: f.countries
        };
      },
      error: () => {
        this.filterConfig = {
          showYear: true, showGender: true, showCountry: true, showPlayerName: true,
          years: [2024, 2025], genders: ['Men', 'Women'], countries: []
        };
      }
    });

    this.loadData();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => { this.searchLoading = true; return this.svc.searchPlayers(q); }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: res => { this.searchResults = res.data; this.showDropdown = true; this.searchLoading = false; },
      error: () => { this.searchLoading = false; }
    });
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
    this.destroy$.next();
    this.destroy$.complete();
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
      kpis: this.svc.getKpis(f),
      top10: this.svc.getTop10Wins(f),
      top3: this.svc.getTop3Overview(f),
      growth: this.svc.getGrowth(f),
      consistency: this.svc.getConsistency(f)
    }).subscribe({
      next: data => {
        this.totalPlayers = data.kpis.total_players;
        this.men = data.kpis.men;
        this.women = data.kpis.women;
        this.growthPercent = data.growth.growth_percent;
        this.consistency = data.consistency.consistency;
        this.loading = false;
        setTimeout(() => {
          this.buildTop10Chart(data.top10.data);
          this.buildTop3Chart(data.top3.data);
          this.buildRadarChart(data.top3.data);
        }, 50);
      },
      error: () => { this.loading = false; this.error = 'Failed to load performance data.'; }
    });
  }

  onSearch(q: string): void {
    this.searchQuery = q;
    if (q.length >= 2) { this.searchSubject.next(q); }
    else { this.searchResults = []; this.showDropdown = false; }
  }

  selectPlayer(player: PlayerSearchItem): void {
    this.showDropdown = false;
    this.searchQuery = player.name;
    this.svc.getPlayerStats(player.id).subscribe({
      next: stats => { this.selectedPlayer = stats; },
      error: () => { this.selectedPlayer = null; }
    });
  }

  trackById(_: number, item: PlayerSearchItem): number { return item.id; }

  private buildTop10Chart(data: any[]): void {
    const canvas = document.getElementById('top10Chart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas); if (existing) existing.destroy();
    const sorted = [...data].sort((a, b) => b.wins - a.wins);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: sorted.map(d => d.name), datasets: [{ label: 'Wins', data: sorted.map(d => d.wins), backgroundColor: '#1565C0', borderRadius: 4 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' } },
        scales: { x: { beginAtZero: true, grid: { color: '#E3F2FD' } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildTop3Chart(data: Top3OverviewItem[]): void {
    const canvas = document.getElementById('top3Chart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas); if (existing) existing.destroy();
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.name),
        datasets: [
          { label: 'Matches', data: data.map(d => d.matches), backgroundColor: '#42A5F5', borderRadius: 4 },
          { label: 'Wins', data: data.map(d => d.wins), backgroundColor: '#1565C0', borderRadius: 4 },
          { label: 'Losses', data: data.map(d => d.losses), backgroundColor: '#E91E8C', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } }, tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#E3F2FD' } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }

  private buildRadarChart(data: Top3OverviewItem[]): void {
    const canvas = document.getElementById('radarChart') as HTMLCanvasElement;
    if (!canvas) return;
    const existing = Chart.getChart(canvas); if (existing) existing.destroy();
    const colors = ['rgba(21,101,192,0.4)', 'rgba(233,30,140,0.4)', 'rgba(66,165,245,0.4)'];
    const borderColors = ['#1565C0', '#E91E8C', '#42A5F5'];
    const datasets = data.map((p, i) => ({
      label: p.name,
      data: [p.matches, p.wins, p.losses, Math.round((p.wins / p.matches) * 100), 70],
      backgroundColor: colors[i], borderColor: borderColors[i], borderWidth: 2, pointBackgroundColor: borderColors[i]
    }));
    const chart = new Chart(canvas, {
      type: 'radar',
      data: { labels: ['Matches', 'Wins', 'Losses', 'Win Rate', 'Consistency'], datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } } }, tooltip: { backgroundColor: 'rgba(13,71,161,0.9)' } },
        scales: { r: { beginAtZero: true, grid: { color: '#E3F2FD' }, ticks: { font: { size: 10 } } } },
        animation: { duration: 600 }
      }
    });
    this.charts.push(chart);
  }
}
