import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginResponse, RefreshResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  currentUser$ = new BehaviorSubject<User | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API}/api/auth/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_KEY, res.access_token);
        localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.currentUser$.next(res.user);
      })
    );
  }

  logout(): void {
    const token = this.getAccessToken();
    if (token) {
      this.http.post(`${this.API}/api/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.clearTokens();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    return this.http.post<RefreshResponse>(
      `${this.API}/api/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_KEY, res.access_token);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  getUser(): User | null {
    return this.currentUser$.value;
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  /** Returns the user's assigned dashboard, or null for admins */
  getDashboard(): string | null {
    return this.getUser()?.dashboard ?? null;
  }

  /** Admin can access everything; regular users only their assigned dashboard */
  canAccess(dashboard: string): boolean {
    return this.isAdmin() || this.getDashboard() === dashboard;
  }

  /** Returns the post-login redirect route — everyone goes to /home */
  getHomeRoute(): string {
    const user = this.getUser();
    if (!user) return '/login';
    return '/home';
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
