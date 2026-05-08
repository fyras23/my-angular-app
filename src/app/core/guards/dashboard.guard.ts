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
    // Redirect to home — user will see the animated court and can click their hotspot
    return this.router.createUrlTree(['/home']);
  }
}
