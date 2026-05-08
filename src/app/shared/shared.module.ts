import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { ChartCardComponent } from './components/chart-card/chart-card.component';
import { GaugeChartComponent } from './components/gauge-chart/gauge-chart.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { FilterPanelComponent } from './components/filter-panel/filter-panel.component';
import { FormatMoneyPipe } from './pipes/format-money.pipe';

@NgModule({
  declarations: [
    KpiCardComponent,
    ChartCardComponent,
    GaugeChartComponent,
    SidebarComponent,
    TopbarComponent,
    LoadingSpinnerComponent,
    FilterPanelComponent,
    FormatMoneyPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    KpiCardComponent,
    ChartCardComponent,
    GaugeChartComponent,
    SidebarComponent,
    TopbarComponent,
    LoadingSpinnerComponent,
    FilterPanelComponent,
    FormatMoneyPipe
  ]
})
export class SharedModule {}
