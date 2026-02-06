import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SipComponent } from './sip.component';
import { SipPageRoutingModule } from './sip-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SipPageRoutingModule
  ],
  declarations: [SipComponent],
  exports: [SipComponent]
})
export class SipPageModule {}
