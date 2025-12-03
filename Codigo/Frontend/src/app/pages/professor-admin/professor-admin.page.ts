import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { MensajeService } from '../../services/mensaje.service';
import { CalificacionGeneralModalComponent } from '../../components/calificacion-general-modal/calificacion-general-modal.component';
import { ModalController, ToastController, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { IonIcon } from "@ionic/angular/standalone";
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { Grupo } from '../../models/grupo.model';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';

@Component({
  selector: 'app-professor-admin-page',
  templateUrl: './professor-admin.page.html',
  styleUrls: ['./professor-admin.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, GestionAlumnosComponent, GestionGruposComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon, IonSpinner]
})
export class ProfessorAdminPage implements OnInit {
  userId: string | null = null;
  selectedGrupo: Grupo | null = null;
  isLoading: boolean = true;

  authService: AuthService = inject(AuthService);
  modalController: ModalController = inject(ModalController);
  mensajeService: MensajeService = inject(MensajeService);
  toastController: ToastController = inject(ToastController);
  grupoStateService: GrupoStateService = inject(GrupoStateService);
  calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      this.isLoading = false;
    });

    this.grupoStateService.selectedGrupo$.subscribe(grupo => {
      this.selectedGrupo = grupo;
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
    if (!this.selectedGrupo) {
      await this.presentToast('Por favor, selecciona un grupo primero.', 'warning');
      return;
    }
    if (!this.userId) {
      await this.presentToast('Error: ID de profesor no disponible para calificar.', 'danger');
      return;
    }

    const modal = await this.modalController.create({
      component: CalificacionGeneralModalComponent,
      componentProps: {
        grupoId: this.selectedGrupo._id
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.calificacionGeneralService.crearOActualizarCalificacion(
        data.alumnoId,
        this.selectedGrupo._id,
        data.selectedTipo,
        data.nota,
        this.userId
      ).subscribe({
        next: async (calificacion) => {
          await this.presentToast(`Calificación '${calificacion.tipo}' guardada para ${calificacion.alumno.username}.`);
        },
        error: async (err) => {
          console.error('Error al guardar calificación general:', err);
          const errorMessage = err.error && err.error.error ? err.error.error : 'Error al guardar la calificación general.';
          await this.presentToast(errorMessage, 'danger');
        }
      });
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
