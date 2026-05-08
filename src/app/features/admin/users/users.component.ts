import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { AddUserDialogComponent } from './add-user-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  displayedColumns = ['id', 'username', 'email', 'role', 'dashboard', 'created_at', 'actions'];
  users: User[] = [];
  loading = true;
  error = '';
  currentUserId: number | null = null;

  dashboardColors: Record<string, { bg: string; color: string }> = {
    competition:  { bg: '#E3F2FD', color: '#1565C0' },
    performance:  { bg: '#E0F2F1', color: '#00695C' },
    tournaments:  { bg: '#EDE7F6', color: '#6A1B9A' },
    equipments:   { bg: '#FFF3E0', color: '#E65100' }
  };

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?.id ?? null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.http.get<{ users: User[] }>(`${environment.apiUrl}/api/auth/users`).subscribe({
      next: res => { this.users = res.users; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Failed to load users.'; }
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(AddUserDialogComponent, { width: '460px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.http.post(`${environment.apiUrl}/api/auth/users`, result).subscribe({
          next: () => {
            this.snackBar.open('User created successfully.', 'Close', { duration: 3000, panelClass: ['snack-success'] });
            this.loadUsers();
          },
          error: () => {
            this.snackBar.open('Failed to create user.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    const snack = this.snackBar.open(`Delete user "${user.username}"?`, 'Confirm', { duration: 5000 });
    snack.onAction().subscribe(() => {
      this.http.delete(`${environment.apiUrl}/api/auth/users/${user.id}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted.', 'Close', { duration: 3000, panelClass: ['snack-success'] });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Failed to delete user.', 'Close', { duration: 3000, panelClass: ['snack-error'] });
        }
      });
    });
  }

  getDashboardStyle(dashboard: string | null): { bg: string; color: string } {
    if (!dashboard) return { bg: '#F5F5F5', color: '#757575' };
    return this.dashboardColors[dashboard] ?? { bg: '#F5F5F5', color: '#757575' };
  }

  getDashboardLabel(dashboard: string | null): string {
    return dashboard ?? 'All';
  }

  trackById(_: number, user: User): number { return user.id; }
}
