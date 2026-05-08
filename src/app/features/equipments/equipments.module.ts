import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EquipmentsComponent } from './equipments.component';

@NgModule({
  declarations: [EquipmentsComponent],
  imports: [SharedModule, RouterModule]
})
export class EquipmentsModule {}
