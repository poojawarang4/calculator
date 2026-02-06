import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LumpsumPageRoutingModule } from './lumpsum-routing.module';
import { LumpsumComponent } from './lumpsum.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LumpsumPageRoutingModule
  ],
  declarations: [LumpsumComponent],
  exports: [LumpsumComponent]
})
export class LumpsumPageModule {}
