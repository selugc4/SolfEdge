import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionAlumnosComponent } from '../../components/gestion-alumnos/gestion-alumnos.component';
import { GestionGruposComponent } from '../../components/gestion-grupos/gestion-grupos.component';
import { IonIcon, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonSpinner, ModalController, ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { GrupoStateService } from '../../services/grupo-state.service';
import { CalificacionGeneralService } from '../../services/calificacion-general.service';
import { sendOutline, ribbonOutline, peopleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalComponent } from '../../components/mensaje-modal/mensaje-modal.component';
import { CalificacionGeneralModalComponent } from '../../components/calificacion-general-modal/calificacion-general-modal.component';
import { GestionGrupoModalComponent } from '../../components/gestion-grupo-modal/gestion-grupo-modal.component';
import { Grupo } from '../../models/grupo.model';

@Component({
  selector: 'app-professor-admin-page',
  templateUrl: './professor-admin.page.html',
  styleUrls: ['./professor-admin.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, GestionAlumnosComponent, GestionGruposComponent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonButton, IonIcon, IonSpinner]
})
export class ProfessorAdminPage implements OnInit {
  userId: string | null = null;
  selectedGrupo: Grupo | null = null;

  isLoading: boolean = true;
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  grupoStateService: GrupoStateService = inject(GrupoStateService);
  calificacionGeneralService: CalificacionGeneralService = inject(CalificacionGeneralService);
  mensajeService: MensajeService = inject(MensajeService);
  modalController: ModalController = inject(ModalController);
  toastController: ToastController = inject(ToastController);

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.userId = user?._id || null;
      this.isLoading = false;
    });
    this.grupoStateService.selectedGrupo$.subscribe(grupo => {
      this.selectedGrupo = grupo;
    });
  }
  constructor() {
    addIcons({
      'send-outline': sendOutline,
      'ribbon-outline': ribbonOutline,
      'people-outline': peopleOutline
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
          await this.presentToast(`Calificación '${calificacion.tipo}' guardada para ${data.alumnoUsername}.`);
        },
        error: async (err) => {
          console.error('Error al guardar calificación general:', err);
          const errorMessage = err.error && err.error.error ? err.error.error : 'Error al guardar la calificación general.';
          await this.presentToast(errorMessage, 'danger');
        }
      });
    }
  }

  async presentGestionGrupoModal() {
    if (!this.selectedGrupo) {
      await this.presentToast('Por favor, selecciona un grupo primero.', 'warning');
      return;
    }

    const modal = await this.modalController.create({
      component: GestionGrupoModalComponent,
      componentProps: {
        selectedGrupo: this.selectedGrupo
      }
    });
    modal.present();

    const { role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.grupoStateService.refreshGrupos();
      this.grupoStateService.grupos$.subscribe(grupos => {
        if (grupos.length > 0) {
          this.grupoStateService.setSelectedGrupo(grupos[0]);
        } else {
          this.grupoStateService.setSelectedGrupo(null);
        }
      });
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({ message, duration: 3000, color });
    toast.present();
  }
}
