import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  musicalNotesOutline,
  micOutline,
  earOutline,
  schoolOutline,
  personCircleOutline,
  settingsOutline
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonIcon
  ]
})
export class LandingPage {
  private router = inject(Router);
  private authService = inject(AuthService);

  isProfessor = this.authService.currentUserValue?.role === 'profesor';

  constructor() {
    addIcons({
      musicalNotesOutline,
      micOutline,
      earOutline,
      schoolOutline,
      personCircleOutline,
      settingsOutline
    });
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
