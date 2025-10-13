import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { SharedHeaderComponent } from '../components/shared-header/shared-header.component';

@Component({
  selector: 'app-audicion',
  templateUrl: 'audicion.page.html',
  styleUrls: ['audicion.page.scss'],
  standalone: true,
  imports: [IonContent, ExploreContainerComponent, SharedHeaderComponent],
})
export class AudicionPage {
  constructor() {}
}
