import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { StepupPageRoutingModule } from './stepup-routing.module';
import { StepupComponent } from './stepup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StepupPageRoutingModule
  ],
  declarations: [StepupComponent],
  exports: [StepupComponent]
})
export class StepupPageModule {}
