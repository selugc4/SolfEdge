import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MensajeService } from '../../services/mensaje.service';
import { AuthService } from '../../services/auth.service';
import { Mensaje } from '../../models/mensaje.model';
import { IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonLabel, IonCard, IonCardContent, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButtons, IonMenuButton, IonToolbar, IonHeader, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardContent, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent]
})
export class MensajesPage implements OnInit {
  mensajes: Mensaje[] = [];
  userId: string | null = null;
  mensajeService: MensajeService = inject(MensajeService);
  authService: AuthService = inject(AuthService);
  isLoading: boolean = true;
  currentPage = 1;

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      if (this.userId) {
        this.loadMensajes();
      } else {
        this.isLoading = false;
      }
    });
  }

  loadMensajes(event?: InfiniteScrollCustomEvent) {
    if (!this.userId) {
      this.isLoading = false;
      if (event) event.target.complete();
      return;
    }

    this.mensajeService.getMensajesByUsuario(this.userId, this.currentPage).subscribe(response => {
      this.mensajes.push(...response.mensajes);
      this.isLoading = false;
      if (event) {
        event.target.complete();
        if (response.page >= response.pages) {
          event.target.disabled = true;
        }
      }
    });
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.currentPage++;
    this.loadMensajes(event);
  }

  isLeido(mensaje: Mensaje): boolean {
    if (!this.userId || !mensaje.destinatarios) return false;
    const destinatario = mensaje.destinatarios.find(d => d.usuario._id === this.userId);
    return destinatario ? destinatario.leida : false;
  }

  marcarComoLeido(mensaje: Mensaje) {
    if (!this.userId) return;

    // Check if the message is already read by the current user
    if (this.isLeido(mensaje)) return;

    this.mensajeService.marcarComoLeido(mensaje._id, this.userId).subscribe(() => {
      // Update the local state of the message
      const destinatario = mensaje.destinatarios.find(d => d.usuario._id === this.userId);
      if (destinatario) {
        destinatario.leida = true;
      }
    });
  }
}
