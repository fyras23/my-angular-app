import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-dialog',
  template: `
    <h2 mat-dialog-title>Add New User</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="Enter email" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="Enter password" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" (selectionChange)="onRoleChange($event.value)">
            <mat-option value="user">User</mat-option>
            <mat-option value="admin">Admin</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width" *ngIf="form.get('role')?.value === 'user'">
          <mat-label>Dashboard Access</mat-label>
          <mat-select formControlName="dashboard">
            <mat-option value="competition">Competition</mat-option>
            <mat-option value="performance">Performance</mat-option>
            <mat-option value="tournaments">Tournaments</mat-option>
            <mat-option value="equipments">Equipments</mat-option>
          </mat-select>
          <mat-hint>Required for user role</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="submit()">Create User</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .full-width { width: 100%; }
  `]
})
export class AddUserDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', Validators.required],
      dashboard: ['competition', Validators.required]
    });
  }

  onRoleChange(role: string): void {
    const dashCtrl = this.form.get('dashboard');
    if (role === 'admin') {
      dashCtrl?.setValue(null);
      dashCtrl?.clearValidators();
    } else {
      dashCtrl?.setValue('competition');
      dashCtrl?.setValidators(Validators.required);
    }
    dashCtrl?.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.valid) {
      const value = { ...this.form.value };
      if (value.role === 'admin') value.dashboard = null;
      this.dialogRef.close(value);
    }
  }
}
