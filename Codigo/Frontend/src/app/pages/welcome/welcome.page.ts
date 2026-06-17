import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonHeader, IonToolbar, IonTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { rocketOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  template: `
    <ion-header>
      <ion-toolbar style="text-align: center;">
        <ion-title>SolfEdge</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center;">
        <h1>Bienvenido a SolfEdge</h1>
        <p>Esta aplicación te ayudará a gestionar tu aprendizaje musical.</p>
        <ion-button (click)="proceedToLogin()" color="medium">
          <ion-icon slot="start" name="rocket-outline"></ion-icon>
          ¿Empezamos?
        </ion-button>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonButton, IonHeader, IonToolbar, IonTitle, IonIcon]
})
export class WelcomePage {
  constructor(private router: Router) {
    addIcons({ rocketOutline });
  }

  proceedToLogin() {
    localStorage.setItem('hasSeenWelcome', 'true');
    this.router.navigate(['/login']);
  }
}
