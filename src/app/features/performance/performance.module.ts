import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PerformanceComponent } from './performance.component';

@NgModule({
  declarations: [PerformanceComponent],
  imports: [SharedModule, RouterModule]
})
export class PerformanceModule {}
