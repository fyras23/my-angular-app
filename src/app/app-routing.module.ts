import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { ShellComponent } from './features/shell/shell.component';
import { HomeComponent } from './features/dashboard/home/home.component';
import { CompetitionComponent } from './features/competition/competition.component';
import { PerformanceComponent } from './features/performance/performance.component';
import { TournamentsComponent } from './features/tournaments/tournaments.component';
import { EquipmentsComponent } from './features/equipments/equipments.component';
import { UsersComponent } from './features/admin/users/users.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { DashboardGuard } from './core/guards/dashboard.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      {
        path: 'competition',
        component: CompetitionComponent,
        canActivate: [DashboardGuard],
        data: { dashboard: 'competition' }
      },
      {
        path: 'performance',
        component: PerformanceComponent,
        canActivate: [DashboardGuard],
        data: { dashboard: 'performance' }
      },
      {
        path: 'tournaments',
        component: TournamentsComponent,
        canActivate: [DashboardGuard],
        data: { dashboard: 'tournaments' }
      },
      {
        path: 'equipments',
        component: EquipmentsComponent,
        canActivate: [DashboardGuard],
        data: { dashboard: 'equipments' }
      },
      {
        path: 'admin/users',
        component: UsersComponent,
        canActivate: [AdminGuard]
      }
    ]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
