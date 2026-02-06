import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'intro',
    pathMatch: 'full'
  },
  {
    path: 'emi',
    loadChildren: () => import('./emi/emi.module').then( m => m.EmiPageModule)
  },
   {
    path: 'sip',
    loadChildren: () => import('./sip/sip.module').then( m => m.SipPageModule)
  },
  {
    path: 'step',
    loadChildren: () => import('./stepup/steup.module').then( m => m.StepupPageModule)
  },
  {
    path: 'swp',
    loadChildren: () => import('./swp/swp.module').then( m => m.SWPPageModule)
  },
  {
    path: 'intro',
    loadChildren: () => import('./intro/intro.module').then( m => m.IntroPageModule)
  },
  {
    path: 'lumpsum',
    loadChildren: () => import('./lumpsum/lumpsum.module').then( m => m.LumpsumPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
