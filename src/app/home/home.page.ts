import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  constructor(private navCtrl: NavController) { }

  goToCalculator(type: string) {
    if (type === 'sip') {
      this.navCtrl.navigateForward('/sip');
    } else if (type === 'emi') {
      this.navCtrl.navigateForward('/emi');
    } else if (type === 'step') {
      this.navCtrl.navigateForward('/step');
    } else if (type === 'swp') {
      this.navCtrl.navigateForward('/swp');
    }else if (type === 'lumpsum') {
      this.navCtrl.navigateForward('/lumpsum');
    }
  }

}
