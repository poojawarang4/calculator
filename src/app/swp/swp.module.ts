import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SWPPageRoutingModule } from './swp-routing.module';
import { SwpComponent } from './swp.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SWPPageRoutingModule
  ],
  declarations: [SwpComponent],
  exports: [SwpComponent]
})
export class SWPPageModule {}
