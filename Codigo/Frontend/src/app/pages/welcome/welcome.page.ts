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
    <ion-content class="ion-padding" style="--padding-bottom: env(safe-area-inset-bottom);">
      <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; text-align: center; padding-bottom: 20px;">
        <h1>Bienvenido a SolfEdge</h1>
        <p>Desde aquí podrás gestionar tu aprendizaje musical interactuando con el material didáctico de las asignaturas como los libros del curso, las tareas o los cuestionarios asignados así como revisar tus calificaciones y mensajes.</p>
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
