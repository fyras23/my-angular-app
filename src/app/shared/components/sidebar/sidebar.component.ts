import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  dashboard?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() collapsed = new EventEmitter<boolean>();

  isCollapsed = false;
  currentUser: User | null = null;

  navItems: NavItem[] = [
    { label: 'Home',        icon: 'home',          route: '/home' },
    { label: 'Competition', icon: 'emoji_events',  route: '/competition', dashboard: 'competition' },
    { label: 'Performance', icon: 'trending_up',   route: '/performance', dashboard: 'performance' },
    { label: 'Tournaments', icon: 'calendar_today',route: '/tournaments', dashboard: 'tournaments' },
    { label: 'Equipments',  icon: 'sports_tennis', route: '/equipments',  dashboard: 'equipments' },
    { label: 'Users',       icon: 'group',         route: '/admin/users', adminOnly: true }
  ];

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      this.isCollapsed = saved === 'true';
      this.collapsed.emit(this.isCollapsed);
    }
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebar_collapsed', String(this.isCollapsed));
    this.collapsed.emit(this.isCollapsed);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  logout(): void {
    this.authService.logout();
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item => {
      if (item.adminOnly) return this.authService.isAdmin();
      if (item.dashboard) return this.authService.canAccess(item.dashboard);
      return true; // Home is visible to everyone
    });
  }

  trackByRoute(_: number, item: NavItem): string {
    return item.route;
  }
}
