import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TournamentsComponent } from './tournaments.component';

@NgModule({
  declarations: [TournamentsComponent],
  imports: [SharedModule, RouterModule]
})
export class TournamentsModule {}
