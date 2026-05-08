import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Feature Modules
import { AuthModule } from './features/auth/auth.module';
import { ShellModule } from './features/shell/shell.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { CompetitionModule } from './features/competition/competition.module';
import { PerformanceModule } from './features/performance/performance.module';
import { TournamentsModule } from './features/tournaments/tournaments.module';
import { EquipmentsModule } from './features/equipments/equipments.module';
import { AdminModule } from './features/admin/admin.module';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    AppRoutingModule,
    AuthModule,
    ShellModule,
    DashboardModule,
    CompetitionModule,
    PerformanceModule,
    TournamentsModule,
    EquipmentsModule,
    AdminModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
