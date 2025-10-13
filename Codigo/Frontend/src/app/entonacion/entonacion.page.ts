import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';

@Component({
  selector: 'app-entonacion',
  templateUrl: 'entonacion.page.html',
  styleUrls: ['entonacion.page.scss'],
  standalone: true,
  imports: [IonContent, ExploreContainerComponent, SharedHeaderComponent]
})
export class EntonacionPage {

  constructor() {}

}
