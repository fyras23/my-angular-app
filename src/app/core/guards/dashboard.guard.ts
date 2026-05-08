import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class DashboardGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const required = route.data['dashboard'] as string;
    if (this.authService.canAccess(required)) {
      return true;
    }
    const userDash = this.authService.getDashboard();
    return this.router.createUrlTree([userDash ? `/${userDash}` : '/home']);
  }
}
