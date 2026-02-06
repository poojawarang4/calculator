import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StepupComponent } from './stepup.component';


const routes: Routes = [
  {
    path: '',
    component: StepupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StepupPageRoutingModule {}
