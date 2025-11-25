import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../services/notificacion.service';
import { AuthService } from '../../services/auth.service';
import { Notificacion } from '../../models/notificacion.model';
import { IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardContent, IonSpinner } from '@ionic/angular/standalone'; // Added IonSpinner
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardContent, IonSpinner] // Added IonSpinner
})
export class NotificacionesPage implements OnInit {
  notificaciones: Notificacion[] = [];
  userId: string | null = null;
  notificacionService: NotificacionService = inject(NotificacionService);
  authService: AuthService = inject(AuthService);
  isLoading: boolean = true; // Added isLoading

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      if (this.userId) {
        this.loadNotificaciones();
      } else {
        this.isLoading = false; // Set to false if no user
      }
    });
  }

  loadNotificaciones() {
    if (!this.userId) {
      this.isLoading = false; // Set to false if no user ID
      return;
    }
    this.notificacionService.getNotificacionesByUsuario(this.userId).subscribe(notificaciones => {
      this.notificaciones = notificaciones;
      this.isLoading = false; // Set to false after notifications are loaded
    });
  }

  marcarComoLeida(notificacion: Notificacion) {
    this.notificacionService.marcarComoLeida(notificacion._id).subscribe(() => {
      notificacion.leida = true;
    });
  }

  // Lógica para navegar a recursos interactivos se añadiría aquí
}
