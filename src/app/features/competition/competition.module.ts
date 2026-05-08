import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CompetitionComponent } from './competition.component';

@NgModule({
  declarations: [CompetitionComponent],
  imports: [SharedModule, RouterModule]
})
export class CompetitionModule {}
