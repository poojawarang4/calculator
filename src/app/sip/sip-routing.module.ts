import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SipComponent } from './sip.component';


const routes: Routes = [
  {
    path: '',
    component: SipComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SipPageRoutingModule {}
