import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ElementRef, ViewChild, HostListener, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { PerformanceService } from '../../../core/services/performance.service';
import { TournamentsService } from '../../../core/services/tournaments.service';
import { EquipmentsService } from '../../../core/services/equipments.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../../core/models/user.model';

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  stat: string;
  exploding: boolean;
  opacity: number;
}

interface Hotspot {
  id: string;
  label: string;
  emoji: string;
  cx: number;
  cy: number;
  color: string;
  lightColor: string;
  route: string;
  stats: string[];
  hovered: boolean;
}

interface TickerItem {
  icon: string;
  text: string;
}

// Court bounds (SVG viewBox 0 0 1000 500)
const COURT = { x: 40, y: 30, w: 920, h: 440 };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('courtContainer') courtContainer!: ElementRef<HTMLDivElement>;

  currentUser: User | null = null;
  balls: Ball[] = [];
  tickerItems: TickerItem[] = [];
  hoveredBall: Ball | null = null;
  hoveredHotspot: Hotspot | null = null;
  netClickCount = 0;
  easterEggActive = false;
  parallaxX = 0;
  parallaxY = 0;
  isMobile = false;
  isTablet = false;

  hotspots: Hotspot[] = [
    {
      id: 'competition', label: 'Competition', emoji: '🏆',
      cx: 250, cy: 125, color: '#1565C0', lightColor: '#42A5F5',
      route: '/competition',
      stats: ['309 Total Players', '5,000 Matches Played', '63.49% Win Rate'],
      hovered: false
    },
    {
      id: 'performance', label: 'Performance', emoji: '📈',
      cx: 750, cy: 125, color: '#00897B', lightColor: '#4DB6AC',
      route: '/performance',
      stats: ['Top: Arturo Coello (90 wins)', '215.87% Player Growth', '73.28% Consistency'],
      hovered: false
    },
    {
      id: 'tournaments', label: 'Tournaments', emoji: '📅',
      cx: 250, cy: 375, color: '#6A1B9A', lightColor: '#AB47BC',
      route: '/tournaments',
      stats: ['940.95M Total Prize', '64.15% Win Rate', '202 Players / Tournament'],
      hovered: false
    },
    {
      id: 'equipments', label: 'Equipments', emoji: '🎒',
      cx: 750, cy: 375, color: '#E65100', lightColor: '#FF8A65',
      route: '/equipments',
      stats: ['129.24K Market Revenue', '92.30M Product Revenue', '27 Active Players'],
      hovered: false
    }
  ];

  private animFrame: number | null = null;
  private tickerRefreshTimer: any = null;
  private mouseMoveTimer: any = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private snackBar: MatSnackBar,
    private competitionSvc: CompetitionService,
    private performanceSvc: PerformanceService,
    private tournamentsSvc: TournamentsService,
    private equipmentsSvc: EquipmentsService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.checkBreakpoint();
    this.initBalls();
    this.loadTickerData();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.startAnimation();
    });
  }

  ngOnDestroy(): void {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    if (this.tickerRefreshTimer) clearInterval(this.tickerRefreshTimer);
    if (this.mouseMoveTimer) clearTimeout(this.mouseMoveTimer);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkBreakpoint();
    this.cdr.markForCheck();
  }

  private checkBreakpoint(): void {
    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
  }

  // ─── BALLS ───────────────────────────────────────────────────────────────

  private initBalls(): void {
    const count = this.isMobile ? 0 : this.isTablet ? 6 : 10;
    const ballStats = [
      '90 wins — Arturo Coello', '940.95M total prize', '309 active players',
      '64.15% win rate', '5,000 matches played', '215.87% player growth',
      '73.28% consistency', 'Top vendor: Bullpadel', 'Top country: Spain',
      '202 players / tournament'
    ];
    const colors = [
      { c: '#FFD600', g: '#FF6D00' }, { c: '#42A5F5', g: '#1565C0' },
      { c: '#E91E8C', g: '#880E4F' }, { c: '#69F0AE', g: '#00897B' },
      { c: '#FF8A65', g: '#E65100' }, { c: '#CE93D8', g: '#6A1B9A' }
    ];
    this.balls = Array.from({ length: count }, (_, i) => {
      const col = colors[i % colors.length];
      const speed = 0.8 + Math.random() * 1.4;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        x: COURT.x + 80 + Math.random() * (COURT.w - 160),
        y: COURT.y + 40 + Math.random() * (COURT.h - 80),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 7 + Math.random() * 5,
        color: col.c,
        glowColor: col.g,
        stat: ballStats[i % ballStats.length],
        exploding: false,
        opacity: 1
      };
    });
  }

  private startAnimation(): void {
    const animate = () => {
      this.updateBalls();
      this.ngZone.run(() => this.cdr.markForCheck());
      this.animFrame = requestAnimationFrame(animate);
    };
    this.animFrame = requestAnimationFrame(animate);
  }

  private updateBalls(): void {
    for (const ball of this.balls) {
      if (ball.exploding) continue;
      ball.x += ball.vx;
      ball.y += ball.vy;
      // Bounce off court walls
      if (ball.x - ball.radius < COURT.x) { ball.x = COURT.x + ball.radius; ball.vx = Math.abs(ball.vx); }
      if (ball.x + ball.radius > COURT.x + COURT.w) { ball.x = COURT.x + COURT.w - ball.radius; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - ball.radius < COURT.y) { ball.y = COURT.y + ball.radius; ball.vy = Math.abs(ball.vy); }
      if (ball.y + ball.radius > COURT.y + COURT.h) { ball.y = COURT.y + COURT.h - ball.radius; ball.vy = -Math.abs(ball.vy); }
    }
  }

  trackBall(_: number, ball: Ball): number { return ball.id; }

  onBallHover(ball: Ball): void {
    this.hoveredBall = ball;
    this.cdr.markForCheck();
  }

  onBallLeave(): void {
    this.hoveredBall = null;
    this.cdr.markForCheck();
  }

  onBallClick(ball: Ball): void {
    ball.exploding = true;
    ball.opacity = 0;
    setTimeout(() => {
      // Respawn from random edge
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { ball.x = COURT.x + ball.radius; ball.y = COURT.y + Math.random() * COURT.h; }
      else if (edge === 1) { ball.x = COURT.x + COURT.w - ball.radius; ball.y = COURT.y + Math.random() * COURT.h; }
      else if (edge === 2) { ball.x = COURT.x + Math.random() * COURT.w; ball.y = COURT.y + ball.radius; }
      else { ball.x = COURT.x + Math.random() * COURT.w; ball.y = COURT.y + COURT.h - ball.radius; }
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.4;
      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      ball.exploding = false;
      ball.opacity = 1;
      this.cdr.markForCheck();
    }, 600);
    this.cdr.markForCheck();
  }

  // ─── HOTSPOTS ─────────────────────────────────────────────────────────────

  onHotspotHover(hs: Hotspot): void {
    hs.hovered = true;
    this.hoveredHotspot = hs;
    this.cdr.markForCheck();
  }

  onHotspotLeave(hs: Hotspot): void {
    hs.hovered = false;
    this.hoveredHotspot = null;
    this.cdr.markForCheck();
  }

  navigateTo(hs: Hotspot): void {
    if (!this.authService.canAccess(hs.id)) {
      const dash = this.authService.getDashboard();
      this.snackBar.open(
        `Access denied — your dashboard is ${dash ?? 'home'}`,
        'OK', { duration: 3000, panelClass: ['snack-error'] }
      );
      return;
    }
    this.router.navigate([hs.route]);
  }

  onHotspotKeydown(event: KeyboardEvent, hs: Hotspot): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateTo(hs);
    }
  }

  canAccess(id: string): boolean {
    return this.authService.canAccess(id);
  }

  // ─── NET EASTER EGG ───────────────────────────────────────────────────────

  onNetClick(): void {
    this.netClickCount++;
    if (this.netClickCount >= 5) {
      this.netClickCount = 0;
      this.triggerEasterEgg();
    }
  }

  private triggerEasterEgg(): void {
    this.easterEggActive = true;
    // Explode all balls
    this.balls.forEach(b => { b.exploding = true; b.opacity = 0; });
    setTimeout(() => {
      this.balls.forEach(b => { b.exploding = false; b.opacity = 1; });
      this.easterEggActive = false;
      this.cdr.markForCheck();
    }, 1200);
    this.snackBar.open('🎉 Easter Egg Unlocked! You found the secret!', '🏆', { duration: 4000 });
    this.cdr.markForCheck();
  }

  // ─── PARALLAX ─────────────────────────────────────────────────────────────

  onMouseMove(event: MouseEvent): void {
    if (this.isMobile) return;
    clearTimeout(this.mouseMoveTimer);
    this.mouseMoveTimer = setTimeout(() => {
      const el = this.courtContainer?.nativeElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.parallaxX = ((event.clientX - cx) / rect.width) * 6;
      this.parallaxY = ((event.clientY - cy) / rect.height) * 4;
      this.cdr.markForCheck();
    }, 16);
  }

  onMouseLeave(): void {
    this.parallaxX = 0;
    this.parallaxY = 0;
    this.cdr.markForCheck();
  }

  get courtTransform(): string {
    return `perspective(1000px) rotateY(${this.parallaxX}deg) rotateX(${-this.parallaxY}deg)`;
  }

  // ─── TICKER ───────────────────────────────────────────────────────────────

  private loadTickerData(): void {
    // Default ticker while loading
    this.tickerItems = [
      { icon: '🎾', text: 'Loading live stats...' }
    ];

    forkJoin({
      players: this.competitionSvc.getTotalPlayers(),
      matches: this.competitionSvc.getTotalMatches(),
      winRate: this.competitionSvc.getWinRate(),
      top10: this.performanceSvc.getTop10Wins(),
      summary: this.tournamentsSvc.getSummary(),
      countries: this.competitionSvc.getTop5Countries()
    }).subscribe({
      next: data => {
        const topPlayer = data.top10.data?.[0];
        const topCountry = data.countries.data?.[0];
        const prize = data.summary.total_prize;
        const prizeStr = prize >= 1_000_000 ? (prize / 1_000_000).toFixed(2) + 'M' : prize.toLocaleString();

        this.tickerItems = [
          { icon: '🏃', text: `${data.players.total_players.toLocaleString()} Total Players` },
          { icon: '⚔️', text: `${data.matches.total_matches.toLocaleString()} Matches Played` },
          { icon: '💰', text: `${prizeStr} Total Prize Money` },
          { icon: '🏆', text: `${data.winRate.win_rate}% Win Rate` },
          { icon: '⭐', text: topPlayer ? `Top Player: ${topPlayer.name} (${topPlayer.wins} wins)` : 'Top Players Ranked' },
          { icon: '🌍', text: topCountry ? `Top Country: ${topCountry.country} (${topCountry.count} tournaments)` : 'Global Tournaments' },
          { icon: '📊', text: `${data.summary.players_per_tournament} Players / Tournament` },
          { icon: '🎾', text: 'Padel Analytics — Data That Plays To Win' }
        ];
        this.cdr.markForCheck();
      },
      error: () => {
        this.tickerItems = [
          { icon: '🏃', text: '309 Total Players' },
          { icon: '⚔️', text: '5,000 Matches Played' },
          { icon: '💰', text: '940.95M Prize Money' },
          { icon: '🏆', text: '64.15% Win Rate' },
          { icon: '⭐', text: 'Top Player: Arturo Coello (90 wins)' },
          { icon: '🌍', text: 'Top Country: Spain' },
          { icon: '🎾', text: 'Padel Analytics — Data That Plays To Win' }
        ];
        this.cdr.markForCheck();
      }
    });

    // Refresh every 30s
    this.tickerRefreshTimer = setInterval(() => this.loadTickerData(), 30000);
  }

  trackTicker(_: number, item: TickerItem): string { return item.text; }
  trackHotspot(_: number, hs: Hotspot): string { return hs.id; }

  get dashboardBadgeColor(): string {
    const map: Record<string, string> = {
      competition: '#1565C0', performance: '#00897B',
      tournaments: '#6A1B9A', equipments: '#E65100'
    };
    return map[this.currentUser?.dashboard ?? ''] ?? '#757575';
  }
}
