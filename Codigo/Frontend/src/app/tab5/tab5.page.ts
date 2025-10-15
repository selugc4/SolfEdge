import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../models/usuario.model';
import { MensajeService } from '../services/mensaje.service';
import { Mensaje } from '../models/mensaje.model';
import { IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss'],
  standalone: true,
  imports: [CommonModule, IonButtons, IonMenuButton, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonText, IonList]
})
export class Tab5Page implements OnInit {
  currentUser: Usuario | null = null;
  mensajes: Mensaje[] = [];
  authService: AuthService = inject(AuthService);
  mensajeService: MensajeService = inject(MensajeService);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user?._id) {
        this.loadMensajes(user._id);
      }
    });
  }

  loadMensajes(userId: string) {
    this.mensajeService.getMensajesByUsuario(userId).subscribe(mensajes => {
      this.mensajes = mensajes;
    });
  }
}
