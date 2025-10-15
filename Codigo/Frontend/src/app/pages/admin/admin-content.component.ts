import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { GestionProfesoresComponent } from '../../components/gestion-profesores/gestion-profesores.component';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';
import { CalificacionGeneralModalComponent } from '../../components/calificacion-general-modal/calificacion-general-modal.component';
import { ModalController, ToastController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-admin-content',
  templateUrl: './admin-content.component.html',
  styleUrls: ['./admin-content.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, GestionProfesoresComponent, GestionAlumnosComponent, GestionGruposComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon]
})
export class AdminContentComponent implements OnInit {
  userRole: string | undefined;
  userId: string | null = null;
  authService: AuthService = inject(AuthService);
  modalController: ModalController = inject(ModalController);
  mensajeService: MensajeService = inject(MensajeService);
  toastController: ToastController = inject(ToastController);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userRole = user?.role;
      this.userId = user?._id || null;
    });
  }

  async presentMensajeModal() {
    const modal = await this.modalController.create({
      component: MensajeModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (!this.userId) {
        this.presentToast('Error: ID de profesor no disponible.', 'danger');
        return;
      }
      this.mensajeService.crearMensaje(this.userId, data.asunto, data.texto, data.alumnoIds).subscribe({
        next: () => {
          this.presentToast('Mensaje enviado con éxito.');
        },
        error: (err) => {
          this.presentToast(`Error al enviar mensaje: ${err.error.message || err.message}`, 'danger');
        }
      });
    }
  }

  async presentCalificacionGeneralModal() {
    const modal = await this.modalController.create({
      component: CalificacionGeneralModalComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // Aquí iría la lógica para enviar la calificación general
      // PERO: No hay un endpoint en el backend para "calificaciones generales del curso".
      // Solo existen endpoints para calificar tareas y cuestionarios.
      this.presentToast('Funcionalidad pendiente: Requiere un endpoint en el backend para calificaciones generales.', 'warning');
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
