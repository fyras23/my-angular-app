import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent {
  sidebarCollapsed = false;
  pageTitle = 'Dashboard';
  isHomePage = false;

  private titleMap: Record<string, string> = {
    '/home': 'Home',
    '/competition': 'Competition',
    '/performance': 'Performance',
    '/tournaments': 'Tournaments',
    '/equipments': 'Equipments',
    '/admin/users': 'User Management'
  };

  constructor(private router: Router) {
    const update = (url: string) => {
      this.pageTitle = this.titleMap[url] || 'Dashboard';
      this.isHomePage = url === '/home';
    };
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => update(e.urlAfterRedirects));
    update(this.router.url);
  }

  onSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}
