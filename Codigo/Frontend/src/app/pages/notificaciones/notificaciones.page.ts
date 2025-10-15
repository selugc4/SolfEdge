import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../services/auth.service';
import { Notificacion } from '../../models/notificacion.model';
import { IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardContent } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardContent]
})
export class NotificacionesPage implements OnInit {
  notificaciones: Notificacion[] = [];
  userId: string | null = null;
  notificacionService: NotificacionService = inject(NotificacionService);
  authService: AuthService = inject(AuthService);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      if (this.userId) {
        this.loadNotificaciones();
      }
    });
  }

  loadNotificaciones() {
    if (!this.userId) return;
    this.notificacionService.getNotificacionesByUsuario(this.userId).subscribe(notificaciones => {
      this.notificaciones = notificaciones;
    });
  }

  marcarComoLeida(notificacion: Notificacion) {
    this.notificacionService.marcarComoLeida(notificacion._id).subscribe(() => {
      notificacion.leida = true;
    });
  }

  // Lógica para navegar a recursos interactivos se añadiría aquí
}
